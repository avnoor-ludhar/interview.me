import { configureStore } from "@reduxjs/toolkit";
import { UserSlice } from "./features/userSlice";
import audioQueueReducer from "./features/audioQueueSlice";
import { TypedUseSelectorHook, useDispatch } from "react-redux";
import { useSelector } from "react-redux";

export const store = configureStore({
    reducer: {
        user: UserSlice.reducer,
        audioQueue: audioQueueReducer
    }
});

export const useAppDispatch: ()=> typeof store.dispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<ReturnType<typeof store.getState>> = useSelector;