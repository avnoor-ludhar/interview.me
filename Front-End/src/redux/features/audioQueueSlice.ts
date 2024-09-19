import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { audioDataFromTTS, audioQueueState } from "@/utils/types";

const initialState: audioQueueState = {
    audioQueue: [],
    prevChunkNumber: -1,
    playChunkFlag: false,
};

const audioQueueSlice = createSlice({
    name: "audioQueue",
    initialState,
    reducers: {
        addToQueue: (state, action: PayloadAction<audioDataFromTTS>) => {
            const newQueue = [...state.audioQueue, action.payload];
            newQueue.sort((a, b) => a.chunkNumber - b.chunkNumber);
            state.audioQueue = newQueue;
            if (newQueue[0].chunkNumber === state.prevChunkNumber + 1) {
                state.playChunkFlag = true;
            }
        },
        setPrevChunkNumber: (state, action: PayloadAction<number>) => {
            state.prevChunkNumber = action.payload;
        },
        clearQueue: (state) => {
            state.audioQueue = [];
            state.prevChunkNumber = -1;
            state.playChunkFlag = false;
        },
    },
});

export default audioQueueSlice.reducer;
export const { addToQueue, setPrevChunkNumber, clearQueue } = audioQueueSlice.actions;