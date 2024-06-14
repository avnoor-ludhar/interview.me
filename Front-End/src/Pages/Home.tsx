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

type speaker = {
    speaker: string,
    text: string
};

export default function Home(): JSX.Element{
    const user = useAppSelector(state=>state.user.user);
    const [currentTranscription, setCurrentTranscription] = useState<string>("");
    const [currentSpeaker, setCurrentSpeaker] = useState<speaker>({speaker: "Gemini", text: ""});
    const [chatLog, setChatLog] = useState<speaker[]>([]);
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const socketRef = useRef<null | WebSocket>(null);
    const microphoneRef = useRef<MediaRecorder | null>(null);

    useEffect(() => {
        console.log("ChatLog updated:", chatLog);
    }, [chatLog]);

    useEffect(() => {
        console.log("CurrentSpeaker updated:", currentSpeaker);
    }, [currentSpeaker]);

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
            if (isJSON(event.data)) {
                const data = JSON.parse(event.data);
                handleWebSocketMessage(data);
            }
        });
    
        socketRef.current.addEventListener("close", () => {
            console.log("WebSocket connection closed");
        });

        socketRef.current.addEventListener('error', (error) =>{
            console.log({ event: 'onerror', error });
        })
    }

    const handleWebSocketMessage = (data: any) => {
        if (data.chunk) {
            updateStateWithChunk(data.chunk);
        } else {
            const transcriptionFromBackEnd = data.transcript;
            if (transcriptionFromBackEnd && transcriptionFromBackEnd !== "") {
                updateStateWithTranscription(transcriptionFromBackEnd);
            }
        }
    }

    const updateStateWithChunk = (chunk: string) => {
        setCurrentSpeaker((prev) => {
            const newSpeaker = prev.speaker === "User"
                ? { speaker: "Gemini", text: chunk }
                : { ...prev, text: prev.text + " " + chunk };

            if (prev.speaker === "User") {
                setChatLog((log) => {
                    if(log.length != 0 && log[log.length - 1].speaker == "User"){
                        return [...log];
                    }
                    return [...log, prev];
                });
            }

            setCurrentTranscription((prevTranscript) => prevTranscript ? prevTranscript + " " + chunk : chunk);

            return newSpeaker;
        });
    }

    const updateStateWithTranscription = (transcription: string) => {
        setCurrentSpeaker((prev) => {
            const newSpeaker = prev.speaker === "Gemini"
                ? { speaker: "User", text: transcription }
                : { ...prev, text: prev.text + " " + transcription };

            if (prev.speaker === "Gemini") {
                setChatLog((log) => {
                    console.log(log);
                    if(log.length != 0 && log[log.length - 1].speaker == "Gemini"){
                        return [...log];
                    }
                    return [...log, prev];
                });
            }

            setCurrentTranscription((prevTranscript) => prevTranscript ? prevTranscript + " " + transcription : transcription);

            return newSpeaker;
        });
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
            <p>{currentTranscription}</p>
            {/* <div className="flex flex-row w-full h-fit">
                <div className="w-[50%]">
                    {userTranscriptions.map((transcript, i)=>(<p key={i}>{transcript}</p>))}
                </div>
                <div className="w-[50%]">
                    {geminiMessages.map((transcript, i)=>(<p key={i}>{transcript}</p>))}
                </div>
            </div> */}
            
            <p>{user?.email}</p>
            <div className="flex flex-col items-center">
                <button className="mt-20 scale-[3] bg-red-600 p-1 rounded-full hover:opacity-80" onClick={handleRecord}><FaMicrophoneAlt /></button>
                {/* <audio controls autoPlay loop className="mt-10"/> */}
            </div>
        </div>)
}