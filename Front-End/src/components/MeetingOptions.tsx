import { RxCross2 } from "react-icons/rx";
import { FaMicrophone } from "react-icons/fa";
import { BsCameraVideoFill } from "react-icons/bs";
import { BsCameraVideoOffFill } from "react-icons/bs";
import { Button } from "./ui/button";
import { FaPlay } from "react-icons/fa";

type MeetingOptionsProps = {
    isConnected: boolean,
    handleRecord: () => void,
    stopVideo: () => void,
    startVideo: () => void,
    isVideoOn: boolean
}


const MeetingOptions = ({isConnected, handleRecord, stopVideo, startVideo, isVideoOn}: MeetingOptionsProps) =>{
    return(
        <div className="col-span-2 flex items-center justify-center border-t-[4px] border-[#7879F1]">
            <div className="w-[300px] h-[70%] flex items-center justify-evenly">
                <Button variant="outline" size="icon" className="rounded-full w-14 h-14">
                    <FaMicrophone className="rounded-full scale-[2.2] text-white"/>
                </Button>
                
                <Button variant="outline" size="icon" className="rounded-full w-14 h-14 border-[#7879F1] border-2 hover:bg-[#7879F1] text-white hover:text-black" onClick={handleRecord}>
                    {isConnected ? <RxCross2 className="rounded-full scale-[3.2]"/> : <FaPlay className="scale-[2]"/>}
                </Button>
                
                <Button variant="outline" size="icon" className="rounded-full w-14 h-14" onClick={isVideoOn ? stopVideo : startVideo}>
                    {isVideoOn ? <BsCameraVideoOffFill className="scale-[2] text-white"/> : <BsCameraVideoFill className="scale-[2] text-white"/> }
                </Button>
            </div>
        </div>
    )
}

export default MeetingOptions;