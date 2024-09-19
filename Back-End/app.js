import express from 'express';
import userRoutes from './routes/user.js';
import mainRoutes from './routes/main.js';
import dotenv from 'dotenv';
import cors from 'cors';
import db from './dbConnection.js';
import cookieParser from 'cookie-parser';
import { WebSocketServer } from 'ws';
import { chat, askAndrespond } from './gemini/gemini.js';
import { setupDeepgram, clearDeepgram } from './deepgram/deepgram.js';
import jwt from 'jsonwebtoken';

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
//middleware that parses cookies attached to the client request object('makes it easy to access cookie values)
//allows us to access our cookies via req.cookies 
app.use(cookieParser());

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
        const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
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
                    // let questions = await askAndrespond(chat, ws.globalMessage, ws, "end", ws.chunkCount);
                    // questions = questions.split(":").slice(1)
                    // console.log(questions);
                    // for(const chat of parsedMessage.chatLog){
                    //     console.log(chat);
                    // }

                    // const result = db.query("INSERT INTO qaofinterview WHERE interview_id = $1");
                    
                    ws.globalMessage = "";
                    ws.chunkCount = 0;
                    ws.close();
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
