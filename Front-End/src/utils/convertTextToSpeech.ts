import { models } from "@/assets/models";
import { dataFromGemini, bodyTTS, audioDataFromTTS } from "./types";
import axios, { AxiosResponse } from "axios";
import { User } from "@/redux/features/userSlice";

export const convertTextToSpeech = async (data: dataFromGemini, user: User | null, addToQueue: (audioData: audioDataFromTTS) => void) => {
    try {
        const url: string = `${import.meta.env.VITE_REACT_APP_API_URL}/api/interview/tts`;
        const body: bodyTTS = {text: data.chunk, chunkNumber: data.chunkNumber,  model: models[1].model};
        const response: AxiosResponse = await axios.post(url, body, {
            headers: {
                'Authorization': `Bearer ${user?.token}`
            },
            responseType: 'text'
        });
        const dataFromTTS: audioDataFromTTS =  JSON.parse(response.data)
        const audioBuffer = Uint8Array.from(atob(dataFromTTS.audio), c => c.charCodeAt(0)).buffer;
        const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);

        console.log(audioUrl)
        console.log(dataFromTTS.chunkNumber)
        
        addToQueue({chunkNumber: dataFromTTS.chunkNumber, audio: audioUrl, chunkText: data.chunk});
    } catch (error) {
        console.error('Error converting text to speech:', error);
    }
  };