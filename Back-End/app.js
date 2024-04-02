import express from 'express';
import jwt from 'jsonwebtoken';
import userRoutes from './routes/user.js';
import mainRoutes from './routes/main.js';
import dotenv from 'dotenv';
import cors from 'cors';
import db from './dbConnection.js';
dotenv.config();

const app = express();

db.connect();

app.use(
	cors({
		origin: "http://localhost:5173",
		methods: "GET,POST,PUT,PATCH,DELETE",
		credentials: true,
	})
);

app.use(express.json());

app.use((req, res, next) => {
    console.log(req.path, req.method);
    next();
});


app.use("/api/user", userRoutes);

app.use('/api/home', mainRoutes);

app.listen(process.env.PORT, ()=>{
    console.log("listening on port 8080");
})