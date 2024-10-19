import { createClient } from "@deepgram/sdk";
import dotenv from 'dotenv';
import db from "../dbConnection.js";
dotenv.config();

//connects to deepgram
const deepgram = createClient(process.env.DEEPGRAM_APIKEY)

const startInterview = async (req, res) => {
  const user = req.user;

  try{
    const {rows} = await db.query(
      "INSERT INTO interviews (user_id, typeofinterview, institution) VALUES ($1, $2, $3) RETURNING *", 
      [user.id, 'SWE', 'CIBC']
    );
    return res.status(201).json({interviewId: rows[0].id})
  }catch(error){
    console.error(error)
    return res.status(403).json({error: "Could not insert into database."})
  }
}

const endInterview = async (req, res) => {
  const {interviewId, chatLog} = req.body
  if(chatLog && interviewId){
    try{
      const {rows} = await db.query(
        "INSERT INTO qaofinterview (interview_id, chat) VALUES ($1, $2) RETURNING *", 
        [interviewId, JSON.stringify(chatLog)]
      );
      return res.status(201).json({record: rows[0]})
    }catch(error){
      console.error(error)
      return res.status(401).json({error: "Could not insert into database."})
    }
  }else{
    return res.status(500).json({ error: "No chat log or interview ID provided." });
  }
}

//controller function that converts text to speech via deepgram 
const textToSpeechDeepgram = async (req, res) =>{
  const {text, chunkNumber, model } = req.body;
  // Validate text input
  if (!text || typeof text !== 'string' || text.trim() === '') {
      return res.status(400).send("Invalid text input");
  }
  
  
  try{
    //defines the model for text-to-speach and then passes the text and gets the stream from it
    const response = await deepgram.speak.request({ text }, { model });
    const stream = await response.getStream();
    // Accumulate chunks
    let audioData = [];
    for await (const chunk of stream) {
      audioData.push(chunk);
    }

    // Combine all chunks into a single Buffer
    const completeAudioBuffer = Buffer.concat(audioData);

    // Encode the audio buffer to Base64 which is a format that converts audio file to a string
    const audioBase64 = completeAudioBuffer.toString('base64');

    // Set appropriate headers and send the complete audio data
    res.setHeader('Content-Type', 'application/json');
    return res.json({
      audio: audioBase64,
      chunkNumber: chunkNumber
    });
  }catch(e){
    console.error(e);
    if(e.status == 400){
      return res.status(e.status).send("Text data could not be processed");
    }
    return res.status(500).send("Internal Server Error");
  }
}

export {endInterview, startInterview, textToSpeechDeepgram};