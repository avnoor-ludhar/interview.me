import {GoogleGenerativeAI} from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

//creates a connection to the Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_APIKEY);
export const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro"});
//sets up a chat so that the model can rememebr history of the conversation
export const chat = model.startChat({
    history: [],
    generationConfig: {
      maxOutputTokens: 150,
    },
  });

//creates a basic askAndrespond function which dependant on the message type changes the prompting to the AI
export async function askAndrespond(chat, msg, ws, messageEvent, chunkCount, parsedMessage){
    try{
        if(messageEvent === "intro"){
            msg = `
            You are the interviewer for the ${parsedMessage.position} position at ${parsedMessage.companyName} company. USE THE NAME ${parsedMessage.interviewerName}
            YOU MUST HAVE AN INTRODUCTION MESSAGE WHICH MUST BE THE RESPONSE TO THIS PROMPT, this should be opening the interview to a REAL PERSON named ${parsedMessage.firstName} ${parsedMessage.lastName}.
            Then expect to get a response from the interviewee and ask 1-2 technical questions and 1-2 behavioural questions. 

            YOU MUST RESPOND TO THE INTERVIEWEE AND ASK AT MOST 1 QUESTION AT A TIME REMEMBER YOU ARE AN INTERVIEWER DO NOT ANALYZE THE QUESTIONS.

            MAKE SURE TO ALWAYS ACT AS THE INTERVIEWER IN A CONVERSATIONAL TONE AND YOU SPEAK AS IF YOU ARE A HUMAN INTERVIEWER DO NOT STATE A REPLY FOR THE INTERVIEWEE OR YOU DIE WAIT FOR THE MESSAGE. 
            DO NOT HAVE ANSWERS TO TECHNICAL QUESTIONS IN THE RESPONSE.

            ENSURE YOU WAIT FOR A RESPONSE FROM THE QUESTION BEFORE YOU END THE INTERVIEW.
            
            Job Description: ${parsedMessage.jobDescription}

            After a few back and forward messages in the chatlog PLEASE PLEASE YOU MUST END THE INTERVIEW WITH have a great day, or have a good day. 
            `;
            ;
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
