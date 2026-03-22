CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    email citext,
    password_hash VARCHAR(512)
);

CREATE TABLE Interviews(
	id SERIAL PRIMARY KEY,
	user_id INTEGER REFERENCES users(id),
    typeOfInterview VARCHAR(252),
	institution VARCHAR(252),
    score INTEGER,
    feedback VARCHAR(252)
    CONSTRAINT score_check CHECK (score >= 1 AND score <= 10)
);

CREATE TABLE QAOfInterview(
    id SERIAL PRIMARY KEY,
    interview_id INTEGER REFERENCES Interviews(id),
    chat TEXT
);

CREATE TABLE refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used TIMESTAMP
);

ALTER TABLE QAOfInterview
ADD COLUMN feedback TEXT;

ALTER TABLE interviews
ADD COLUMN interview_date DATE;

ALTER TABLE interviews
ADD COLUMN intake JSONB;
