import express from 'express';
import userRoutes from './routes/user.js';
import mainRoutes from './routes/main.js';
import dotenv from 'dotenv';
import cors from 'cors';
import db from './dbConnection.js';
import { LiveTranscriptionEvents, createClient } from '@deepgram/sdk';
import { WebSocketServer } from 'ws';
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
app.use('/api/interview', mainRoutes);

app.listen(process.env.PORT, () => {
    console.log("listening on port 8080");
});

/* WebSocket code */
const deepgramClient = createClient(process.env.DEEPGRAM_APIKEY);

const wss = new WebSocketServer({ port: 8081 });

const setupDeepgram = (ws) => {
    const deepgram = deepgramClient.listen.live({
        language: "en",
        punctuate: true,
        smart_format: true,
        model: "nova-2",
        interim_results: true,
        utterance_end_ms: 1500
    });

    if (ws.keepAlive) {
        clearInterval(ws.keepAlive);
    }

    ws.keepAlive = setInterval(() => {
        console.log("deepgram: keepalive");
        deepgram.keepAlive();
    }, 10 * 1000);

    deepgram.addListener(LiveTranscriptionEvents.Open, async () => {
        console.log('deepgram connected');

        deepgram.addListener(LiveTranscriptionEvents.Transcript, async (data) => {
            console.log("deepgram: packet received");
            console.log("deepgram: transcript received");
            console.log("socket: transcript sent to client");

            if (data.is_final) {
                let bestPrediction = 0;
                let foundIndex = 0;
                data.channel.alternatives.forEach((element, index) => {
                    if (element.confidence > bestPrediction) {
                        foundIndex = index;
                        bestPrediction = element.confidence;
                    }
                });

                ws.globalMessage += " " + data.channel.alternatives[foundIndex].transcript;
                ws.send(JSON.stringify(data.channel.alternatives[foundIndex]));
            }
        });

        deepgram.addListener(LiveTranscriptionEvents.UtteranceEnd, async (data) => {
            console.log(data);
            askAndrespond(chat, ws.globalMessage, ws, "message", ws.chunkCount);
            ws.globalMessage = "";
        });

        deepgram.addListener(LiveTranscriptionEvents.Close, async () => {
            console.log("deepgram: disconnected");
            clearInterval(keepAlive);
            deepgram.finish();
        });

        deepgram.addListener(LiveTranscriptionEvents.Error, async (error) => {
            console.log("deepgram: error received");
            console.error(error);
        });

        deepgram.addListener(LiveTranscriptionEvents.Warning, async (warning) => {
            console.log("deepgram: warning received");
            console.warn(warning);
        });

        deepgram.addListener(LiveTranscriptionEvents.Metadata, (data) => {
            console.log("deepgram: packet received");
            console.log("deepgram: metadata received");
            console.log("ws: metadata sent to client");
            ws.send(JSON.stringify({ metadata: data }));
        });
    });

    return deepgram;
}

wss.on('connection', (ws) => {
    console.log('websocket connected on port 8081...');
    ws.globalMessage = "";
    ws.chunkCount = 0;
	ws.keepAlive;

    let deepgram = setupDeepgram(ws);

    const clearDeepgram = () => {
        if (deepgram !== null) {
            deepgram.finish();
            deepgram.removeAllListeners();
            clearInterval(ws.keepAlive);
            deepgram = null;
        }
    }

    const isJSON = (str) => {
        try {
            JSON.parse(str);
            return true;
        } catch (e) {
            return false;
        }
    }

    ws.on('message', async (message) => {
        console.log("socket: client data received");

        if (isJSON(message)) {
            try {
                const parsedMessage = JSON.parse(message);
                if (parsedMessage.type === 'end_deepgram_session') {
                    console.log("socket: received end session message");
                    clearDeepgram();
                    askAndrespond(chat, ws.globalMessage, ws, "end", ws.chunkCount);
                    ws.globalMessage = "";
                    ws.chunkCount = 0;
                    return;
                } else if (parsedMessage.type == 'start_deepgram_session') {
                    const introMessage = await askAndrespond(chat, ws.globalMessage, ws, "intro", ws.chunkCount);
                    ws.send(introMessage);
                }
            } catch (e) {
                console.log(e.message);
            }
        } else if (Buffer.isBuffer(message)) {
            if (deepgram !== null && deepgram.getReadyState() === 1) {
                console.log("socket: data sent to deepgram");
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

    ws.on("close", async () => {
        console.log("socket: client disconnected");
        clearDeepgram();
    });
});
