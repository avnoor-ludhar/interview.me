import { AiCircleProps } from "@/utils/types";


const AiCircle = ({ interviewer, currentSpeaker }: AiCircleProps) => {
  const interviewerName = interviewer?.name.split("(")[0];

  return (
    <div className="h-full flex flex-col items-center justify-center">
        <div className="relative">
            {/* Outer Gradient Circle */}
            <div
                className={`flex items-center justify-center w-48 h-48 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 ${
                currentSpeaker.speaker == "Gemini" && 'animate-pulse'
                } blur-[6px]`}
            />

            {/* Inner White Circle */}
            <div className="absolute inset-0 flex items-center justify-center w-36 h-36 m-auto rounded-full bg-white shadow-xl">
                <p className="text-black font-bold text-2xl">{interviewerName}</p>
            </div>
        </div>
    </div>
  );
};

export default AiCircle;
