import express from 'express';
import userRoutes from './routes/user.js';
import mainRoutes from './routes/main.js';
import dotenv from 'dotenv';
import cors from 'cors';
import db from './dbConnection.js';
import { WebSocketServer } from 'ws';
import { chat, askAndrespond } from './gemini/gemini.js';
import { setupDeepgram } from './deepgram/deepgram.js';

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

const wss = new WebSocketServer({ port: 8081 });

wss.on('connection', (ws) => {
    console.log('websocket connected on port 8081...');
    ws.globalMessage = "";
    ws.chunkCount = 0;
	ws.keepAlive;
    ws.interupted;

    let deepgram = setupDeepgram(ws, askAndrespond, chat);

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
                } else if(parsedMessage.type == 'Gemini_Interupted'){
                    ws.interupted = parsedMessage.chunkText;
                }
            } catch (e) {
                console.log(e.message);
            }
        } else if (Buffer.isBuffer(message)) {
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

    ws.on("close", async () => {
        console.log("socket: client disconnected");
        clearDeepgram();
    });
});
