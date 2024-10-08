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
            msg = "Please introduce yourself as an interviewer from the University of Waterloo's Software Engineering program. Use a randomly chosen name, such as [John, Casey, Fied], and you are the admissions officer for waterloo's software engineering program, you will ask one problem solving and one personal question after this initial message in 3 different messages. Provide a quick introduction before you conduct the interview. Each response should be smaller than 60 words. Ensure the meeting doesn't go above 5 back and forth messages however handle follow up questions and in your conclusion you HAVE TO SAY have a great day. Make sure you are acting as an interviewer and not responding to this prompt.";
        }else if(messageEvent === "end"){
            msg += "ONLY SEND A LIST OF THE QUESTIONS YOU ASKED. Separated by colons to be able to parse into an ARRAY."
        } else if(interupted){
            msg = "You were interupted by the user right before you said this part of your previous message: " + interupted + "and the user said: " + msg 
        }
        const result = await chat.sendMessageStream(msg);
        let text = '';
        //waits for each message stream which send chunks as they are available
        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            const jsonForFrontEnd = {chunkNumber: chunkCount, chunk: chunkText}
            //sends the data to the front end via the web socket connection
            ws.send(JSON.stringify(jsonForFrontEnd));
            text += chunkText;
            chunkCount += 1
        }
        return text;
    } catch(error){
        console.log(error.message)
    }
}
