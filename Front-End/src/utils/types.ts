type speaker = {
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
    chatLog: speaker[],
    currentSpeaker: speaker;
    prevChunkNumber: number;
    queueForGemini: dataFromGemini[];
}
type WebSocketMessage = {
    chunk?: string;
    transcript?: string;
}

type InterviewerType = {name: string, model: string}

type MeetingState = {
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
    currentSpeaker: speaker
}

type ChatLogProps = {interviewer: InterviewerType | undefined, 
    isConnected: boolean, 
    handleRecord: () => void
}

type interviewContent = {
    id: number,
    interview_id: number,
    chat: string,
    feedback: string | null
}

type dataForResults = {
    id: number,
    interview_id: number,
    chat: speaker[],
    feedback: string | null
}

type ViewChatLogProps = {
    interviewer: InterviewerType | undefined, 
    chatLog: speaker[] | undefined
}


export type {ChatLogState, MediaStreamRecorderType, speaker, bodyTTS, dataFromGemini, audioDataFromTTS, UseWebSocketHook, audioQueueState, WebSocketMessage, MeetingState, InterviewerType, videoProps, AiCircleProps, ChatLogProps, interviewContent, dataForResults, ViewChatLogProps};