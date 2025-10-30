import { useRef, useState } from "react";
import * as Sentry from '@sentry/react';

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
                
                // Track successful video start
                Sentry.addBreadcrumb({
                    message: 'Video stream started successfully',
                    category: 'media',
                    level: 'info'
                });
            }
        } catch (err) {
            console.error('Error accessing the camera: ', err);
            
            // Capture camera access errors with specific context
            Sentry.captureException(err, {
                tags: {
                    component: 'useVideo',
                    action: 'camera-access-failed',
                    mediaType: 'video'
                },
                extra: {
                    errorName: err instanceof Error ? err.name : 'Unknown',
                    userAgent: navigator.userAgent,
                    hasVideoElement: !!videoRef.current
                }
            });
            
            // Add specific error messages for common issues
            if (err instanceof Error) {
                if (err.name === 'NotAllowedError') {
                    Sentry.withScope((scope) => {
                        scope.setLevel('warning');
                        scope.setTag('component', 'useVideo');
                        scope.setTag('action', 'permission-denied');
                        Sentry.captureMessage('User denied camera permission');
                    });
                } else if (err.name === 'NotFoundError') {
                    Sentry.withScope((scope) => {
                        scope.setLevel('error');
                        scope.setTag('component', 'useVideo');
                        scope.setTag('action', 'no-camera');
                        Sentry.captureMessage('No camera device found');
                    });
                } else if (err.name === 'NotReadableError') {
                    Sentry.withScope((scope) => {
                        scope.setLevel('error');
                        scope.setTag('component', 'useVideo');
                        scope.setTag('action', 'camera-in-use');
                        Sentry.captureMessage('Camera is already in use');
                    });
                }
            }
        }
    };

    return { videoRef, isVideoOn, startVideo, stopVideo };
};

export default useVideo;
