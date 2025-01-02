import { useRef, useState } from "react";
import { start } from "@/utils/microphone";
import { MeetingState } from "@/utils/types";

const isJSON = (str: string) => {
    try {
        JSON.parse(str);
        return true;
    } catch {
        return false;
    }
};


const useWebSocket = (handleWebSocketMessage: (data: any) => void, microphoneRef: React.MutableRefObject<MediaRecorder | null>, streamRef: React.MutableRefObject<MediaStream | null>, setIsRecording: React.Dispatch<React.SetStateAction<boolean>>, state: MeetingState) => {
    const socketRef = useRef<null | WebSocket>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [interviewId, setInterviewId] = useState<number | null>(null);

    const connect = (url: string) => {
        socketRef.current = new WebSocket(url);

        socketRef.current.addEventListener('open', async () =>{
            console.log("WebSocket connection opened");
            if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN && state.interviewer) {
                socketRef.current.send(JSON.stringify({ type: 'start_deepgram_session', firstName: state.firstName, lastName: state.lastName, jobDescription: state.jobDescription, jobType: state.jobType, position: state.position, interviewerName: state.interviewer.name.split("(")[0], companyName: state.companyName}));
                setIsConnected(true);
            } else {
                console.error("WebSocket is not open or 'this' is not the WebSocket instance.");
            }

            await start(socketRef.current as WebSocket, microphoneRef, streamRef, setIsRecording);
        });

        socketRef.current.addEventListener("message", (event) => {
            if (isJSON(event.data)) {
                const data = JSON.parse(event.data);

                if (data.type === 'interviewId') {
                    setInterviewId(data.interviewId);
                    console.log("Received interviewId:", data.interviewId);
                }else{
                    handleWebSocketMessage(data);
                }
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
                const endMessage = JSON.stringify({type: 'end_deepgram_session', firstName: state});
                console.log("Sending end session message:", endMessage);
                socketRef.current.send(endMessage);
                // socketRef.current.close();
            }
            socketRef.current.close();
        }
    };

    return { connect, disconnect, isConnected, socketRef, interviewId};
};

export default useWebSocket;