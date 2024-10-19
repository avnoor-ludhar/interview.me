import { useEffect, useRef } from "react";

type videoProps = {
    videoRef: React.MutableRefObject<HTMLVideoElement | null>,
    stopVideo: () => void,
    startVideo: () => void
}

const Video = ({videoRef, stopVideo, startVideo}: videoProps) =>{

    useEffect(()=>{

        startVideo();

        return () => {
            stopVideo();
        }
    }, [])
    return (
        <div className="flex items-center justify-center col-span-2">
            <video className="w-full h-full object-cover overflow-hidden max-h-[87vh]" ref={videoRef} autoPlay playsInline/>
        </div>
    )
}

export default Video;