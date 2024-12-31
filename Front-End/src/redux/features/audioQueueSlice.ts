import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { audioDataFromTTS, audioQueueState } from "@/utils/types";

const initialState: audioQueueState = {
    audioQueue: [],
    prevChunkNumber: -1,
    playChunkFlag: false,
};

//slice doesnt mutate array so immer doesn't catch it
const audioQueueSlice = createSlice({
    name: "audioQueue",
    initialState,
    reducers: {
        addToQueue: (state, action: PayloadAction<audioDataFromTTS>) => {
            // Directly mutate the state.audioQueue array
            state.audioQueue.push(action.payload);
            state.audioQueue.sort((a, b) => a.chunkNumber - b.chunkNumber);

            // Update the playChunkFlag based on the sorted queue
            state.playChunkFlag = state.audioQueue[0]?.chunkNumber === state.prevChunkNumber + 1;
        },
        popFromQueue: (state) => {
            // Remove the first item from the audioQueue array
            state.prevChunkNumber = state.audioQueue[0].chunkNumber
            if(state.audioQueue.length > 1 && state.audioQueue[1].chunkNumber == state.audioQueue[0].chunkNumber + 1){
                state.playChunkFlag = true;
            }else{
                state.playChunkFlag = false;
            }
            
            state.audioQueue = state.audioQueue.slice(1)
        },
        clearQueue: (state) => {
            // Reset to initial state values
            state.audioQueue = [];
            state.prevChunkNumber = -1;
            state.playChunkFlag = false;
        },
        setPrevChunkNumber: (state, action: PayloadAction<number>) => {
            // Directly set the prevChunkNumber
            state.prevChunkNumber = action.payload;
        },
        setPlayChunkFlag: (state, action: PayloadAction<boolean>) => {
            // Directly set the playChunkFlag
            state.playChunkFlag = action.payload;
        }
    },
});

export const { addToQueue, popFromQueue, setPrevChunkNumber, clearQueue, setPlayChunkFlag } = audioQueueSlice.actions;
export default audioQueueSlice.reducer;
