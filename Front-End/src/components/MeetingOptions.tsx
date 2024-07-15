import { RxCross2 } from "react-icons/rx";
import { FaMicrophone } from "react-icons/fa";
import { FaCamera } from "react-icons/fa";
import { Button } from "./ui/button";

const MeetingOptions = () =>{
    return(
        <div className="col-span-2 flex items-center justify-center border-t-[4px] border-[#7879F1]">
            <div className="w-[300px] h-[70%] flex items-center justify-evenly">
                <Button variant="outline" size="icon" className="rounded-full w-12 h-12">
                    <FaMicrophone className="rounded-full scale-[1.8] text-white"/>
                </Button>
                
                <Button variant="outline" size="icon" className="rounded-full w-12 h-12 border-[#7879F1] border-2 hover:bg-[#7879F1] text-white hover:text-black">
                    <RxCross2 className="rounded-full scale-[2.5]"/>
                </Button>
                
                <Button variant="outline" size="icon" className="rounded-full w-12 h-12">
                    <FaCamera className="scale-[1.7] text-white"/>
                </Button>
                    

            </div>
        </div>
    )
}

export default MeetingOptions;