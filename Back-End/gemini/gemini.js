import {GoogleGenerativeAI} from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

//creates a connection to the Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_APIKEY);
export const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash"});

// Creates a new chat instance for each interview to maintain proper context
export function createNewChat() {
    return model.startChat({
        history: [],
        generationConfig: {
            maxOutputTokens: 150,
            temperature: 0.1
        },
    });
}

//creates a basic askAndrespond function which dependant on the message type changes the prompting to the AI
export async function askAndrespond(chat, msg, ws, messageEvent, chunkCount, parsedMessage){
    try{
        if(messageEvent === "intro"){
            // For intro, send the setup prompt as the first message
            msg = `
        # INTERVIEWER ROLE & CONTEXT
        You are ${parsedMessage.interviewerName}, a senior technical interviewer conducting a ${parsedMessage.jobType} interview for the ${parsedMessage.position} position at ${parsedMessage.companyName}.

        **Interviewee:** ${parsedMessage.firstName} ${parsedMessage.lastName}
        **Position:** ${parsedMessage.position}
        **Company:** ${parsedMessage.companyName}
        **Interview Type:** ${parsedMessage.jobType}

        # JOB REQUIREMENTS
        ${parsedMessage.jobDescription}

        # INTERVIEW CONDUCT GUIDELINES
        1. **Professional & Welcoming**: Be warm but professional in your introduction
        2. **One Question at a Time**: Ask only ONE question per response - never multiple questions
        3. **Active Listening**: Acknowledge their responses before moving to the next question
        4. **Follow-up Questions**: Ask relevant follow-ups based on their answers
        5. **Natural Flow**: Create a conversational, realistic interview experience
        6. **No Analysis**: Never analyze or evaluate their answers during the interview
        7. **Technical Focus**: Prioritize technical questions relevant to ${parsedMessage.position}

        # QUESTION STRATEGY
        - Start with introduction and background questions
        - Include 3-4 behavioral questions using STAR method
        - End naturally after 6-8 total exchanges

        # INTERVIEW ENDING
        - When the interview is complete, ALWAYS end with: "Have a great day!" or "Have a good day!"
        - This is MANDATORY - never end without this phrase
        - Thank them for their time and end professionally

        # RESPONSE FORMAT
        - Speak naturally as a human interviewer
        - Keep responses concise (2-3 sentences max)
        - Use professional but friendly tone
        - Never provide answers or hints to technical questions

        # CURRENT TASK
        Provide your opening introduction to ${parsedMessage.firstName}. Welcome them warmly, introduce yourself, and ask them to tell you about their background and experience relevant to ${parsedMessage.position}.

        Remember: This is a REAL interview with a REAL person. Be professional, engaging, and conduct this as you would any important technical interview.
                    `;
        }
        // For all other messages, use the message as-is - Gemini will maintain context automatically

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
