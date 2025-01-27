import { ViewChatLogProps } from "@/utils/types";
import Message from "./Message";

const ChatToView = ({interviewer, chatLog}: ViewChatLogProps) =>{
    const interviewerName = interviewer?.name.split("(")[0];


    return (
        <div className="w-1/2 min-w-[350px] max-w-[500px] h-full flex flex-col justify-center">
            <div 
                className="relative w-full h-fit max-h-[400px] flex flex-col overflow-y-scroll mb-4 hide-scrollbar"
            >
                <div className="mt-auto" />

                {chatLog?.map((person, i) => <Message person={person} interviewerName={interviewerName} key={i} />)}
                
                <div />
            </div>
        </div>
    )
}

export default ChatToView;