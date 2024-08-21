import { useAppSelector } from "@/redux/store";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { speaker, UseWebSocketHook } from "@/utils/types";
import useWebSocket from "@/hooks/useWebSocket";
import useAudioQueue from "@/hooks/useAudioQueue";
import { convertTextToSpeech } from "@/utils/convertTextToSpeech";
import MeetingOptions from "@/components/MeetingOptions";
import Chat from "@/components/Chat";
import AIImg from "../assets/purpleOrb.png";
import Video from "@/components/Video";
import useVideo from "@/hooks/useVideo";
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

export default function Meeting(): JSX.Element{
    //used to hold the transcription for the current speaker and the transcription
    const [currentSpeaker, setCurrentSpeaker] = useState<speaker>({speaker: "Gemini", text: ""});
    //chat log of all the messages
    const [chatLog, setChatLog] = useState<speaker[]>([]);
    //functions to see if the microphone is recording
    const [isRecording, setIsRecording] = useState<boolean>(false);
    //ref variable to hold the microphone
    const microphoneRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const user = useAppSelector(state=>state.user.user);
    const navigate = useNavigate();
    const [killSocket, setKillSocket] = useState(false);
    //custom hook to keep track of all the functionality related to the audio queue
    const { addToQueue, setPrevChunkNumber, setAudioQueue, setCurrentAudio } = useAudioQueue(currentSpeaker, setKillSocket);
    const {videoRef, stopVideo, startVideo, isVideoOn} = useVideo();

    if(!user){
        navigate('/');
    }

    const toggleMute = ()=>{
        if(streamRef.current){
          streamRef.current.getAudioTracks().forEach(track =>{
            track.enabled = !track.enabled;
          })
          setIsRecording((prevState) => !prevState);
        }
      }

    //updates the state if 
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

            return newSpeaker;
        });
    }

    const updateStateWithTranscription = (transcription: string) => {
        setCurrentSpeaker((prev) => {
            const newSpeaker = prev.speaker === "Gemini"
                ? { speaker: "User", text: transcription }
                : { ...prev, text: prev.text + " " + transcription };

            if (prev.speaker === "Gemini") {
                setPrevChunkNumber(-1);

                setAudioQueue((queue) => {
                    if(queue.length > 0 && socketRef.current != null){
                        socketRef?.current.send(JSON.stringify({ type: 'Gemini_Interupted', chunkText: queue[0].chunkText }));

                        setCurrentAudio((audio)=>{
                            if(audio){
                                audio.src = ""
                            }
                            return null
                        });
                        return [];
                    }
                    return queue;
                })

                setChatLog((log) => {
                    if(log.length != 0 && log[log.length - 1].speaker == "Gemini"){
                        return [...log];
                    }
                    return [...log, prev];
                });
            }

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

    const { connect, disconnect, isConnected, socketRef }: UseWebSocketHook = useWebSocket(handleWebSocketMessage, microphoneRef, streamRef, setIsRecording);

    const handleRecord = () =>{
        if(isConnected){
            setIsRecording(false);
            microphoneRef.current?.stop();
            microphoneRef.current = null;
            disconnect();
        } else{
            connect(import.meta.env.VITE_WEBSOCKET_URL);
        }
    }

    useEffect(() => {
        // Navigate to results page
        if(killSocket){
            navigate("/results");
        }
        
    
        // Cleanup function to run when the component unmounts or when `killSocket` changes
        return () => {
            // Stop the microphone if it's still active
            if (microphoneRef.current) {
                microphoneRef.current.stop();
                microphoneRef.current = null;
            }
    
            // Stop all tracks in the media stream to release the microphone or camera
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
    
            // Disconnect the WebSocket if it's still connected
            if (isConnected) {
                socketRef.current?.send(JSON.stringify({ type: 'end_deepgram_session', chatLog: [...chatLog, currentSpeaker] }))
                disconnect();
            }
    
            // Stop the video stream
            stopVideo();
    
            // Reset state to default values
            setCurrentSpeaker({ speaker: "Gemini", text: "" });
            setChatLog([]);
            setIsRecording(false);
            setKillSocket(false);
            setPrevChunkNumber(-1);
            setAudioQueue([]);
            setCurrentAudio(null);
        };
    }, [killSocket]);
    
    

    
    return (
        <div className="h-[100vh] w-[100vw] absolute top-0 left-0 bg-black z-10">
            <div className="w-full h-full grid grid-cols-[1.5fr_1.5fr_1fr] grid-rows-[0.87fr_0.13fr]">
                <Video videoRef={videoRef} stopVideo={stopVideo} startVideo={startVideo}/>
                <div className="flex items-center justify-center">
                    <img src={AIImg}/>
                </div>
                <Chat chatLog={chatLog} currentSpeaker={currentSpeaker}/>
                <MeetingOptions isConnected={isConnected} handleRecord={handleRecord} stopVideo={stopVideo} startVideo={startVideo} isVideoOn={isVideoOn} isRecording={isRecording} toggleMute={toggleMute} />
            </div>
        </div>
        )
}