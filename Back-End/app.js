import express from 'express';
import userRoutes from './routes/user.js';
import mainRoutes from './routes/main.js';
import dotenv from 'dotenv';
import cors from 'cors';
import db from './dbConnection.js';
import { LiveTranscriptionEvents, createClient } from '@deepgram/sdk';
import {WebSocketServer} from 'ws';
import { chat, askAndrespond } from './gemini/gemini.js';
dotenv.config();

const app = express();

db.connect();

app.use(
	cors({
		origin: "http://localhost:5173",
		methods: "GET,POST,PUT,PATCH,DELETE",
		credentials: true,
	})
);

app.use(express.json());

app.use((req, res, next) => {
    console.log(req.path, req.method);
    next();
});


app.use("/api/user", userRoutes);

app.use('/api/home', mainRoutes);

app.listen(process.env.PORT, ()=>{
    console.log("listening on port 8080");
})

/* web socket code */
//creates an instance of the deepgram client to use to deepgram services
const deepgramClient = createClient(process.env.DEEPGRAM_APIKEY);
let keepAlive;
//creates a new web socket server to run on port 8081
const wss = new WebSocketServer({ port: 8081 });

//current message
let globalMessage = "";

//this will set up the deepgram web socket connection
//it will create listeners to events like sending of data opening of the 
//socket etc
const setupDeepgram = (ws) =>{
	//initiating the web socket handshake

	const deepgram = deepgramClient.listen.live({
		language: "en",
		punctuate: true,
		smart_format: true,
		model: "nova-2",		
		interim_results: true,
		utterance_end_ms: 1500
	});

	//keepAlive is a functionality to keep the websocket connection open
	//if its over 10 seconds and deepgram doesnt receieve any data it will automatically 
	//default to closing 
	if(keepAlive) {
		clearInterval(keepAlive);
	}

	keepAlive = setInterval(() =>{
		console.log("deepgram: keepalive");
		deepgram.keepAlive();
	}, 10 * 1000);

	//adds a listener to the deepgram object to add listeners on the successfuk
	//opening of the websocket connection
	deepgram.addListener(LiveTranscriptionEvents.Open, async () =>{
		console.log('deepgram connected');		

		//if a transcript is received from the socket server on the 
		//deepgram servers we hit this call back function 
		deepgram.addListener(LiveTranscriptionEvents.Transcript, async (data) =>{
			console.log("deepgram: packet received");
			console.log("deepgram: transcript received");
			console.log("socket: transcript sent to client");

			//send the string representation of the data to the frontend
			if (data.is_final) {
				let bestPrediction = 0;
				let foundIndex = 0;
				data.channel.alternatives.forEach((element, index) => {
					if(element.confidence > bestPrediction){
						foundIndex = index;
						bestPrediction = element.confidence;
					}
				});
				
				globalMessage += " " + data.channel.alternatives[foundIndex].transcript;
				ws.send(JSON.stringify(data.channel.alternatives[foundIndex]));
				console.log(data.channel.alternatives[foundIndex]);
				foundIndex = 0;
				bestPrediction = 0;
			}
		});

		deepgram.addListener(LiveTranscriptionEvents.UtteranceEnd, async (data) =>{
			//add in the gemini prompt here likely.
			console.log(data);
			askAndrespond(chat, globalMessage, ws, "message");
			globalMessage = "";
		})

		//handle close by closing the websocket connection and 
		//clearing the keepAlive interval function
		deepgram.addListener(LiveTranscriptionEvents.Close, async () => {
			console.log("deepgram: disconnected");
			clearInterval(keepAlive);
			deepgram.finish();
		});

		//handles error event from deepgram servers
		deepgram.addListener(LiveTranscriptionEvents.Error, async (error) => {
			console.log("deepgram: error received");
			console.error(error);
		});

		deepgram.addListener(LiveTranscriptionEvents.Warning, async (warning) => {
			console.log("deepgram: warning received");
			console.warn(warning);
		});

		//extra data on the live transcription event 
		deepgram.addListener(LiveTranscriptionEvents.Metadata, (data) => {
			console.log("deepgram: packet received");
			console.log("deepgram: metadata received");
			console.log("ws: metadata sent to client");
			ws.send(JSON.stringify({ metadata: data }));
		});
	});

	return deepgram;
}

wss.on('connection', (ws)=>{
	console.log('websocket connected on port 8081...');
	let deepgram = setupDeepgram(ws);

	const clearDeepgram = ()=>{
		if(deepgram !== null){
			deepgram.finish();
			deepgram.removeAllListeners();
			clearInterval(keepAlive);
			deepgram = null;
		}
	}

	const isJSON = (str) =>{
		try {
			JSON.parse(str);
			return true;
		} catch (e) {
			return false;
		}
	}

	ws.on('message', async (message) => {
		console.log("socket: client data received");
		
		if(isJSON(message)){
			try {
				const parsedMessage = JSON.parse(message);
				if (parsedMessage.type === 'end_deepgram_session') {
					console.log("socket: received end session message");
					clearDeepgram();
					askAndrespond(chat, globalMessage, ws, "end");
					globalMessage = "";
					return;
				} else if(parsedMessage.type == 'start_deepgram_session'){
					const introMessage = await askAndrespond(chat, globalMessage, ws, "intro");
					ws.send(introMessage);
				}
			} catch (e){
				console.log(e.message);
			}
		}else if(Buffer.isBuffer(message)){
			//Checking if the deepgram web socket is open
			if (deepgram !== null && deepgram.getReadyState() === 1 /* OPEN */) {
				console.log("socket: data sent to deepgram");
				//sends data from frontend to the deepgram servers
				deepgram.send(message);
			} else if (deepgram !== null && deepgram.getReadyState() >= 2 /* 2 = CLOSING, 3 = CLOSED */) {
				console.log("socket: data couldn't be sent to deepgram");
				console.log("socket: retrying connection to deepgram");
				/* Attempt to reopen the Deepgram connection */
				deepgram.finish();
				deepgram.removeAllListeners();
				deepgram = setupDeepgram(socket);
			} else {
				console.log("socket: data couldn't be sent to deepgram");
		  }
		}
	  })

	//close event for the socket
	ws.on("close", async () => {
		console.log("socket: client disconnected");

		//closes the connection
		clearDeepgram();
	  });
});