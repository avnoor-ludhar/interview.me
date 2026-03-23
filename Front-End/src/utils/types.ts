type Speaker = {
    speaker: string,
    text: string
};

type bodyTTS = {
    text: string,
    model: string,
    chunkNumber: number
};

type dataFromGemini = {
    chunk: string,
    chunkNumber: number
};

type audioDataFromTTS = {
    audio: string, 
    chunkNumber: number,
    chunkText: string
};

type UseWebSocketHook = {
    socketRef: React.MutableRefObject<WebSocket | null>,
    isConnected: boolean,
    disconnect: () => void,
    connect: (url: string) => void,
    interviewId: number | null
}

type MediaStreamRecorderType = {
    MediaRecorder: MediaRecorder | null,
    MediaStream: MediaStream | null
}

type audioQueueState = {
    audioQueue: audioDataFromTTS[],
    prevChunkNumber: number,
    playChunkFlag: boolean,
}

type ChatLogState = {
    chatLog: Speaker[],
    currentSpeaker: Speaker;
    prevChunkNumber: number;
    queueForGemini: dataFromGemini[];
}
type WebSocketMessage = {
    chunk?: string;
    transcript?: string;
}

type InterviewerType = {name: string, model: string}

type MeetingState = { //alter this
    fromIntake?: boolean;
    firstName: string;
    lastName: string;
    jobType: string;
    position: string;
    jobDescription: string;
    interviewer?: InterviewerType;
    companyName: string;
    university: string;
    major: string;
}

type videoProps = {
    videoRef: React.MutableRefObject<HTMLVideoElement | null>,
    stopVideo: () => void,
    startVideo: () => void,
    isRecording: boolean
};

type AiCircleProps = {
    interviewer: InterviewerType | undefined,
    currentSpeaker: Speaker
}

type ChatLogProps = {interviewer: InterviewerType | undefined, 
    isConnected: boolean, 
    handleRecord: () => void
}

type StarCategory = {
    score: number,
    issues: string[],
    improvements: string[]
}

type StarFeedback = {
    situation: StarCategory,
    task: StarCategory,
    action: StarCategory,
    result: StarCategory
}

type FeedbackData = {
    grade: number,
    summary: string,
    star: StarFeedback,
    mockAnswer: string,
    suggestions: string[]
}

type interviewContent = {
    id: number,
    interview_id: number,
    chat: string,
    feedback: string | null
}

type dataForResults = { //alter this
    id: number,
    interview_id: number,
    chat: Speaker[],
    feedback: FeedbackData | null
}

type ViewChatLogProps = {
    interviewer: InterviewerType | undefined, 
    chatLog: Speaker[] | undefined
}


export type {ChatLogState, MediaStreamRecorderType, Speaker, bodyTTS, dataFromGemini, audioDataFromTTS, UseWebSocketHook, audioQueueState, WebSocketMessage, MeetingState, InterviewerType, videoProps, AiCircleProps, ChatLogProps, StarCategory, StarFeedback, FeedbackData, interviewContent, dataForResults, ViewChatLogProps};