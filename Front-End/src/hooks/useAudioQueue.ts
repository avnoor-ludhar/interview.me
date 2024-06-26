import { useState, useEffect } from 'react';
import { audioDataFromTTS } from "@/utils/types";

const useAudioQueue = () => {
    const [audioQueue, setAudioQueue] = useState<audioDataFromTTS[]>([]);
    const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
    const [firstChunkFlag, setFirstChunkFlag] = useState<boolean>(false);

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
            
            // this is an event listener to modify the queue on the ending of an audio sample
            audio.addEventListener('ended', () => {
                setAudioQueue((prevQueue) => prevQueue.slice(1));
                setCurrentAudio(null);
            });

            // Start playback
            setCurrentAudio(audio);
            audio.play();
        }
    }
    
    useEffect(() => {
        //checks if the currentAudio is null and we have some audio in our queue
        if (!currentAudio && audioQueue.length > 0 && firstChunkFlag) {
            playNextAudio();
        } 
    }, [audioQueue, currentAudio, firstChunkFlag]);

    return { audioQueue, addToQueue, setFirstChunkFlag, setAudioQueue, setCurrentAudio };
};

export default useAudioQueue;
