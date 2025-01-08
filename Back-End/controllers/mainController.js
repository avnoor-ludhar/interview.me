import dotenv from 'dotenv';
import db from "../dbConnection.js";
import { VertexAI } from '@google-cloud/vertexai';
import { createClient } from "@deepgram/sdk";
dotenv.config();

// Initialize Vertex AI and Model
const vertex_ai = new VertexAI({
  project: 'finetune-446818',
  location: 'us-central1',
});

const model = 'gemini-1.5-flash-002';

const generativeModel = vertex_ai.preview.getGenerativeModel({
  model: model,
  generationConfig: {
    maxOutputTokens: 8192,
    temperature: 0.5,
    topP: 0.95,
  },
});

const deepgram = createClient(process.env.DEEPGRAM_APIKEY);

// Start Interview Function
const startInterview = async (req, res) => {
  const user = req.user;
  const typeofinterview = req.body?.typeofinterview;
  const institution = req.body?.company;

  try {
    const { rows } = await db.query(
      "INSERT INTO interviews (user_id, typeofinterview, institution, interview_date) VALUES ($1, $2, $3, $4) RETURNING *", 
      [user.id, typeofinterview, institution, new Date()]
    );
    return res.status(201).json({ interviewId: rows[0].id });
  } catch (error) {
    console.error(error);
    return res.status(403).json({ error: "Could not insert into database." });
  }
};

// Text-to-Speech Deepgram Function
const textToSpeechDeepgram = async (req, res) => {
  const { text, chunkNumber, model } = req.body;

  if (!text || typeof text !== 'string' || text.trim() === '') {
    return res.status(400).send("Invalid text input");
  }

  try {
    const response = await deepgram.speak.request({ text }, { model });
    const stream = await response.getStream();

    let audioData = [];
    for await (const chunk of stream) {
      audioData.push(chunk);
    }

    const completeAudioBuffer = Buffer.concat(audioData);
    const audioBase64 = completeAudioBuffer.toString('base64');

    res.setHeader('Content-Type', 'application/json');
    return res.json({
      audio: audioBase64,
      chunkNumber: chunkNumber,
    });
  } catch (e) {
    console.error(e);
    if (e.status == 400) {
      return res.status(e.status).send("Text data could not be processed");
    }
    return res.status(500).send("Internal Server Error");
  }
};

// Function to evaluate interview
const evaluateInterview = async (chatLog) => {
  try {
    const feedbackPrompt = `
      You will be provided with a text transcription based on an interview. The criteria is STAR method. 
      Provide detailed feedback based on a rubric you will create and deem fit for an interview. 
      State specifically what the user did incorrectly for each section of the rubric, and provide a mock 
      answer that is well done. Include suggestions for improvement. Do not send the rubric, just keep it mentally you should not be able to see it. 
      Please also provide the 1-10 score in a large bold font, it should be the first thing you see, and large. Be more brief, and when you write the score write Grade: X/10. 
      Don't write the word feedback, just write the feedback

      Here is the interview transcription:
      ${JSON.stringify(chatLog)}
    `;

    const feedbackRequest = {
      contents: [{ role: 'user', parts: [{ text: feedbackPrompt }] }],
    };

    const feedbackResult = await generativeModel.generateContent(feedbackRequest);
    const detailedFeedback = feedbackResult.response.candidates[0].content.parts[0].text;

    // Extract score directly from the feedback
    const scoreMatch = detailedFeedback.match(/Grade:\s*(\d{1,2})/);
    const score = scoreMatch ? parseInt(scoreMatch[1], 10) : null;

    if (score === null || isNaN(score)) {
      console.error("Could not extract score.");
      return { error: "Failed to extract score." };
    }

    return {
      score: score,
      feedback: detailedFeedback,
    };
  } catch (error) {
    console.error("Error evaluating interview:", error);
    return { error: "Failed to evaluate interview." };
  }
};

// End Interview Function
const endInterview = async (req, res) => {
  const { interviewId, chatLog } = req.body;

  if (!interviewId || !chatLog) {
    return res.status(400).json({ error: "Missing interview ID or chat log." });
  }

  try {
    const date = new Date();
    const { rows } = await db.query(
      "INSERT INTO QAOfInterview (interview_id, chat, feedback) VALUES ($1, $2, $3) RETURNING *", 
      [interviewId, JSON.stringify(chatLog), null]
    );

    const evaluation = await evaluateInterview(chatLog);

    if (evaluation.error) {
      return res.status(500).json({ error: "Failed to evaluate interview." });
    }

    const { score, feedback } = evaluation;

    // Insert the extracted score directly from feedback
    await db.query(
      "UPDATE interviews SET score = $1 WHERE id = $2",
      [score, interviewId]
    );

    await db.query(
      "UPDATE QAOfInterview SET feedback = $1 WHERE interview_id = $2",
      [feedback, interviewId]
    );

    return res.status(201).json({
      record: rows[0],
      score: score,
      feedback: feedback,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error." });
  }
};


export { startInterview, endInterview, textToSpeechDeepgram };
