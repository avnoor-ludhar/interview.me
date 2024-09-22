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
    connect: (url: string) => void
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
}

export type {ChatLogState, MediaStreamRecorderType, speaker, bodyTTS, dataFromGemini, audioDataFromTTS, UseWebSocketHook, audioQueueState};