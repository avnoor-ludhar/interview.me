import { useEffect, useRef, useState } from "react";
import { ChatLogProps } from "@/utils/types";
import Message from "./Message";
import { useAppSelector } from "@/redux/store";

const Chat = ({interviewer, isConnected, handleRecord}:ChatLogProps) =>{
    const {chatLog, currentSpeaker} = useAppSelector(state => state.chatLog);
    const interviewerName = interviewer?.name.split("(")[0];
    const chatEndRef = useRef<HTMLDivElement | null>(null);
    const [scrollTop, setScrollTop] = useState(0);
    const chatContainerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, [chatLog]);

    const handleScroll = () => {
        if (chatContainerRef.current) {
            setScrollTop(chatContainerRef.current.scrollTop);
        }
    };

    return (
        <div className="w-1/4 h-full flex flex-col justify-center">
            <div 
                className="relative w-full h-2/3 flex flex-col  overflow-y-scroll mb-4 hide-scrollbar"
                ref={chatContainerRef}
                onScroll={handleScroll}
            >
                <div className="mt-auto" />
                
                <div 
                    className={`absolute left-0 w-full h-1/3 bg-gradient-to-b from-black/80 to-black/10 z-50`} 
                    style={{
                        top: scrollTop-20
                    }}
                />

                {chatLog.map((person, i) => <Message person={person} interviewerName={interviewerName} key={i} />)}
                <Message person={currentSpeaker} interviewerName={interviewerName}/>
                
                <div ref={chatEndRef} />
            </div>
            <div 
                className="w-full h-14 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-indigo-600/30 rounded-full border-2 border-purple-500/30 hover:opacity-70 flex items-center justify-center"
                onClick={handleRecord}
            >
                    <p className="pointer-events-none">
                        {isConnected ? "Finished? Click to end" : "Start the interview"}
                    </p>
            </div>
        </div>
    )
}

export default Chat;