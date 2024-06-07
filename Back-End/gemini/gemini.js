import {GoogleGenerativeAI} from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_APIKEY);
export const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});
export const chat = model.startChat({
    history: [],
    generationConfig: {
      maxOutputTokens: 100,
    },
  });

export async function askAndrespond(model, msg, ws){
    try{
        const result = await model.generateContentStream(msg);
        let text = '';
        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            const jsonForFrontEnd = {chunk: chunkText}
            ws.send(JSON.stringify(jsonForFrontEnd));
            text += chunkText;
        }
    } catch(error){
        console.log(error.message)
    }
}
