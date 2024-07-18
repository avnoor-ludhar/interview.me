import { RxCross2 } from "react-icons/rx";
import { FaMicrophone, FaMicrophoneSlash, FaPlay } from "react-icons/fa";
import { BsCameraVideoFill, BsCameraVideoOffFill} from "react-icons/bs";
import { Button } from "./ui/button";

type MeetingOptionsProps = {
    isConnected: boolean,
    handleRecord: () => void,
    stopVideo: () => void,
    startVideo: () => void,
    isVideoOn: boolean,
    isRecording: boolean,
    toggleMute: () => void
}


const MeetingOptions = ({isConnected, handleRecord, stopVideo, startVideo, isVideoOn, isRecording, toggleMute}: MeetingOptionsProps) =>{
    return(
        <div className="col-span-2 flex items-center justify-center border-t-[4px] border-[#7879F1]">
            <div className="w-[300px] h-[70%] flex items-center justify-evenly">
                <Button variant="outline" size="icon" className="rounded-full w-14 h-14" onClick={toggleMute}>
                    {isRecording ? <FaMicrophone className="rounded-full scale-[2.2] text-white"/> : <FaMicrophoneSlash className="rounded-full scale-[2.7] text-white"/>}
                </Button>
                
                <Button variant="outline" size="icon" className="rounded-full w-14 h-14 border-[#7879F1] border-2 hover:bg-[#7879F1] text-white hover:text-black" onClick={handleRecord}>
                    {isConnected ? <RxCross2 className="rounded-full scale-[3.2]"/> : <FaPlay className="scale-[2]"/>}
                </Button>
                
                <Button variant="outline" size="icon" className="rounded-full w-14 h-14" onClick={isVideoOn ? stopVideo : startVideo}>
                    {isVideoOn ?  <BsCameraVideoFill className="scale-[2] text-white"/> : <BsCameraVideoOffFill className="scale-[2] text-white"/>}
                </Button>
            </div>
        </div>
    )
}

export default MeetingOptions;