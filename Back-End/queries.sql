CREATE TABLE Interviews(
	id SERIAL PRIMARY KEY,
	user_id INTEGER REFERENCES users(id),
    typeOfInterview VARCHAR(252),
	institution VARCHAR(252),
    score INTEGER,
    CONSTRAINT score_check CHECK (score >= 1 AND score <= 10)
);

CREATE TABLE QAOfInterview(
    id SERIAL PRIMARY KEY,
    interview_id INTEGER REFERENCES Interviews(id),
    question VARCHAR(512),
    transcriptionAnswer TEXT
);

CREATE TABLE refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used TIMESTAMP
);
