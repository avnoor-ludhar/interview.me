import { speaker } from "@/utils/types";

const Message = ({ person }: {person: speaker}) =>{
    return(
        <div className={`relative w-[min(80%,_300px)] h-fit ${person.speaker == "Gemini" ? 'bg-[#7879F1] self-start': 'bg-white self-end'} p-2 rounded-2xl m-4 z-10`}>
            <div className={`absolute bottom-0 ${person.speaker == "Gemini" ? 'left-[-10px] triangle-purple': 'right-[-10px] triangle-white'}`}></div>
            <p className="relative text-black text-sm text-left z-10">
               {person.text}
            </p>
        </div>
    )
}

export default Message;