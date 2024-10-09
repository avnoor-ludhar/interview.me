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
            return {
                ...state,
                audioQueue: newQueue,
                playChunkFlag: newQueue[0].chunkNumber === state.prevChunkNumber + 1,
            };
        }, popFromQueue: (state)=>{
            return {
                ...state,
                audioQueue: state.audioQueue.slice(1)
            }
        },
        clearQueue: () => {
            return {
                audioQueue: [],
                prevChunkNumber: -1,
                playChunkFlag: false,
            };
        },
        setPrevChunkNumber: (state, action: PayloadAction<number>) => {
            return {
                ...state,
                prevChunkNumber: action.payload,
            };
        },
        setPlayChunkFlag: (state, action: PayloadAction<boolean>) =>{
            return {
                ...state,
                playChunkFlag: action.payload
            }
        }
    },
});

export const { addToQueue, popFromQueue, setPrevChunkNumber, clearQueue, setPlayChunkFlag } = audioQueueSlice.actions;
export default audioQueueSlice.reducer;
