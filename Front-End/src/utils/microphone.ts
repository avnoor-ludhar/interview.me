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

export async function start(socket: WebSocket, microphoneRef: React.MutableRefObject<MediaRecorder | null>, setIsRecording: React.Dispatch<React.SetStateAction<boolean>>): Promise<void> {
    console.log("client: waiting to open microphone");

    if(!microphoneRef.current){
        try{
            microphoneRef.current = await getMicrophone();
            if(microphoneRef.current === null){
                return alert('Browser not supported');
            }

            await openMicrophone(microphoneRef.current, socket, setIsRecording);
        } catch (error) {
            console.error("Error opening microphone:", error);
        }
    } else{
        microphoneRef.current.stop();
        microphoneRef.current = null;
    }
}