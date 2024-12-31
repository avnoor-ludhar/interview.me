import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ChatLogState, dataFromGemini } from "@/utils/types";

const initialState: ChatLogState = {
    chatLog: [],
    currentSpeaker: { speaker: "Gemini", text: ""},
    prevChunkNumber: -1,
    queueForGemini: []
};


const chatLogSlice = createSlice({
    name: "chatLog",
    initialState,
    reducers: {
        updateSpeaker:  (state, action: PayloadAction<{speaker: string; text: string}>) =>{
            const { speaker, text } = action.payload;
            if (state.currentSpeaker.speaker !== speaker) {
                state.currentSpeaker = { speaker, text };
            } else {
                state.currentSpeaker.text = text;
            }
        },
        updateChatLog: (state) => {
            const lastLog = state.chatLog[state.chatLog.length - 1];
            state.prevChunkNumber = -1;
            if (state.chatLog.length === 0 || lastLog.speaker !== state.currentSpeaker.speaker || lastLog.text !== state.currentSpeaker.text) {
                state.chatLog.push({ ...state.currentSpeaker });
            }
        },
        appendToCurrentSpeakerTextGemini: (state, action: PayloadAction<dataFromGemini>) => {
            state.queueForGemini.push(action.payload);
            state.queueForGemini.sort((a, b) => a.chunkNumber - b.chunkNumber);
            
            while(state.queueForGemini.length > 0 && state.queueForGemini[0].chunkNumber == state.prevChunkNumber + 1){
                const chunk = state.queueForGemini[0].chunk;
                state.prevChunkNumber = state.queueForGemini[0].chunkNumber;
                state.queueForGemini = state.queueForGemini.slice(1);

                // Handle punctuation at the beginning or single quotes at the end
                if (".,;:'!?".includes(chunk[0]) || state.currentSpeaker.text.endsWith("'")) {
                    state.currentSpeaker = {
                        ...state.currentSpeaker,
                        text: state.currentSpeaker.text + chunk,
                    };
                } 
                // Handle cases where the last character is a space and the chunk starts with a single quote
                else if (state.currentSpeaker.text[state.currentSpeaker.text.length - 1] === " " && chunk[0] === "'") {
                    state.currentSpeaker = {
                        ...state.currentSpeaker,
                        text: state.currentSpeaker.text.slice(0, -1) + chunk,
                    };
                } 
                // General case for appending the chunk
                else {
                    state.currentSpeaker = {
                        ...state.currentSpeaker,
                        text: state.currentSpeaker.text + chunk,
                    };
                }
            }
        },
        appendToCurrentSpeakerText: (state, action: PayloadAction<string>) => {
            const chunk = action.payload;
        
            // Handle punctuation at the beginning or single quotes at the end
            if (".,;:'!?".includes(chunk[0]) || state.currentSpeaker.text.endsWith("'")) {
                state.currentSpeaker = {
                    ...state.currentSpeaker,
                    text: state.currentSpeaker.text + chunk,
                };
            } 
            // Handle cases where the last character is a space and the chunk starts with a single quote
            else if (state.currentSpeaker.text[state.currentSpeaker.text.length - 1] === " " && chunk[0] === "'") {
                state.currentSpeaker = {
                    ...state.currentSpeaker,
                    text: state.currentSpeaker.text.slice(0, -1) + chunk,
                };
            } 
            // General case for appending the chunk
            else {
                state.currentSpeaker = {
                    ...state.currentSpeaker,
                    text: state.currentSpeaker.text + ' ' + chunk,
                };
            }
        },
        resetSpeaker: (state) =>{
            state.currentSpeaker = { speaker: "Gemini", text: ""};
        },
        clearChatLog: (state) => {
            state.chatLog = [];
        }
    },
});

export default chatLogSlice.reducer;
export const { updateChatLog, updateSpeaker, appendToCurrentSpeakerText, resetSpeaker, clearChatLog, appendToCurrentSpeakerTextGemini } = chatLogSlice.actions;