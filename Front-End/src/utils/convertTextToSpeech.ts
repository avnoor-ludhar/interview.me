import { models } from "@/assets/models";
import { dataFromGemini, bodyTTS, audioDataFromTTS } from "./types";
import { AxiosResponse } from "axios";
import { AppDispatch } from '@/redux/store'; 
import api from "@/lib/axios";
import { addToQueue } from "@/redux/features/audioQueueSlice";

export const convertTextToSpeech = async (data: dataFromGemini, dispatch: AppDispatch) => {
    try {
        const body: bodyTTS = {text: data.chunk, chunkNumber: data.chunkNumber,  model: models[1].model};
        const response: AxiosResponse = await api.post('/api/interview/tts', body, {
            responseType: 'text'
        });
        const dataFromTTS: audioDataFromTTS =  JSON.parse(response.data)
        const audioBuffer = Uint8Array.from(atob(dataFromTTS.audio), c => c.charCodeAt(0)).buffer;
        const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        console.log(audioUrl)
        console.log(dataFromTTS.chunkNumber)
        
        dispatch(addToQueue({chunkNumber: dataFromTTS.chunkNumber, audio: audioUrl, chunkText: data.chunk}));
    } catch (error) {
        console.error('Error converting text to speech:', error);
    }
  };