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

export async function askAndrespond(chat, msg, ws, messageEvent){
    try{
        if(messageEvent === "intro"){
            msg = " Please introduce yourself as an interviewer from the University of Waterloo's Software Engineering program. Use a randomly chosen name, such as [John, Casey, Fied], and you are the admissions officer for waterloo's software engineering program. Provide a quick introduction before you conduct the interview. During the interview make sure to have a conversation with the user and ask one problem solving question and one question about there morals. Once you have asked a question about the morals and then conclude the convo. This will be split between various messages.";
        }else if(messageEvent === "end"){
            msg += " Reponse to the content before this as if its the conclusion of the interview. Use the previous history of the responses for the conclusion."
        }// }else{
        //     msg += " After this are special intructions for you gemini, make sure you respond to the message before this content. Ask one problem solving question after introduction and one personal question about the students morals and values and then a final message to conclude the interview. These should be split up between 3 different chat messages sent so you will receive more after this and your response needs to be less than 50 words when interviewing unless absolutely necessary, "
        // }
        const result = await chat.sendMessageStream(msg);
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
