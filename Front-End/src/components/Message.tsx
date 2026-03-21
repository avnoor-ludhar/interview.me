import { Speaker } from "@/utils/types";

const Message = ({ person, interviewerName }: {person: Speaker, interviewerName: string | undefined}) =>{
    return(
        <>
            <div className={`relative w-full h-fit z-20 mb-4`}>
                <p className={`font-bold text-md mb-2 w-fit ${person.speaker == "Gemini" ?"bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 text-transparent bg-clip-text" : "text-white" }`}>
                    {person.speaker == "Gemini" ? (interviewerName || "Interviewer") : "You"}
                </p>
                <p className="relative text-sm text-left w-full">
                {person.text}
                </p>
            </div>
        </>
        
    )
}

export default Message;