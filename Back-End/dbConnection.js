import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config()

//error could be here
const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "InterviewME",
    password: process.env.PASSWORD,
    port: 5432,
  });

export default db;