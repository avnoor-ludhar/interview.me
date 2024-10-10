import {GoogleGenerativeAI} from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

//creates a connection to the Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_APIKEY);
export const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});
//sets up a chat so that the model can rememebr history of the conversation
export const chat = model.startChat({
    history: [],
    generationConfig: {
      maxOutputTokens: 200,
    },
  });

//creates a basic askAndrespond function which dependant on the message type changes the prompting to the AI
export async function askAndrespond(chat, msg, ws, messageEvent, chunkCount, interupted){
    try{
        if(messageEvent === "intro"){
            msg = `Please introduce yourself as an interviewer from the CIBC Application Software Developer Co-op (Commercial Banking, Payments & Wealth Technology - 4 months co-op). Here is the description of the job: 

            Join our CIBC Technology team as an Application Developer Co-Op and have a real impact in making our clients’ ambitions a reality! This is a great opportunity to be a part of an innovation-focused team that is helping to drive CIBC’s digital transformation by developing, testing, and delivering easy to use, flexible, and personalized banking solutions.

            You’ll have an opportunity to assist in developing, testing, and supporting the implementation of cross-functional, multi-platform application systems. Be part of an innovation-focused team that creates easy, flexible, and personalized banking solutions to enhance client experience and change the way that people bank.

            Use a randomly chosen name, such as [John, Casey, Fied], and you are the BEHAVIOURAL interviewer for the CIBC position. You will ask UP TO 3 BEHAVIOURAL questions WITH ONE INITIAL INTRODUCTION MESSAGE. Provide a quick introduction before you conduct the interview. Each response should be smaller than 60 words. Ensure the meeting doesn't go above 10 back and forth messages, but handle follow-up questions. In your conclusion, you HAVE TO SAY, "Have a great day." Make sure you are acting as an interviewer and not responding to this prompt.`;
            ;
        }else if(messageEvent === "end"){
            msg += "ONLY SEND A LIST OF THE QUESTIONS YOU ASKED. Separated by colons to be able to parse into an ARRAY."
        } else if(interupted){
            msg = "You were interupted by the user right before you said this part of your previous message: " + interupted + "and the user said: " + msg 
        }
        const result = await chat.sendMessageStream(msg);
        let text = '';
        let textToSend = '';
        //waits for each message stream which send chunks as they are available
        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            textToSend += chunkText;
            if(chunkCount % 1 == 0 && chunkCount != 0){
                const jsonForFrontEnd = {chunkNumber: chunkCount - 1, chunk: textToSend}
                //sends the data to the front end via the web socket connection
                ws.send(JSON.stringify(jsonForFrontEnd));
                textToSend = '';
            }
            text += chunkText;
            chunkCount += 0.5
        }
        if(textToSend != ''){
            const jsonForFrontEnd = {chunkNumber: chunkCount - 1, chunk: textToSend}
            //sends the data to the front end via the web socket connection
            ws.send(JSON.stringify(jsonForFrontEnd));
        }
        return text;
    } catch(error){
        console.log(error.message)
    }
}
