import express from 'express';
import userRoutes from './routes/user.js';
import mainRoutes from './routes/main.js';
import dotenv from 'dotenv';
import cors from 'cors';
import db from './dbConnection.js';
import cookieParser from 'cookie-parser';
import { WebSocketServer } from 'ws';
import { chat, askAndrespond } from './gemini/gemini.js';
import { setupDeepgram } from './deepgram/deepgram.js';
import jwt from 'jsonwebtoken';

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
//middleware that parses cookies attached to the client request object('makes it easy to access cookie values)
//allows us to access our cookies via req.cookies 
app.use(cookieParser());

app.use((req, res, next) => {
    console.log(req.path, req.method);
    next();
});

app.use("/api/user", userRoutes);
app.use('/api/interview', mainRoutes);

app.listen(process.env.PORT, () => {
    console.log("listening on port 8080");
});

const s = app.listen(process.env.WEBSOCKET_PORT, ()=>{
    console.log(`Listening on port ${process.env.WEBSOCKET_PORT}`)
})

function onSocketPreError(e){
    console.log(e);
}

// Cookie header is a long string that contains multiple key-value pairs,
// each representing a cookie.
// Example cookie header: accessToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9; userId=12345; theme=dark

// This function is designed to parse the cookie header string into an object
const parseCookies = (cookieHeader) => {
    const list = {};
    
    // Check if cookieHeader exists and split it by ';' to get individual cookies
    cookieHeader && cookieHeader.split(';').forEach((cookie) => {
        // Split each cookie string by '=' to get key-value pairs
        const parts = cookie.split('=');
        
        // parts.shift() gets the first element in the array (the key) and .trim() removes any whitespace
        const key = parts.shift().trim();
        
        // Join the remaining parts of the array to form the cookie value
        // this is because we are looking at a specific cookie if it had an = in our 
        // cookie value it wouldve been split into 2 or more so we join those back together 
        // its a conflict of type
        const value = parts.join('=');
        
        // decodeURI converts encoded characters in the value back to their original form
        const decodedValue = decodeURI(value);
        
        // Add the key-value pair to the list object
        list[key] = decodedValue;
    });
    
    return list;
};


const wss = new WebSocketServer({ noServer: true });

s.on('upgrade', (req, socket, head) =>{
    //before we have officially connected and allowed the user to connect.
    socket.on('error', onSocketPreError);

    //perform auth here
    const cookies = parseCookies(req.headers.cookie);
    const token = cookies.accessToken;

    if(!token){
         // Respond with an HTTP Unauthorized status
         socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
         socket.destroy();
         return;
    }

    try {
        // Verify the token
        const user = jwt.verify(token, process.env.SECRET)
        req.user = user; // Attach user info to the request

        // Proceed with WebSocket upgrade
        wss.handleUpgrade(req, socket, head, (ws) => {
            socket.removeListener('error', onSocketPreError);
            wss.emit('connection', ws, req);
        });

    } catch (err) {
        // Token verification failed
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
    }
});


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
