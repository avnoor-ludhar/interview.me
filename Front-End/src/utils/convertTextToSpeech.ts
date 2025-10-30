import { dataFromGemini, bodyTTS, audioDataFromTTS } from "./types";
import { AxiosResponse } from "axios";
import { AppDispatch } from '@/redux/store'; 
import api from "@/lib/axios";
import { addToQueue } from "@/redux/features/audioQueueSlice";
import * as Sentry from '@sentry/react';

export const convertTextToSpeech = async (data: dataFromGemini, dispatch: AppDispatch, model: string) => {
    // Create a custom span for the text-to-speech conversion
    await Sentry.startSpan({
        name: 'interview.textToSpeech',
        op: 'ai.tts',
        attributes: {
            'component': 'frontend-tts',
            'chunk.number': data.chunkNumber,
            'model': model
        }
    }, async () => {
        try {
            const body: bodyTTS = {text: data.chunk, chunkNumber: data.chunkNumber,  model: model};
            const response: AxiosResponse = await api.post('/api/interview/tts', body, {
                responseType: 'text'
            });
            const dataFromTTS: audioDataFromTTS =  JSON.parse(response.data)
            const audioBuffer = Uint8Array.from(atob(dataFromTTS.audio), c => c.charCodeAt(0)).buffer;
            const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' });
            const audioUrl = URL.createObjectURL(audioBlob);

            dispatch(addToQueue({chunkNumber: dataFromTTS.chunkNumber, audio: audioUrl, chunkText: data.chunk}));
        } catch (error) {
            console.error('Error converting text to speech:', error);
        }
    });
  };