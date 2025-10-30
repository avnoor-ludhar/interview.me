import { useRef, useState } from "react";
import { start } from "@/utils/microphone";
import { MeetingState } from "@/utils/types";
import * as Sentry from '@sentry/react';

const isJSON = (str: string) => {
    try {
        JSON.parse(str);
        return true;
    } catch {
        return false;
    }
};


const useWebSocket = (handleWebSocketMessage: (data: any) => void, microphoneRef: React.MutableRefObject<MediaRecorder | null>, streamRef: React.MutableRefObject<MediaStream | null>, setIsRecording: React.Dispatch<React.SetStateAction<boolean>>, state: MeetingState) => {
    const socketRef = useRef<null | WebSocket>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [interviewId, setInterviewId] = useState<number | null>(null);

    const connect = (url: string) => {
        try {
            socketRef.current = new WebSocket(url);

            socketRef.current.addEventListener('open', async () =>{
                console.log("WebSocket connection opened");
                
                // Track successful WebSocket connection
                Sentry.addBreadcrumb({
                    message: 'WebSocket connection established',
                    category: 'websocket',
                    level: 'info',
                    data: { url, state: state.interviewer ? 'with-interviewer' : 'no-interviewer' }
                });

                if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN && state.interviewer) {
                    socketRef.current.send(JSON.stringify({ type: 'start_deepgram_session', firstName: state.firstName, lastName: state.lastName, jobDescription: state.jobDescription, jobType: state.jobType, position: state.position, interviewerName: state.interviewer.name.split("(")[0], companyName: state.companyName}));
                    setIsConnected(true);
                } else {
                    console.error("WebSocket is not open or 'this' is not the WebSocket instance.");
                    
                    // Capture WebSocket state error
                    Sentry.withScope((scope) => {
                        scope.setLevel('warning');
                        scope.setTag('component', 'useWebSocket');
                        scope.setTag('action', 'connection-state-error');
                        scope.setExtra('readyState', socketRef.current?.readyState);
                        scope.setExtra('hasInterviewer', !!state.interviewer);
                        scope.setExtra('url', url);
                        Sentry.captureMessage('WebSocket connection opened but not in expected state');
                    });
                }

                await start(socketRef.current as WebSocket, microphoneRef, streamRef, setIsRecording);
            });
        } catch (error) {
            // Capture WebSocket connection errors
            Sentry.captureException(error, {
                tags: {
                    component: 'useWebSocket',
                    action: 'connection-failed'
                },
                extra: {
                    url,
                    hasInterviewer: !!state.interviewer,
                    companyName: state.companyName
                }
            });
            throw error;
        }

        socketRef.current.addEventListener("message", (event) => {
            try {
                if (isJSON(event.data)) {
                    const data = JSON.parse(event.data);

                    if (data.type === 'interviewId') {
                        setInterviewId(data.interviewId);
                        console.log("Received interviewId:", data.interviewId);
                        
                        // Track successful interview start
                        Sentry.addBreadcrumb({
                            message: 'Interview session started',
                            category: 'interview',
                            level: 'info',
                            data: { interviewId: data.interviewId }
                        });
                    } else {
                        handleWebSocketMessage(data);
                    }
                }
            } catch (error) {
                // Capture WebSocket message parsing errors
                Sentry.captureException(error, {
                    tags: {
                        component: 'useWebSocket',
                        action: 'message-parsing-error'
                    },
                    extra: {
                        rawData: event.data,
                        dataLength: event.data?.length
                    }
                });
            }
        });

        socketRef.current.addEventListener("close", (event) => {
            console.log("WebSocket connection closed");
            setIsConnected(false);
            
            // Track WebSocket disconnection
            Sentry.addBreadcrumb({
                message: 'WebSocket connection closed',
                category: 'websocket',
                level: 'info',
                data: { 
                    code: event.code, 
                    reason: event.reason,
                    wasClean: event.wasClean 
                }
            });
            
            // If connection was not clean, capture as error
            if (!event.wasClean) {
                Sentry.withScope((scope) => {
                    scope.setLevel('warning');
                    scope.setTag('component', 'useWebSocket');
                    scope.setTag('action', 'unexpected-close');
                    scope.setExtra('code', event.code);
                    scope.setExtra('reason', event.reason);
                    scope.setExtra('interviewId', interviewId);
                    Sentry.captureMessage('WebSocket connection closed unexpectedly');
                });
            }
        });

        socketRef.current.addEventListener("error", (error) => {
            console.log({ event: 'onerror', error });
            setIsConnected(false);
            
            // Capture WebSocket errors
            Sentry.captureException(error, {
                tags: {
                    component: 'useWebSocket',
                    action: 'websocket-error'
                },
                extra: {
                    interviewId,
                    url,
                    readyState: socketRef.current?.readyState
                }
            });
        });
    };

    //once all audio chunks are read and the audioQueue is empty we can then close the 
    //connection or I can not have an end message
    const disconnect = () => {
        if(socketRef.current !== null){
            if (socketRef.current.readyState === WebSocket.OPEN) {
                const endMessage = JSON.stringify({type: 'end_deepgram_session', firstName: state});
                console.log("Sending end session message:", endMessage);
                socketRef.current.send(endMessage);
                // socketRef.current.close();
            }
            socketRef.current.close();
        }
    };

    return { connect, disconnect, isConnected, socketRef, interviewId};
};

export default useWebSocket;