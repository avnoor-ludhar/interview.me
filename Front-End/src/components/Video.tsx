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
        <div className="flex items-center justify-center">
            <video className="w-full h-full object-cover" ref={videoRef} autoPlay playsInline/>
        </div>
    )
}

export default Video;