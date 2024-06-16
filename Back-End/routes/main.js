import express from 'express';
import requireAuth from '../middleware/requireAuth.js';
import { dataFunc, textToSpeechDeepgram } from '../controllers/mainController.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', dataFunc);

router.post('/tts', textToSpeechDeepgram);

export default router;