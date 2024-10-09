import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '@/redux/store';
import { updateSpeaker, updateChatLog, appendToCurrentSpeakerText } from './chatLogSlice';
import { setPrevChunkNumber } from './audioQueueSlice';

interface WebSocketMessage {
    chunk?: string;
    transcript?: string;
}

export const handleWebSocketMessage = createAsyncThunk<void, WebSocketMessage, { state: RootState }>(
    'chatLog/handleWebSocketMessage',
    async (data, { dispatch, getState }) => {
        const state = getState();
        const { currentSpeaker } = state.chatLog; // Accesses the entire currentSpeaker object
        // const { audioQueue } = state.audioQueue;  // Accesses the entire audioQueue array

        if (data.chunk) {
            if (currentSpeaker.speaker === "User") {
                dispatch(updateChatLog());
                dispatch(updateSpeaker({ speaker: "Gemini", text: data.chunk }));
            } else {
                dispatch(appendToCurrentSpeakerText(data.chunk));
            }
        } else if (data.transcript) {
            if (currentSpeaker.speaker === "Gemini") {
                dispatch(updateSpeaker({ speaker: "User", text: data.transcript }));
                dispatch(setPrevChunkNumber(-1));

                // if (audioQueue.length > 0) {
                //     socketRef.current?.send(JSON.stringify({ type: 'Gemini_Interrupted', chunkText: audioQueue[0].chunkText }));
                //     setCurrentAudio((audio) => {
                //         if (audio) {
                //             audio.src = "";
                //         }
                //         return null;
                //     });
                // }

                dispatch(updateChatLog());
            } else {
                dispatch(appendToCurrentSpeakerText(data.transcript));
            }
        }
    }
);
