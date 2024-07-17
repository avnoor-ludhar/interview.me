import { useRef, useState } from "react";

const useVideo = () => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [isVideoOn, setIsVideoOn] = useState<boolean>(false);

    const stopVideo = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            const tracks = stream.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
            setIsVideoOn(false);
        }
    };

    const startVideo = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setIsVideoOn(true);
            }
        } catch (err) {
            console.error('Error accessing the camera: ', err);
        }
    };

    return { videoRef, isVideoOn, startVideo, stopVideo };
};

export default useVideo;
