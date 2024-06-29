import express from 'express';
import { loginUser, registerUser, logoutUser, sessionCheck, refreshToken } from '../controllers/userController.js'

const router = express.Router();

router.post("/login", loginUser);

router.post("/register", registerUser);

router.post("/logout", logoutUser);

router.get("/session", sessionCheck)

router.get("/refresh-token", refreshToken);

export default router;