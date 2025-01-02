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
    fromIntake: boolean;
    firstName: string;
    lastName: string;
    jobType: string;
    position: string;
    jobDescription: string;
    interviewer: InterviewerType;
}

export type {ChatLogState, MediaStreamRecorderType, speaker, bodyTTS, dataFromGemini, audioDataFromTTS, UseWebSocketHook, audioQueueState, WebSocketMessage, MeetingState, InterviewerType};