import { createAsyncThunk } from '@reduxjs/toolkit';
import { AppDispatch, RootState } from '@/redux/store';
import { updateSpeaker, updateChatLog, appendToCurrentSpeakerText, appendToCurrentSpeakerTextGemini } from './chatLogSlice';
import { setPrevChunkNumber } from './audioQueueSlice';
import { dataFromGemini, WebSocketMessage } from '@/utils/types';

function isDataFromGemini(data: WebSocketMessage): data is dataFromGemini {
    return (data as dataFromGemini).chunk !== undefined;
}

export const handleWebSocketThunk = createAsyncThunk<void, WebSocketMessage, { state: RootState, dispatch: AppDispatch }>(
    'chatLog/handleWebSocketMessage',
    async (data, { dispatch, getState }) => {
        const { currentSpeaker } = getState().chatLog;

        if (isDataFromGemini(data)) {
            if (currentSpeaker.speaker === "User") {
                
                // First, push the current speaker's data to the chat log
                dispatch(updateChatLog());

                // Then, set the new speaker data for "Gemini" with the new chunk
                dispatch(updateSpeaker({ speaker: "Gemini", text: '' }));
            }
            dispatch(appendToCurrentSpeakerTextGemini(data));
            
        } else if (data.transcript) {
            if (currentSpeaker.speaker === "Gemini" && data.transcript !== '') {
                // Add Gemini's last response to the chat log
                dispatch(updateChatLog());
                // Switch to "User" and set transcript as new text
                dispatch(updateSpeaker({ speaker: "User", text: data.transcript }));

                // Reset the chunk number for Gemini interruption logic
                dispatch(setPrevChunkNumber(-1));
            } else {
                // If the current speaker is User, append transcript to current text
                dispatch(appendToCurrentSpeakerText(data.transcript));
            }
        }
    }
);