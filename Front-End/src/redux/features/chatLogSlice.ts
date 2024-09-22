import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ChatLogState } from "@/utils/types";

const initialState: ChatLogState = {
    chatLog: [],
    currentSpeaker: { speaker: "Gemini", text: "" }
};


const chatLogSlice = createSlice({
    name: "chatLog",
    initialState,
    reducers: {
        updateSpeaker:  (state, action: PayloadAction<{speaker: string; text: string}>) =>{
            const { speaker, text } = action.payload;
            state.currentSpeaker = {speaker, text}
        },
        updateChatLog: (state) => {
            if(state.chatLog.length == 0 || state.chatLog[state.chatLog.length - 1].speaker != state.currentSpeaker.speaker){
                state.chatLog.push(state.currentSpeaker)
            }
        },
        appendToCurrentSpeakerText: (state, action: PayloadAction<string>) =>{
            const chunk = action.payload;
            if(".,;:'!?".includes(chunk[0]) || state.currentSpeaker.text.endsWith("'")){
                state.currentSpeaker.text += chunk;
            } else if(state.currentSpeaker.text[state.currentSpeaker.text.length - 1] == " " && chunk[0] == "'"){
                state.currentSpeaker.text = state.currentSpeaker.text.slice(0, -1) + chunk;
            }else{
                state.currentSpeaker.text += chunk;
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
export const { updateChatLog, updateSpeaker, appendToCurrentSpeakerText, resetSpeaker, clearChatLog } = chatLogSlice.actions;