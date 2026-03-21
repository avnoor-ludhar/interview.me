import express from 'express';
import requireAuth from '../middleware/requireAuth.js';
import db from '../dbConnection.js';
import { startInterview, textToSpeechDeepgram, endInterview, getFeedback, getRecentInterview, searchInterviews, getInterviewDetail } from '../controllers/mainController.js';

// Create router instance
const router = express.Router();

// Protect all routes below with requireAuth middleware
router.use(requireAuth);

// Text-to-Speech Route
router.post('/tts', textToSpeechDeepgram);

// Start Interview Route
router.post('/startInterview', startInterview);

// End Interview Route
router.post('/endInterview', endInterview);

// Fetch Interview Feedback Route
router.get('/feedback/:id', getFeedback);

router.get('/getRecentInterview', getRecentInterview)

router.get('/searchInterviews', searchInterviews)

router.get('/interviewDetail/:id', getInterviewDetail)

export default router;
