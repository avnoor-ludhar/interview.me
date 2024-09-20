import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from "@/redux/store";
import { audioDataFromTTS, speaker } from "@/utils/types";
import { setPrevChunkNumber, addToQueue, clearQueue} from "@/redux/features/audioQueueSlice"; //need to import the reducer

const useAudioQueue = (currentSpeaker: speaker, setKillSocket: React.Dispatch<React.SetStateAction<boolean>>) => {
    const audioQueue = useAppSelector(state => state.audioQueue.audioQueue);
    const prevChunkNumber = useAppSelector(state => state.audioQueue.prevChunkNumber);
    const dispatch = useAppDispatch();
    const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
    const [playChunkFlag, setPlayChunkFlag] = useState<boolean>(false);

    const playNextAudio = () => {
        if (audioQueue.length > 0) {
            //takes the first audio sample in the queue
            const nextAudioUrl: audioDataFromTTS = audioQueue[0];
            //makes an HTML audio object out of it to play the sound
            const audio = new Audio(nextAudioUrl.audio);
            
            // this is an event listener to modify the queue on the ending of an audio sample
            audio.addEventListener('ended', () => {
                const textToCheckEnd: string = currentSpeaker.text.toLowerCase().replace(/ /g, "");
                if(audioQueue.length == 1 && (textToCheckEnd.includes("haveagreatday") || textToCheckEnd.includes("haveagoodday"))){
                    setKillSocket(true);
                }
                setCurrentAudio(null);
                dispatch(setPrevChunkNumber(nextAudioUrl.chunkNumber));

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
        if (!currentAudio && audioQueue.length > 0 && playChunkFlag) {
            playNextAudio();
        }
        return () =>{
            dispatch(clearQueue());
        }
    }, [audioQueue, currentAudio, playChunkFlag]);

    return { addToQueue, audioQueue, setCurrentAudio };
};

export default useAudioQueue;
