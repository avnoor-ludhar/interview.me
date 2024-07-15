import { LiveTranscriptionEvents, createClient } from '@deepgram/sdk';
import dotenv from 'dotenv';
dotenv.config();

/* WebSocket code */
const deepgramClient = createClient(process.env.DEEPGRAM_APIKEY);

export const clearDeepgram = (ws, deepgram) => {
    if (deepgram !== null) {
        deepgram.finish();
        deepgram.removeAllListeners();
        clearInterval(ws.keepAlive);
        deepgram = null;
        console.log('Deepgram disconnected');
    }
}

//code to set up the deepgram web socket event handlers
export const setupDeepgram = (ws, askAndrespond, chat) => {
    //sets up the transcription websocket connection
    const deepgram = deepgramClient.listen.live({
        language: "en",
        punctuate: true,
        smart_format: true,
        model: "nova-2",
        interim_results: true,
        utterance_end_ms: 1500
    });

    //keepAlive allows the socket to stay awake by sending a flag to deepgram to keep 
    //the connection open.
    if (ws.keepAlive) {
        clearInterval(ws.keepAlive);
    }

    //sets a function that fires the keepAlive every 10 seconds
    ws.keepAlive = setInterval(() => {
        console.log("deepgram: keepalive");
        deepgram.keepAlive();
    }, 10 * 1000);

    //opening eventlistener
    deepgram.addListener(LiveTranscriptionEvents.Open, async () => {
        console.log('deepgram connected');

        //transcription event listener 
        deepgram.addListener(LiveTranscriptionEvents.Transcript, async (data) => {
            
            //is_final is a property that states that that's the final transcipt
            if (data.is_final) {
                //finds the highest probability transcript from all the transcriptions that came back
                let bestPrediction = 0;
                let foundIndex = 0;
                data.channel.alternatives.forEach((element, index) => {
                    if (element.confidence > bestPrediction) {
                        foundIndex = index;
                        bestPrediction = element.confidence;
                    }
                });

                //adds it onto the global message and sends the transcript to the front end
                ws.globalMessage += " " + data.channel.alternatives[foundIndex].transcript;
                ws.send(JSON.stringify(data.channel.alternatives[foundIndex]));
            }
        });

        //utterance end is what allows the connection to automatically send a response after a certain period
        //where no transcription data is detected.
        deepgram.addListener(LiveTranscriptionEvents.UtteranceEnd, async (data) => {
            console.log(data);
            //sends the current global message to gemini which then returns the response to the frontend
            askAndrespond(chat, ws.globalMessage, ws, "message", ws.chunkCount, ws.interupted);
            ws.globalMessage = "";
        });

        //close event listener to handle clean up
        deepgram.addListener(LiveTranscriptionEvents.Close, async () => {
            console.log("deepgram: disconnected");
            clearInterval(ws.keepAlive);
            clearDeepgram(ws, deepgram);
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
