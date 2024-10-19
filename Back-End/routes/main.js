import express from 'express';
import requireAuth from '../middleware/requireAuth.js';
import { startInterview, textToSpeechDeepgram, endInterview } from '../controllers/mainController.js';

//express router a way to modularize route handlers
const router = express.Router();

//sets up the auth middleware on these routes which forces the request to go through
//the callback function before being allowed to access the other routes
router.use(requireAuth);

router.post('/tts', textToSpeechDeepgram);

router.get('/startInterview', startInterview);

router.post('/endInterview', endInterview);

export default router;