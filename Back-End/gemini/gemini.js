import {GoogleGenerativeAI} from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_APIKEY);
export const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});
export const chat = model.startChat({
    history: [],
    generationConfig: {
      maxOutputTokens: 200,
    },
  });

export async function askAndrespond(chat, msg, ws, messageEvent, chunkCount){
    try{
        if(messageEvent === "intro"){
            msg = " Please introduce yourself as an interviewer from the University of Waterloo's Software Engineering program. Use a randomly chosen name, such as [John, Casey, Fied], and you are the admissions officer for waterloo's software engineering program, you will ask one problem solving and one personal question after this initial message in 3 different messages. Provide a quick introduction before you conduct the interview. Each response should be smaller than 60 words. Make sure you are acting as an interviewer and not responding to this prompt.";
        }else if(messageEvent === "end"){
            msg += " Reponse to the content before this as if its the conclusion of the interview. Use the previous history of the responses for the conclusion."
        }
        const result = await chat.sendMessageStream(msg);
        let text = '';
        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            const jsonForFrontEnd = {chunkNumber: chunkCount, chunk: chunkText}
            ws.send(JSON.stringify(jsonForFrontEnd));
            text += chunkText;
            chunkCount += 1
        }
    } catch(error){
        console.log(error.message)
    }
}
