import { useState, useEffect } from 'react';
import { audioDataFromTTS } from "@/utils/types";

const useAudioQueue = () => {
    const [audioQueue, setAudioQueue] = useState<audioDataFromTTS[]>([]);
    const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
    const [prevChunkNumber, setPrevChunkNumber] = useState<number>(-1)
    const [playChunkFlag, setPlayChunkFlag] = useState<boolean>(false);
    // const [firstChunkFlag, setFirstChunkFlag] = useState<boolean>(false);

    const addToQueue = (audioData: audioDataFromTTS) => {
        setAudioQueue((prevQueue) => {
            const newQueue = [...prevQueue, audioData]

            newQueue.sort((a, b) => a.chunkNumber - b.chunkNumber);
            if(newQueue[0].chunkNumber == prevChunkNumber + 1){
                setPlayChunkFlag(true);
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
            
            // this is an event listener to modify the queue on the ending of an audio sample
            audio.addEventListener('ended', () => {
                setAudioQueue((prevQueue) => prevQueue.slice(1));
                setCurrentAudio(null);
                setPrevChunkNumber(nextAudioUrl.chunkNumber);
                if(audioQueue[0].chunkNumber != (prevChunkNumber + 1)){
                    setPlayChunkFlag(false);
                }
                
            });

            // Start playback
            setCurrentAudio(audio);
            audio.play();
        }
    }
    
    useEffect(() => {
        //checks if the currentAudio is null and we have some audio in our queue
        console.log("currentAudio:", currentAudio)
        console.log("audioQueue: ", audioQueue.length)
        console.log("playChunkFlag: ", playChunkFlag)
        if (!currentAudio && audioQueue.length > 0 && playChunkFlag) {
            playNextAudio();
        } 
    }, [audioQueue, currentAudio, playChunkFlag]);

    return { audioQueue, addToQueue, setPrevChunkNumber, setAudioQueue, setCurrentAudio };
};

export default useAudioQueue;
