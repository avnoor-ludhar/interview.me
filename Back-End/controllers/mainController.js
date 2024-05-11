import { createClient } from "@deepgram/sdk";

const deepgram = createClient(process.env.DEEPGRAM_APIKEY)

const dataFunc = async (req, res)=>{
    res.send({success: 'success'});
}

const transcribeURL = async (req, res)=>{
    const {url} = req.body;
    const { result, error } = await deepgram.listen.prerecorded.transcribeUrl(
        {
          url: url
        },
        {
          model: "nova-2",
        }
      );
    console.log(error);

    res.send({transcription: result}).status(200);
}

export {dataFunc, transcribeURL};