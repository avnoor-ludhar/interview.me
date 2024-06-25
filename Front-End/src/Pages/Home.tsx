import { useAppSelector } from "@/redux/store";
import { useEffect, useState, useRef, useCallback } from "react";
import { start } from "@/utils/microphone";
import { FaMicrophoneAlt } from "react-icons/fa";
import axios, { AxiosResponse } from "axios";
import { useNavigate } from "react-router-dom";
import { models } from "@/assets/models";

type speaker = {
    speaker: string,
    text: string
};

type bodyTTS = {
    text: string,
    model: string,
    chunkNumber: number
};

type dataFromGemini = {
    chunk: string,
    chunkNumber: number
};

type audioDataFromTTS = {
    audio: string, 
    chunkNumber: number
};

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
    const [currentTranscription, setCurrentTranscription] = useState<string>("");
    const [currentSpeaker, setCurrentSpeaker] = useState<speaker>({speaker: "Gemini", text: ""});
    const [chatLog, setChatLog] = useState<speaker[]>([]);
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const socketRef = useRef<null | WebSocket>(null);
    const microphoneRef = useRef<MediaRecorder | null>(null);
    const navigate = useNavigate();
    const [audioQueue, setAudioQueue] = useState<audioDataFromTTS[]>([]);
    const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
    const [firstChunkFlag, setFirstChunkFlag] = useState<boolean>(false)

    if(!user){
        navigate('/');
    }

    // Function to add audio to the queue
    const addToQueue = (audioData: audioDataFromTTS) => {
        setAudioQueue((prevQueue) => {
            const newQueue = [...prevQueue, audioData]

            newQueue.sort((a, b) => a.chunkNumber - b.chunkNumber);
            if(newQueue[0].chunkNumber == 0){
                setFirstChunkFlag(true);
            }
            return newQueue;
        });
    };


    const playNextAudio = () => {
        if (audioQueue.length > 0) {
            //takes the first audio sample in the queue
            const nextAudioUrl = audioQueue[0];
            //makes an HTML audio object out of it to play the sound
            const audio = new Audio(nextAudioUrl.audio);
            
            // this is an event listener to modify the queu on the ending of an audio sample
            audio.addEventListener('ended', () => {
                setAudioQueue((prevQueue) => prevQueue.slice(1));
                setCurrentAudio(null);
            });

            // Start playback
            setCurrentAudio(audio);
            audio.play();
        }
    }

    // Effect to play the next audio when the queue changes
    // we add the playNextAudio to our dependency array to ensure 
    // that the version of the function is the re-rendered function
    // since useCallback memoizes the function
    useEffect(() => {
        //checks if the currentAudio is null and we have some audio in our queue
        if (!currentAudio && audioQueue.length > 0 && firstChunkFlag) {
            playNextAudio();
        } 
    }, [audioQueue, currentAudio]);

    const activateConnection = async ()=>{
        socketRef.current = new WebSocket(import.meta.env.VITE_WEBSOCKET_URL);
       
        socketRef.current.addEventListener('open', async () =>{
            console.log("WebSocket connection opened");
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
        if (data && data.chunk) {
            convertTextToSpeech(data);
            updateStateWithChunk(data.chunk);
        } else {
            const transcriptionFromBackEnd = data.transcript;
            if (transcriptionFromBackEnd && transcriptionFromBackEnd !== "") {
                updateStateWithTranscription(transcriptionFromBackEnd);
            }
        }
    }

    const convertTextToSpeech = async (data: dataFromGemini) => {
        try {
            const url: string = `${import.meta.env.VITE_REACT_APP_API_URL}/api/interview/tts`;
            const body: bodyTTS = {text: data.chunk, chunkNumber: data.chunkNumber,  model: models[1].model};
            const response: AxiosResponse = await axios.post(url, body, {
                headers: {
                    'Authorization': `Bearer ${user?.token}`
                },
                responseType: 'text'
            });
            const dataFromTTS: audioDataFromTTS =  JSON.parse(response.data)
            const audioBuffer = Uint8Array.from(atob(dataFromTTS.audio), c => c.charCodeAt(0)).buffer;
            const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' });
            const audioUrl = URL.createObjectURL(audioBlob);

            console.log(audioUrl)
            console.log(dataFromTTS.chunkNumber)
            
            addToQueue({chunkNumber: dataFromTTS.chunkNumber, audio: audioUrl});
        } catch (error) {
            console.error('Error converting text to speech:', error);
        }
      };

    const updateStateWithChunk = (chunk: string) => {
        setCurrentSpeaker((prev) => {
            let newSpeaker = { ...prev, text: prev.text + " " + chunk };
            if(prev.speaker === "User"){
                newSpeaker = { speaker: "Gemini", text: chunk };
            } else if(chunk[0] === "." || chunk[0] === "," || chunk[0] === "'" || chunk[0] === ";" || chunk[0] == ":" || chunk[0] === "?" || chunk[0] === "!" || prev.text[prev.text.length - 1] == "'"){
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