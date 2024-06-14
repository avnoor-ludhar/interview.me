import { useAppSelector } from "@/redux/store";
import { useEffect, useState, useRef } from "react";
import { start } from "@/utils/microphone";
import { FaMicrophoneAlt } from "react-icons/fa";

const isJSON = (str: string) =>{
    try {
        JSON.parse(str);
        return true;
    } catch (e) {
        return false;
    }
}


export default function Home(): JSX.Element{
    const user = useAppSelector(state=>state.user.user);
    const [transcription, setTranscription] = useState<string | null>();
    const [isRecording, setIsRecording] = useState<boolean>(false)
    const socketRef = useRef<null | WebSocket>(null);
    const microphoneRef = useRef<MediaRecorder | null>(null);


    const activateConnection = async ()=>{
        socketRef.current = new WebSocket(import.meta.env.VITE_WEBSOCKET_URL);
       
        socketRef.current.addEventListener('open', async () =>{
            console.log("WebSocket connection opened");
            // Ensure 'this' is the WebSocket instance
            if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
                socketRef.current.send(JSON.stringify({ type: 'start_deepgram_session' }));
            } else {
                console.error("WebSocket is not open or 'this' is not the WebSocket instance.");
            }

            await start(socketRef.current as WebSocket, microphoneRef, setIsRecording);
        });

        socketRef.current.addEventListener("message", (event) => {
            if(isJSON(event.data)){
                const data = JSON.parse(event.data);
                //gemini second is the transcription from the backend
                if(data.chunk){
                    setTranscription((prevTranscript) => {
                        if(prevTranscript){
                            return prevTranscript + " " + data.chunk;
                        }else{
                            return data.chunk
                        }
                    });
                }else{
                    const transcription: string | undefined = data.transcript;
                    
                    if (transcription && transcription !== "") {
                        setTranscription((prevTranscript) => {
                            if(prevTranscript){
                                return prevTranscript + " " + transcription;
                            }else{
                                return transcription
                            }
                        });
                        console.log(transcription);
                    }
                }
            }
        });
    
        socketRef.current.addEventListener("close", () => {
            console.log("WebSocket connection closed");
        });

        socketRef.current.addEventListener('error', (error) =>{
            console.log({ event: 'onerror', error });
        })
    }

    const handleRecord = async () =>{
        if(isRecording){
            setIsRecording(false);
            microphoneRef.current?.stop();
            microphoneRef.current = null;

            if(socketRef.current !== null){
                if (socketRef.current.readyState === WebSocket.OPEN) {
                    const endMessage = JSON.stringify({type: 'end_deepgram_session'});
                    console.log("Sending end session message:", endMessage);
                    socketRef.current.send(endMessage);
                } 
                socketRef.current = null;
            }
        } else{
            if(socketRef.current === null){
                await activateConnection();
            }
        }
    }

    
    return (
        <div>
            <p>{transcription}</p>
            <p>{user?.email}</p>
            <div className="flex flex-col items-center">
                <button className="mt-20 scale-[3] bg-red-600 p-1 rounded-full hover:opacity-80" onClick={handleRecord}><FaMicrophoneAlt /></button>
                {/* <audio controls autoPlay loop className="mt-10"/> */}
            </div>
        </div>)
}