import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from "@/redux/store";
import { popFromQueue} from "@/redux/features/audioQueueSlice"; //need to import the reducer
import * as Sentry from '@sentry/react';

const useAudioQueue = (setKillSocket: React.Dispatch<React.SetStateAction<boolean>>) => {
    const {playChunkFlag, audioQueue} = useAppSelector(state => state.audioQueue);
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
            });
            
            // Add error handling for audio playback
            audio.addEventListener('error', (error) => {
                Sentry.captureException(error, {
                    tags: {
                        component: 'useAudioQueue',
                        action: 'audio-playback-error'
                    },
                    extra: {
                        audioUrl: nextAudioUrl.audio,
                        chunkNumber: nextAudioUrl.chunkNumber,
                        queueLength: audioQueue.length
                    }
                });
            });
    
            setCurrentAudio(audio);
            audio.play();
        }
    };

    useEffect(() => {
        // Re-run every time `currentSpeaker` changes
        if (audioQueue.length === 0 && currentAudio === null && currentSpeaker.speaker == "Gemini") {
            const textToCheckEnd = currentSpeaker.text.toLowerCase().replace(/ /g, "");
            if (textToCheckEnd.includes("haveagreatday") || textToCheckEnd.includes("haveagoodday") || textToCheckEnd.includes("haveawonderfulday")) {
                // Track interview completion
                Sentry.addBreadcrumb({
                    message: 'Interview completed - ending session',
                    category: 'interview',
                    level: 'info',
                    data: { 
                        speaker: currentSpeaker.speaker,
                        textLength: currentSpeaker.text.length 
                    }
                });
                setKillSocket(true);
            }
        }
    }, [currentSpeaker, audioQueue, currentAudio]);
    
    useEffect(() => {
        //checks if the currentAudio is null and we have some audio in our queue
        if (!currentAudio && audioQueue.length > 0 && playChunkFlag) {
            playNextAudio();
        }
    }, [currentAudio, audioQueue, playChunkFlag]);

    return {currentAudio, setCurrentAudio};
};

export default useAudioQueue;
