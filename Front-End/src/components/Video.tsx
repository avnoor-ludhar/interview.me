import { videoProps } from "@/utils/types";
import { useEffect } from "react";
import { BiMicrophone, BiMicrophoneOff } from "react-icons/bi";

const Video = ({ videoRef, stopVideo, startVideo, isRecording }: videoProps) => {
    useEffect(() => {
        startVideo();
        return () => {
            stopVideo();
        };
    }, []);

    return (
        <div className="flex items-end justify-center h-full">
            <div className="relative w-[300px] h-[180px] rounded-2xl">
                <video
                    className="rounded-2xl w-full h-full object-cover overflow-hidden max-h-[87vh]"
                    ref={videoRef}
                    autoPlay
                    playsInline
                />
                <div className="absolute right-0 bottom-0 h-10 w-16 bg-black/60 z-20 rounded-3xl flex flex-row items-center justify-evenly">
                    {isRecording ? (
                        <BiMicrophone className="rounded-full scale-[1.2] text-white text-[14px] font-light" />
                    ) : (
                        <BiMicrophoneOff className="rounded-full scale-[1.2] text-white text-[14px] font-light" />
                    )}
                    <p className="text-md font-light text-white">You</p>
                </div>
            </div>
        </div>
    );
};

export default Video;
