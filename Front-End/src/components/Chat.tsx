import { InterviewerType } from "@/utils/types";
import Message from "./Message";
import { useAppSelector } from "@/redux/store";

const Chat = ({interviewer}:{interviewer: InterviewerType | undefined}) =>{
    const {chatLog, currentSpeaker} = useAppSelector(state => state.chatLog);
    const interviewerName = interviewer?.name.split("(")[0];

    return (
        <div className="row-span-2 border-l-[4px] border-[#7879F1] font-Montserrat h-[100vh]">
            <div className="w-full h-[min(80px,_20%)] bg-[#7879F1] flex items-center justify-center text-black font-semibold">
                <h2 className="text-3xl">
                    {interviewerName}
                </h2>
            </div>
            <div className="flex flex-col h-[calc(100vh-min(80px,_20%))] overflow-y-scroll hide-scrollbar">
                {chatLog.map((person, i) => <Message person={person} key={i} />)}
                <Message person={currentSpeaker}/>
            </div>
        </div>
    )
}

export default Chat;