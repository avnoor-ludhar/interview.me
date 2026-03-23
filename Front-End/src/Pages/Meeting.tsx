import { useAppSelector } from "@/redux/store";
import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MeetingState, UseWebSocketHook } from "@/utils/types";
import useWebSocket from "@/hooks/useWebSocket";
import useAudioQueue from "@/hooks/useAudioQueue";
import { useAppDispatch } from "@/redux/store";
import MeetingOptions from "@/components/MeetingOptions";
import Chat from "@/components/Chat";
import Video from "@/components/Video";
import useVideo from "@/hooks/useVideo";
import { clearQueue } from "@/redux/features/audioQueueSlice";
import { clearChatLog, resetSpeaker } from "@/redux/features/chatLogSlice";
import { handleWebSocketThunk } from "@/redux/features/chatLogThunk";
import { convertTextToSpeech } from "@/utils/convertTextToSpeech";
import AiCircle from "@/components/AiCircle";
import api from "@/lib/axios";
/*
Custom hooks allow us to store stateful logic in them. This means each
hook has a independant section compared to every other
call of the same hook. If hooks do not use 
any other hooks declare them as a normal function.

PURE FUNCTIONS:
- make sure there is a complete understanding of the output based on the input
- if we want to mutate a variable it must be defined in the scope of the function
since each component renders asynchronously. Try to express logic with rendering alone
useEffect should be last option.
*/

export default function Meeting(): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as MeetingState;
  //used to hold the transcription for the current speaker and the transcription
  const { currentSpeaker, chatLog } = useAppSelector((state) => state.chatLog);
  const user = useAppSelector((state) => state.user.user);
  const dispatch = useAppDispatch();
  //functions to see if the microphone is recording
  const [isRecording, setIsRecording] = useState<boolean>(false);
  //ref variable to hold the microphone
  const microphoneRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [killSocket, setKillSocket] = useState(false);
  //custom hook to keep track of all the functionality related to the audio queue

  const { currentAudio, setCurrentAudio } = useAudioQueue(setKillSocket);

  const handleWebSocketMessage = async (data: any) => {
    if (data.chunk && state.interviewer) {
      await convertTextToSpeech(data, dispatch, state.interviewer.model);
    }
    dispatch(handleWebSocketThunk(data));
  };

  const {
    connect,
    disconnect,
    isConnected,
    socketRef,
    interviewId,
  }: UseWebSocketHook = useWebSocket(
    handleWebSocketMessage,
    microphoneRef,
    streamRef,
    setIsRecording,
    state,
  );
  const { videoRef, stopVideo, startVideo, isVideoOn } = useVideo();

  const toggleMute = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsRecording((prevState) => !prevState);
    }
  };

  const handleRecord = () => {
    if (isConnected) {
      setKillSocket(true);
    } else {
      connect(import.meta.env.VITE_WEBSOCKET_URL);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/");
    } else if (!state?.fromIntake) {
      navigate("/home");
    }
  }, [user, state?.fromIntake]);

  useEffect(() => {
    if ((currentAudio && isRecording) || (!currentAudio && !isRecording)) {
      toggleMute();
    }
  }, [currentAudio, currentSpeaker]);

  useEffect(() => {
    // Navigate to results page
    if (killSocket) {
      navigate("/results", {
        state: {
          interviewId,
          state,
          fromMeeting: true,
        },
      });
    }
    // Cleanup function to run when the component unmounts or when `killSocket` changes
    return () => {
      // Stop the microphone if it's still active

      setCurrentAudio((audio) => {
        if (audio) {
          audio.src = "";
        }
        return null;
      });
      if (microphoneRef.current) {
        microphoneRef.current.stop();
        microphoneRef.current = null;
      }

      // Stop all tracks in the media stream to release the microphone or camera
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      // Disconnect the WebSocket if it's still connected
      if (isConnected) {
        socketRef.current?.send(
          JSON.stringify({
            type: "end_deepgram_session",
            chatLog: [...chatLog, currentSpeaker],
          }),
        );
        disconnect();
      }

      // Stop the video stream
      stopVideo();

      // Reset state to default values
      dispatch(clearQueue());
      dispatch(resetSpeaker());
      dispatch(clearChatLog());
      setIsRecording(false);
      setKillSocket(false);
      setCurrentAudio(null);
    };
  }, [killSocket]);

  return (
    <div className="h-[100vh] w-[100vw] absolute top-0 left-0 z-10">
      <div className="w-full h-4 flex flex-row justify-between items-center p-8">
        <p className="font-bold text-lg">InterviewME</p>
      </div>
      <div className="w-full h-[calc(100vh-100px)] flex flex-row items-center justify-between px-10 py-6 pr-24">
        <Video
          videoRef={videoRef}
          stopVideo={stopVideo}
          startVideo={startVideo}
          isRecording={isRecording}
        />
        <AiCircle
          interviewer={state?.interviewer}
          currentSpeaker={currentSpeaker}
        />
        {/* <MeetingOptions isConnected={isConnected} handleRecord={handleRecord} stopVideo={stopVideo} startVideo={startVideo} isVideoOn={isVideoOn} isRecording={isRecording} toggleMute={toggleMute} currentSpeaker={currentSpeaker} /> */}
        <Chat
          interviewer={state?.interviewer}
          isConnected={isConnected}
          handleRecord={handleRecord}
        />
      </div>
    </div>
  );
}
