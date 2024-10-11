import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '@/redux/store';
import { updateSpeaker, updateChatLog, appendToCurrentSpeakerText } from './chatLogSlice';
import { setPrevChunkNumber } from './audioQueueSlice';

type WebSocketMessage = {
    chunk?: string;
    transcript?: string;
}

export const handleWebSocketThunk = createAsyncThunk<void, WebSocketMessage, { state: RootState }>(
    'chatLog/handleWebSocketMessage',
    async (data, { dispatch, getState }) => {
        console.log(data);
        const { currentSpeaker } = getState().chatLog;

        if (data.chunk) {
            if (currentSpeaker.speaker === "User") {
                // First, push the current speaker's data to the chat log
                dispatch(updateChatLog());

                // Then, set the new speaker data for "Gemini" with the new chunk
                dispatch(updateSpeaker({ speaker: "Gemini", text: data.chunk }));
            } else {
                // If the current speaker is Gemini, append chunk to current text
                dispatch(appendToCurrentSpeakerText(data.chunk));
            }
        } else if (data.transcript) {
            if (currentSpeaker.speaker === "Gemini") {
                // Switch to "User" and set transcript as new text
                dispatch(updateSpeaker({ speaker: "User", text: data.transcript }));

                // Reset the chunk number for Gemini interruption logic
                dispatch(setPrevChunkNumber(-1));

                // Optionally, handle Gemini interruption logic here
                 // if (audioQueue.length > 0) {
                //     socketRef.current?.send(JSON.stringify({ type: 'Gemini_Interrupted', chunkText: audioQueue[0].chunkText }));
                //     setCurrentAudio((audio) => {
                //         if (audio) {
                //             audio.src = "";
                //         }
                //         return null;
                //     });
                // }


                // Add Gemini's last response to the chat log
                dispatch(updateChatLog());
            } else {
                // If the current speaker is User, append transcript to current text
                dispatch(appendToCurrentSpeakerText(data.transcript));
            }
        }
    }
);
