import { useAppSelector } from "@/redux/store";
import { useState, useRef } from "react";
import { FaMicrophoneAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { speaker, UseWebSocketHook } from "@/utils/types";
import useWebSocket from "@/hooks/useWebSocket";
import useAudioQueue from "@/hooks/useAudioQueue";
import { convertTextToSpeech } from "@/utils/convertTextToSpeech";
/*
Custom hooks allow us to store stateful logic in them. This means each
hook has a independant section compared to every other
call of the same hook. If hooks do not use 
any other hooks declare them as a normal function.

PURE FUNCTIONS:
- make sure there is a complete understanding of the output based on the input
- if we want to mutate a variable it must be defined in the scope of the function
since each component renders asynchronously. Try to express logic with rendering alone
useEffect should be last option.
*/

export default function Home(): JSX.Element{
    const [currentTranscription, setCurrentTranscription] = useState<string>("");
    const [currentSpeaker, setCurrentSpeaker] = useState<speaker>({speaker: "Gemini", text: ""});
    const [chatLog, setChatLog] = useState<speaker[]>([]);
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const microphoneRef = useRef<MediaRecorder | null>(null);
    const user = useAppSelector(state=>state.user.user);
    const navigate = useNavigate();
    const { addToQueue, setFirstChunkFlag } = useAudioQueue();
    if(!user){
        navigate('/');
    }

    const updateStateWithChunk = (chunk: string) => {
        setCurrentSpeaker((prev) => {
            let newSpeaker = { ...prev, text: prev.text + " " + chunk };
            if(prev.speaker === "User"){
                newSpeaker = { speaker: "Gemini", text: chunk };
            } else if(".,;:'!?".includes(chunk[0]) || prev.text.endsWith("'")){
                newSpeaker = {...prev, text: prev.text + chunk}
            } else if(prev.text[prev.text.length - 1] == " " && chunk[0] == "'"){
                newSpeaker = {...prev, text: prev.text.slice(0, prev.text.length - 1) + chunk}
            }

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
                setFirstChunkFlag(false)
                setChatLog((log) => {
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

    const handleWebSocketMessage = (data: any) => {
        if (data && data.chunk) {
            convertTextToSpeech(data, user, addToQueue);
            updateStateWithChunk(data.chunk);
        } else {
            const transcriptionFromBackEnd = data.transcript;
            if (transcriptionFromBackEnd && transcriptionFromBackEnd !== "") {
                updateStateWithTranscription(transcriptionFromBackEnd);
            }
        }
    }

    const { connect, disconnect, isConnected, socketRef }: UseWebSocketHook = useWebSocket(handleWebSocketMessage, microphoneRef, setIsRecording);

    const handleRecord = async () =>{
        if(isConnected){
            setIsRecording(false);
            microphoneRef.current?.stop();
            microphoneRef.current = null;
            disconnect();
        } else{
            connect(import.meta.env.VITE_WEBSOCKET_URL);
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