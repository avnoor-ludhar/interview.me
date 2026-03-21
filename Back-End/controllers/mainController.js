import dotenv from 'dotenv';
import db from "../dbConnection.js";
import { VertexAI } from '@google-cloud/vertexai';
import { createClient } from "@deepgram/sdk";
import * as Sentry from '@sentry/node';
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
  // Create a span for the start interview operation
  const startInterviewSpan = Sentry.startSpan({
    op: 'interview.start',
    name: 'Start Interview',
    tags: {
      user_id: req.user?.id,
      interview_type: req.body?.typeofinterview,
      company: req.body?.company
    }
  }, async () => {
    const user = req.user;
    const typeofinterview = req.body?.typeofinterview;
    const institution = req.body?.company;

    try {
      // Create span for database insert
      const dbSpan = Sentry.startSpan({
        op: 'db.query',
        name: 'Create Interview Record'
      }, async () => {
        return await db.query(
          "INSERT INTO interviews (user_id, typeofinterview, institution, interview_date) VALUES ($1, $2, $3, $4) RETURNING *", 
          [user.id, typeofinterview, institution, new Date()]
        );
      });

      const { rows } = await dbSpan;
      return res.status(201).json({ interviewId: rows[0].id });
    } catch (error) {
      console.error(error);
      return res.status(403).json({ error: "Could not insert into database." });
    }
  });

  return await startInterviewSpan;
};

// Text-to-Speech Deepgram Function
const textToSpeechDeepgram = async (req, res) => {
  // Create a span for the TTS operation
  const ttsSpan = Sentry.startSpan({
    op: 'ai.text_to_speech',
    name: 'Deepgram Text-to-Speech',
    tags: {
      model: req.body?.model,
      text_length: req.body?.text?.length
    }
  }, async () => {
    const { text, chunkNumber, model } = req.body;

    if (!text || typeof text !== 'string' || text.trim() === '') {
      return res.status(400).send("Invalid text input");
    }

    try {
      // Create span for Deepgram API call
      const deepgramSpan = Sentry.startSpan({
        op: 'ai.deepgram_speak',
        name: 'Deepgram Speak API Call'
      }, async () => {
        return await deepgram.speak.request({ text }, { model });
      });

      const response = await deepgramSpan;
      const stream = await response.getStream();

      // Create span for audio processing
      const audioSpan = Sentry.startSpan({
        op: 'ai.audio_processing',
        name: 'Process Audio Stream'
      }, async () => {
        let audioData = [];
        for await (const chunk of stream) {
          audioData.push(chunk);
        }

        const completeAudioBuffer = Buffer.concat(audioData);
        const audioBase64 = completeAudioBuffer.toString('base64');
        return audioBase64;
      });

      const audioBase64 = await audioSpan;

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
  });

  return await ttsSpan;
};

// Function to evaluate interview
const evaluateInterview = async (chatLog) => {
  // Create a span for the AI evaluation
  const evaluationSpan = Sentry.startSpan({
    op: 'ai.gemini_evaluation',
    name: 'Gemini Interview Evaluation',
    tags: {
      model: 'gemini-1.5-flash-002',
      chat_log_length: chatLog?.length
    }
  }, async () => {
    try {
      const feedbackPrompt = `
        You will be provided with a text transcription based on an interview. The criteria is STAR method. 
        Provide detailed feedback based on a rubric you will create and deem fit for an interview. 
        State specifically what the user did incorrectly for each section of the rubric, and provide a mock 
        answer that is well done. Include suggestions for improvement. Do not send the rubric, just keep it mentally you should not be able to see it. 
        Return ONLY valid JSON with this exact shape:
        {
          "grade": number,
          "summary": string,
          "sections": [
            {
              "title": string,
              "content": string
            }
          ]
        }
        The grade must be an integer from 1 to 10.
        Do not wrap the JSON in markdown fences.

        Here is the interview transcription:
        ${JSON.stringify(chatLog)}
      `;

      const feedbackRequest = {
        contents: [{ role: 'user', parts: [{ text: feedbackPrompt }] }],
      };

      // Create span for Gemini API call
      const geminiSpan = Sentry.startSpan({
        op: 'ai.gemini_generate',
        name: 'Gemini Generate Content'
      }, async () => {
        return await generativeModel.generateContent(feedbackRequest);
      });

      const feedbackResult = await geminiSpan;
      const detailedFeedback = feedbackResult.response.candidates[0].content.parts[0].text;
      const parsed = JSON.parse(detailedFeedback);

      return {
        score: parsed.grade,
        feedback: JSON.stringify(parsed),
      };
    } catch (error) {
      console.error("Error evaluating interview:", error);
      return { error: "Failed to evaluate interview." };
    }
  });

  return await evaluationSpan;
};

// End Interview Function
const endInterview = async (req, res) => {
  // Create a span for the end interview operation
  const endInterviewSpan = Sentry.startSpan({
    op: 'interview.end',
    name: 'End Interview',
    tags: {
      interview_id: req.body?.interviewId,
      chat_log_length: req.body?.chatLog?.length
    }
  }, async () => {
    const { interviewId, chatLog } = req.body;

    if (!interviewId || !chatLog) {
      return res.status(400).json({ error: "Missing interview ID or chat log." });
    }

    try {
      const date = new Date();
      
      // Create span for initial database insert
      const initialDbSpan = Sentry.startSpan({
        op: 'db.query',
        name: 'Insert Interview Chat Log'
      }, async () => {
        return await db.query(
          "INSERT INTO QAOfInterview (interview_id, chat, feedback) VALUES ($1, $2, $3) RETURNING *", 
          [interviewId, JSON.stringify(chatLog), null]
        );
      });

      const { rows } = await initialDbSpan;

      // Create span for AI evaluation
      const evaluationSpan = Sentry.startSpan({
        op: 'ai.evaluation',
        name: 'AI Interview Evaluation'
      }, async () => {
        return await evaluateInterview(chatLog);
      });

      const evaluation = await evaluationSpan;

      if (evaluation.error) {
        return res.status(500).json({ error: "Failed to evaluate interview." });
      }

      const { score, feedback } = evaluation;

      // Create span for score update
      const scoreUpdateSpan = Sentry.startSpan({
        op: 'db.query',
        name: 'Update Interview Score'
      }, async () => {
        return await db.query(
          "UPDATE interviews SET score = $1 WHERE id = $2",
          [score, interviewId]
        );
      });

      // Create span for feedback update
      const feedbackUpdateSpan = Sentry.startSpan({
        op: 'db.query',
        name: 'Update Interview Feedback'
      }, async () => {
        return await db.query(
          "UPDATE QAOfInterview SET feedback = $1 WHERE interview_id = $2",
          [feedback, interviewId]
        );
      });

      await scoreUpdateSpan;
      await feedbackUpdateSpan;

      return res.status(201).json({
        record: rows[0],
        score: score,
        feedback: feedback,
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error." });
    }
  });

  return await endInterviewSpan;
};

const getFeedback = async (req, res) => {
  const interviewId = req.params.id;

  try {
      // Query feedback from the database
      const { rows } = await db.query(
          "SELECT * FROM QAOfInterview WHERE interview_id = $1",
          [interviewId]
      );

      if (rows.length === 0) {
          return res.status(404).json({ error: "No data found for this interview." });
      }

      // Return the feedback and chat data
      return res.status(200).json(rows[0]);
  } catch (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Internal Server Error" });
  }
}

const getRecentInterview = async (req, res) => {
    try{
      const { rows: recentInterviews } = await db.query(
        'SELECT id, institution, typeofinterview, score, interview_date FROM interviews WHERE score IS NOT NULL ORDER BY interview_date DESC LIMIT 3'
      );

      const { rows: latestInterviewRows } = await db.query(
        'SELECT q.chat, q.feedback FROM QAOfInterview q JOIN interviews i ON i.id = q.interview_id ORDER BY i.interview_date DESC, i.id DESC LIMIT 1'
      );

      res.status(200).json({
        recentInterviews,
        latestInterview: latestInterviewRows[0] || null,
      });
    }catch(err){
      console.log("Database error: ", err);
      res.status(500).json({error: "Internal Server Error"})
    }
};


export { startInterview, endInterview, textToSpeechDeepgram, getFeedback, getRecentInterview};
