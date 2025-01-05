import express from 'express';
import requireAuth from '../middleware/requireAuth.js';
import db from '../dbConnection.js';
import { startInterview, textToSpeechDeepgram, endInterview } from '../controllers/mainController.js';

// Create router instance
const router = express.Router();

// Protect all routes below with requireAuth middleware
router.use(requireAuth);

// Text-to-Speech Route
router.post('/tts', textToSpeechDeepgram);

// Start Interview Route
router.get('/startInterview', startInterview);

// End Interview Route
router.post('/endInterview', endInterview);

// Fetch Interview Feedback Route
router.get('/feedback/:id', async (req, res) => {
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
});

export default router;
