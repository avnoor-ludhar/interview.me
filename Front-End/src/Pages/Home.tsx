import { useAppSelector } from "@/redux/store";
import { useEffect, useState } from "react";
import axios, {AxiosError, AxiosResponse} from "axios";
import { FaMicrophoneAlt } from "react-icons/fa";
import { useReactMediaRecorder, StatusMessages } from "react-media-recorder";

type responseData = {
    success: string
}

type mediaHookType = {
    status: StatusMessages,
    startRecording: () => void,
    stopRecording: () => void,
    mediaBlobUrl: undefined | string
}


//need to use clearBlobUrl function from the hook when we get data back from the whisper API

export default function Home(): JSX.Element{
    const user = useAppSelector(state=>state.user.user);
    const [data, setData] = useState<string | null>();
    const {status, startRecording, stopRecording, mediaBlobUrl}: mediaHookType = useReactMediaRecorder({audio: true})
    
    useEffect(()=>{
        const someFunction = async ()=>{
            try{

                const url:string = `${import.meta.env.VITE_REACT_APP_API_URL}/api/home/`;
    
                const response: AxiosResponse = await axios.get(url, {headers: {'Authorization': `Bearer ${user?.token}`}});
                const dataFromAPI: responseData = response.data;
                setData(dataFromAPI.success);
    
            } catch(err: unknown){
                if(axios.isAxiosError(err)){
                    const newError: AxiosError = err as AxiosError;
                    setData(newError.response?.data?.error ?? 'Unknown error');
                }else{
                    console.log("idk");
                }
            }
        }
        if(user){
            someFunction();
        } else{
            setData("ooga booga");
        }
        
        
    }, []);

    
    const handleRecord = () =>{
        if(status === 'recording'){
            stopRecording();
        } else{
            startRecording();
        }
    }
    
    return (
        <div>
            <p>{data}</p>
            <p>{user?.email}</p>
            <div className="flex flex-col items-center">
                <button className="mt-20 scale-[3] bg-red-600 p-1 rounded-full hover:opacity-80" onClick={handleRecord}><FaMicrophoneAlt /></button>
                <audio src={mediaBlobUrl} controls autoPlay loop className="mt-10"/>
            </div>
        </div>)
}