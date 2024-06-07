import { useAppSelector } from "@/redux/store";
import { useEffect, useState, useRef } from "react";
import axios, {AxiosError, AxiosResponse} from "axios";
import { FaMicrophoneAlt } from "react-icons/fa";


//need to use clearBlobUrl function from the hook when we get data back from the whisper API

export default function Home(): JSX.Element{
    const user = useAppSelector(state=>state.user.user);
    const [transcription, setTranscription] = useState<string | null>();
    const [isRecording, setIsRecording] = useState<boolean>(false)
    const socketRef = useRef<null | WebSocket>(null);
    const microphoneRef = useRef<MediaRecorder | null>(null);

    async function getMicrophone(): Promise<null | MediaRecorder> {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          if(!MediaRecorder.isTypeSupported('audio/webm')){
            return null;
          }
          return new MediaRecorder(stream, {
            //just the type notation: text/plain
            mimeType: 'audio/webm',
        });
        } catch (error) {
          console.error("Error accessing microphone:", error);
          throw error;
        }
      }

    async function openMicrophone(microphone: MediaRecorder, socket: WebSocket) {
        //returns a Promise to handle the asynchronous nature of the 
        //setting up of the microphone
        return new Promise<void>((resolve) => {
          microphone.onstart = () => {
            console.log("WebSocket connection opened");
            console.log('Microphone active');
            setIsRecording(true);
            resolve();
          };
      
          microphone.onstop = () => {
            console.log("Microphone connection closed");
          };
      
          microphone.ondataavailable = (event) => {
            if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
              socket.send(event.data);
            }
          };
      
          microphone.start(1000);
        });
      }
    
    async function start(socket: WebSocket): Promise<void> {
    
        console.log("client: waiting to open microphone");

        if(!microphoneRef.current){
            try{
                microphoneRef.current = await getMicrophone();
                if(microphoneRef.current === null){
                    return alert('Browser not supported');
                }

                await openMicrophone(microphoneRef.current, socket);
            } catch (error) {
                console.error("Error opening microphone:", error);
            }
        } else{
            microphoneRef.current.stop();
            microphoneRef.current = null;
        }
    }

    const activateConnection = async ()=>{
        socketRef.current = new WebSocket(import.meta.env.VITE_WEBSOCKET_URL);

        socketRef.current.addEventListener('open', async () =>{
            console.log("WebSocket connection opened");
            await start(socketRef.current as WebSocket);
        });

        socketRef.current.addEventListener("message", (event) => {
            const data = JSON.parse(event.data);
            if(data.chunk){
                setTranscription((transcript) => {
                    return transcript + data.chunk;
                });
            }else{
                const transcription: string = data.channel.alternatives[0].transcript
                if (transcription !== "") {
                    setTranscription((transcript) => {
                        return transcript + transcription;
                    });
                    console.log(transcription);
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
                    socketRef.current.send(JSON.stringify({ type: 'end_deepgram_session' }));
                }
                // socketRef.current.close(1000);
                // socketRef.current = null;
            }
        } else{
            if(socketRef.current === null){
                activateConnection();
            } else{
                await start(socketRef.current as WebSocket);
                socketRef.current.send(JSON.stringify({ type: 'start_deepgram_session' }))
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