import { MediaStreamRecorderType } from "./types";

async function getMicrophone(): Promise<null | MediaStreamRecorderType> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if(!MediaRecorder.isTypeSupported('audio/webm')){
        return null;
      }
      const streamAndRecorder: MediaStreamRecorderType = {
        MediaRecorder: new MediaRecorder(stream, {
          //just the type notation: text/plain
          mimeType: 'audio/webm',
          }),
        MediaStream: stream
      }
      return streamAndRecorder
    } catch (error) {
      console.error("Error accessing microphone:", error);
      throw error;
    }
  };

async function openMicrophone(microphone: MediaRecorder, socket: WebSocket, setIsRecording: React.Dispatch<React.SetStateAction<boolean>>) {
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

export async function start(socket: WebSocket, microphoneRef: React.MutableRefObject<MediaRecorder | null>, streamRef: React.MutableRefObject<MediaStream | null>,  setIsRecording: React.Dispatch<React.SetStateAction<boolean>>): Promise<void> {
    console.log("client: waiting to open microphone");

    if(!microphoneRef.current){
        try{
            const StreamAndRecorder: MediaStreamRecorderType | null = await getMicrophone();

            if(StreamAndRecorder === null || StreamAndRecorder.MediaRecorder == null){
                return alert('Browser not supported');
            }
            microphoneRef.current = StreamAndRecorder.MediaRecorder;
            streamRef.current = StreamAndRecorder.MediaStream;

            await openMicrophone(microphoneRef.current, socket, setIsRecording);
        } catch (error) {
            console.error("Error opening microphone:", error);
        }
    } else{
        microphoneRef.current.stop();
        microphoneRef.current = null;
    }
}