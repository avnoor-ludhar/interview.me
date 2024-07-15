import { createClient } from "@deepgram/sdk";
import dotenv from 'dotenv';
dotenv.config();

//connects to deepgram
const deepgram = createClient(process.env.DEEPGRAM_APIKEY)

//ignore
const dataFunc = async (req, res)=>{
    res.send({success: 'success'});
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

export {dataFunc, textToSpeechDeepgram};