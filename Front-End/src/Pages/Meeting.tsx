import { useAppSelector } from "@/redux/store";
import { useNavigate } from "react-router-dom";
import MeetingOptions from "@/components/MeetingOptions";
import Chat from "@/components/Chat";

const Meeting = () =>{
    const user = useAppSelector((state) => state.user.user);
    const navigate = useNavigate();

    if(!user){
        navigate('/login');
    }

    return (
        <div className="h-[100vh] w-[100vw] absolute top-0 left-0 bg-black z-10">
            <div className="w-full h-full grid grid-cols-[1.5fr_1.5fr_1fr] grid-rows-[0.9fr_0.1fr]">
                <div>
                    hello
                </div>
                <div>
                    hello
                </div>
                
                <Chat />
                <MeetingOptions />
            </div>
        </div>
    )
}

export default Meeting;