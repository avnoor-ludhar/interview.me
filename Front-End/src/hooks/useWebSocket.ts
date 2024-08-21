import { useEffect, useRef, useState } from "react";
import { start } from "@/utils/microphone";

const isJSON = (str: string) => {
    try {
        JSON.parse(str);
        return true;
    } catch {
        return false;
    }
};


const useWebSocket = (handleWebSocketMessage: (data: any) => void, microphoneRef: React.MutableRefObject<MediaRecorder | null>, streamRef: React.MutableRefObject<MediaStream | null>, setIsRecording: React.Dispatch<React.SetStateAction<boolean>>) => {
    const socketRef = useRef<null | WebSocket>(null);
    const [isConnected, setIsConnected] = useState(false);

    const connect = (url: string) => {
        socketRef.current = new WebSocket(url);

        socketRef.current.addEventListener('open', async () =>{
            console.log("WebSocket connection opened");
            if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
                socketRef.current.send(JSON.stringify({ type: 'start_deepgram_session' }));
                setIsConnected(true);
            } else {
                console.error("WebSocket is not open or 'this' is not the WebSocket instance.");
            }

            await start(socketRef.current as WebSocket, microphoneRef, streamRef, setIsRecording);
        });

        socketRef.current.addEventListener("message", (event) => {
            if (isJSON(event.data)) {
                const data = JSON.parse(event.data);
                handleWebSocketMessage(data);
            }
        });

        socketRef.current.addEventListener("close", () => {
            console.log("WebSocket connection closed");
            setIsConnected(false);
        });

        socketRef.current.addEventListener("error", (error) => {
            console.log({ event: 'onerror', error });
            setIsConnected(false);
        });
    };

    //once all audio chunks are read and the audioQueue is empty we can then close the 
    //connection or I can not have an end message
    const disconnect = () => {
        if(socketRef.current !== null){
            if (socketRef.current.readyState === WebSocket.OPEN) {
                const endMessage = JSON.stringify({type: 'end_deepgram_session'});
                console.log("Sending end session message:", endMessage);
                socketRef.current.send(endMessage);
                // socketRef.current.close();
            }
            socketRef.current.close();
        }
    };

    return { connect, disconnect, isConnected, socketRef };
};

export default useWebSocket;