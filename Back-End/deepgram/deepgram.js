import { LiveTranscriptionEvents, createClient } from '@deepgram/sdk';
import dotenv from 'dotenv';
dotenv.config();

/* WebSocket code */
const deepgramClient = createClient(process.env.DEEPGRAM_APIKEY);

export const setupDeepgram = (ws, askAndrespond, chat) => {
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
            askAndrespond(chat, ws.globalMessage, ws, "message", ws.chunkCount, ws.interupted);
            ws.globalMessage = "";
        });

        deepgram.addListener(LiveTranscriptionEvents.Close, async () => {
            console.log("deepgram: disconnected");
            clearInterval(ws.keepAlive);
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
