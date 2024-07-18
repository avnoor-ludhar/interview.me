import express from 'express';
import userRoutes from './routes/user.js';
import mainRoutes from './routes/main.js';
import dotenv from 'dotenv';
import cors from 'cors';
import db from './dbConnection.js';
import { WebSocketServer } from 'ws';
import { chat, askAndrespond } from './gemini/gemini.js';
import { setupDeepgram, clearDeepgram } from './deepgram/deepgram.js';

//configuring dotenv fild
dotenv.config();

//creates an express backend
const app = express();

//connection to the database which is set up in the dbConnection.js file
db.connect();

//middleware for cors which is a package that allows us to access the backend 
//from the origin listed or it is usually blocked for safety concerns
app.use(
    cors({
        origin: "http://localhost:5173",
        methods: "GET,POST,PUT,PATCH,DELETE",
        credentials: true,
    })
);

//middleware that parses data coming into the route handlers to JSON
app.use(express.json());

//middleware to log requests
app.use((req, res, next) => {
    console.log(req.path, req.method);
    next();
});

//just a way to configure a route to which we have a set of route handlers for some task
//in this case userRoutes are routes related to authentication
app.use("/api/user", userRoutes);
app.use('/api/interview', mainRoutes);

//Server listening on port listed in env file
app.listen(process.env.PORT, () => {
    console.log(`listening on port ${process.env.PORT}`);
});

//web socket server created
const wss = new WebSocketServer({ port: 8081 });

//iniital handshake of the websocket server 
wss.on('connection', (ws) => {
    console.log('websocket connected on port 8081...');
    //variables connected with this specific web socket connection
    ws.globalMessage = "";
    ws.chunkCount = 0;
	ws.keepAlive;
    ws.interupted;

    //variable that holds the connection to deepgram
    let deepgram = setupDeepgram(ws, askAndrespond, chat);

    //utility function to handle different messages from the front-end
    const isJSON = (str) => {
        try {
            JSON.parse(str);
            return true;
        } catch (e) {
            return false;
        }
    }

    //message event on the websocket when a message is sent via the websocket it fires this callback function
    ws.on('message', async (message) => {
        console.log("socket: client data received");

        if (isJSON(message)) {
            try {
                //parses the JSON message
                const parsedMessage = JSON.parse(message);
                //kills connectin with deepgram
                if (parsedMessage.type === 'end_deepgram_session') {
                    console.log("socket: received end session message");
                    clearDeepgram(ws, deepgram);
                    askAndrespond(chat, ws.globalMessage, ws, "end", ws.chunkCount);
                    ws.globalMessage = "";
                    ws.chunkCount = 0;
                    return;
                } else if (parsedMessage.type == 'start_deepgram_session') {
                    //starts connection
                    const introMessage = await askAndrespond(chat, ws.globalMessage, ws, "intro", ws.chunkCount);
                    ws.send(introMessage);
                } else if(parsedMessage.type == 'Gemini_Interupted'){
                    //interuption flag so that we can fire this type of message from the backend
                    ws.interupted = parsedMessage.chunkText;
                }
            } catch (e) {
                console.log(e.message);
            }
        } else if (Buffer.isBuffer(message)) {
            //checks if the deepgram websocket connection is read to take messages
            if (deepgram !== null && deepgram.getReadyState() === 1) {
                deepgram.send(message);
            } else if (deepgram !== null && deepgram.getReadyState() >= 2) {
                console.log("socket: data couldn't be sent to deepgram");
                console.log("socket: retrying connection to deepgram");
                deepgram.finish();
                deepgram.removeAllListeners();
                deepgram = setupDeepgram(socket);
            } else {
                console.log("socket: data couldn't be sent to deepgram");
            }
        }
    });

    //clean up on the websocket closing
    ws.on("close", async () => {
        console.log("socket: client disconnected");
        clearDeepgram(ws, deepgram);
    });
});
