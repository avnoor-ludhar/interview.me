import { createClient } from "@deepgram/sdk";
import dotenv from 'dotenv';
dotenv.config();

const deepgram = createClient(process.env.DEEPGRAM_APIKEY)

const dataFunc = async (req, res)=>{
    res.send({success: 'success'});
}

const textToSpeechDeepgram = async (req, res) =>{
  const {text, chunkNumber, model } = req.body;
  // Validate text input
  if (!text || typeof text !== 'string' || text.trim() === '') {
      return res.status(400).send("Invalid text input");
  }
  
  try{
    const response = await deepgram.speak.request({ text }, { model });
    const stream = await response.getStream();
    // Accumulate chunks
    let audioData = [];
    for await (const chunk of stream) {
      audioData.push(chunk);
    }

    // Combine all chunks into a single Buffer
    const completeAudioBuffer = Buffer.concat(audioData);

    // Encode the audio buffer to Base64
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