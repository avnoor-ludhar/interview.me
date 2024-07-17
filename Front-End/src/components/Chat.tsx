import { speaker } from "@/utils/types";
import Message from "./Message";

type chatProps = {
    chatLog: speaker[],
    currentSpeaker: speaker
}

const Chat = ({chatLog, currentSpeaker}: chatProps) =>{
    return (
        <div className="row-span-2 border-l-[4px] border-[#7879F1] font-Montserrat h-[100vh]">
            <div className="w-full h-[min(80px,_20%)] bg-[#7879F1] flex items-center justify-center text-black font-semibold">
                <h2 className="text-3xl">
                    Mellisa
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