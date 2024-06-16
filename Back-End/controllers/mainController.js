import { createClient } from "@deepgram/sdk";
import dotenv from 'dotenv';
dotenv.config();

const deepgram = createClient(process.env.DEEPGRAM_APIKEY)

const dataFunc = async (req, res)=>{
    res.send({success: 'success'});
}

const textToSpeechDeepgram = async (req, res) =>{
  const {text, model } = req.body;

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

    // Set appropriate headers and send the complete audio data
    res.setHeader('Content-Type', 'audio/wav');
    res.send(completeAudioBuffer);
  }catch(e){
    console.error(e);
    res.status(500).send("Internal Server Error");
  }
}

export {dataFunc, textToSpeechDeepgram};