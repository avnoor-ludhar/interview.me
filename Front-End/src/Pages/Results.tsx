import { useAppSelector } from "@/redux/store";
import { MeetingState } from "@/utils/types";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Results = () =>{
    const location = useLocation();
    const navigate = useNavigate();

    const interviewId: number = location.state.interviewId;
    const state: MeetingState = location.state.state;
    const fromMeeting: boolean | undefined = location.state.fromMeeting;
    
    const user = useAppSelector(state=>state.user.user);

    useEffect(() =>{
        if (!user) {
            navigate('/');
        }else if (!fromMeeting) {
            navigate("/home");
        }
    }, [user, fromMeeting]);

    return(
        <div>
            Hello there!
        </div>
    )
}

export default Results;