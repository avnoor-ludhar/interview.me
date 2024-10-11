import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from "@/redux/store";
import { setPrevChunkNumber, setPlayChunkFlag, popFromQueue} from "@/redux/features/audioQueueSlice"; //need to import the reducer

const useAudioQueue = (setKillSocket: React.Dispatch<React.SetStateAction<boolean>>) => {
    const {prevChunkNumber, playChunkFlag, audioQueue} = useAppSelector(state => state.audioQueue);
    const {currentSpeaker} = useAppSelector(state => state.chatLog);
    const dispatch = useAppDispatch();
    const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

    const playNextAudio = () => {
        if (audioQueue.length > 0) {
            const nextAudioUrl = audioQueue[0];
            const audio = new Audio(nextAudioUrl.audio);
            
            audio.addEventListener('ended', () => {
                dispatch(popFromQueue());
                setCurrentAudio(null);
                dispatch(setPrevChunkNumber(nextAudioUrl.chunkNumber));
    
                if (audioQueue.length > 1 && audioQueue[1].chunkNumber !== (prevChunkNumber + 1)) {
                    dispatch(setPlayChunkFlag(false));
                }
            });
    
            setCurrentAudio(audio);
            audio.play();
        }
    };

    useEffect(() => {
        // Re-run every time `currentSpeaker` changes
        if (audioQueue.length === 0 && currentAudio === null) {
            const textToCheckEnd = currentSpeaker.text.toLowerCase().replace(/ /g, "");
            if (textToCheckEnd.includes("haveagreatday") || textToCheckEnd.includes("haveagoodday") || textToCheckEnd.includes("haveawonderfulday")) {
                setKillSocket(true);
            }
        }
    }, [currentSpeaker, audioQueue, currentAudio]);
    
    useEffect(() => {
        //checks if the currentAudio is null and we have some audio in our queue
        console.log(audioQueue);
        if (!currentAudio && audioQueue.length > 0 && playChunkFlag) {
            playNextAudio();
        }
    }, [currentAudio, audioQueue, playChunkFlag]);

    return {setCurrentAudio};
};

export default useAudioQueue;
