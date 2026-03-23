import { useState } from "react";
import { FeedbackData } from "@/utils/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

type FeedbackCarouselProps = {
    feedback: FeedbackData | null;
};

const starKeys = ["situation", "task", "action", "result"] as const;

type CarouselCard =
    | { type: "summary" }
    | { type: "star"; starKey: typeof starKeys[number] }
    | { type: "mockAnswer" }
    | { type: "suggestions" };

const buildCards = (feedback: FeedbackData): CarouselCard[] => [
    { type: "summary" },
    ...starKeys.map((k: typeof starKeys[number]) => ({ type: "star" as const, starKey: k })),
    ...(feedback.mockAnswer ? [{ type: "mockAnswer" as const }] : []),
    ...(feedback.suggestions?.length ? [{ type: "suggestions" as const }] : []),
];

const cardStyle = "bg-gradient-to-br from-indigo-600/30 to-purple-700/30 rounded-2xl p-5 border border-indigo-500/40";

const FeedbackCarousel = ({ feedback }: FeedbackCarouselProps) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [animating, setAnimating] = useState(false);

    if (!feedback) {
        return <p className="text-gray-400 text-sm mt-4">No feedback available yet.</p>;
    }

    const cards = buildCards(feedback);
    const total = cards.length;

    const goTo = (newIndex: number) => {
        if (newIndex === activeIndex) return;
        setAnimating(true);
        setTimeout(() => {
            setActiveIndex(newIndex);
            setAnimating(false);
        }, 150);
    };

    const prev = () => goTo(activeIndex === 0 ? total - 1 : activeIndex - 1);
    const next = () => goTo(activeIndex === total - 1 ? 0 : activeIndex + 1);

    const current = cards[activeIndex];

    const renderCard = () => {
        switch (current.type) {
            case "summary":
                return (
                    <div className={cardStyle}>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-full bg-indigo-500/30 border border-indigo-400/50 flex items-center justify-center">
                                <span className="text-xl font-bold text-white">{feedback.grade}</span>
                            </div>
                            <div>
                                <p className="text-xs text-indigo-300 uppercase tracking-wider font-semibold">Overall Grade</p>
                                <p className="text-white text-sm font-medium">{feedback.grade}/10</p>
                            </div>
                        </div>
                        <p className="text-gray-200 text-sm leading-relaxed">{feedback.summary}</p>
                    </div>
                );

            case "star": {
                const cat = feedback.star[current.starKey];
                return (
                    <div className={cardStyle}>
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-indigo-200 font-semibold text-base capitalize">{current.starKey}</h4>
                            <span className="text-white text-sm font-bold">{cat.score}/10</span>
                        </div>
                        {cat.issues.length > 0 && (
                            <div className="mb-2">
                                <p className="text-xs text-red-400 uppercase tracking-wider font-semibold mb-1">Issues</p>
                                <ul className="text-gray-200 text-sm space-y-0.5 list-disc list-inside">
                                    {cat.issues.map((issue: string, i: number) => <li key={i}>{issue}</li>)}
                                </ul>
                            </div>
                        )}
                        {cat.improvements.length > 0 && (
                            <div>
                                <p className="text-xs text-emerald-400 uppercase tracking-wider font-semibold mb-1">Improvements</p>
                                <ul className="text-gray-200 text-sm space-y-0.5 list-disc list-inside">
                                    {cat.improvements.map((tip: string, i: number) => <li key={i}>{tip}</li>)}
                                </ul>
                            </div>
                        )}
                    </div>
                );
            }

            case "mockAnswer":
                return (
                    <div className={cardStyle}>
                        <h4 className="text-indigo-200 font-semibold mb-2 text-base">Mock Answer</h4>
                        <p className="text-gray-200 text-sm leading-relaxed">{feedback.mockAnswer}</p>
                    </div>
                );

            case "suggestions":
                return (
                    <div className={cardStyle}>
                        <h4 className="text-indigo-200 font-semibold mb-2 text-base">Suggestions</h4>
                        <ul className="text-gray-200 text-sm space-y-1 list-disc list-inside">
                            {feedback.suggestions.map((s: string, i: number) => <li key={i}>{s}</li>)}
                        </ul>
                    </div>
                );
        }
    };

    return (
        <div className="mt-4 flex flex-col items-center gap-4">
            <div className="relative w-full min-h-[180px] flex items-center justify-center">
                {/* Left Arrow */}
                <button
                    onClick={prev}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full bg-gray-700/60 hover:bg-gray-600 transition-colors"
                >
                    <ChevronLeft className="w-5 h-5 text-white" />
                </button>

                {/* Card */}
                <div
                    className={`w-[85%] transition-all duration-150 ${
                        animating ? "opacity-0 scale-95 translate-y-1" : "opacity-100 scale-100 translate-y-0"
                    }`}
                >
                    {renderCard()}
                </div>

                {/* Right Arrow */}
                <button
                    onClick={next}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full bg-gray-700/60 hover:bg-gray-600 transition-colors"
                >
                    <ChevronRight className="w-5 h-5 text-white" />
                </button>
            </div>

            {/* Dots */}
            <div className="flex gap-2">
                {cards.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => goTo(i)}
                        className={`w-2 h-2 rounded-full transition-all ${
                            i === activeIndex ? "bg-indigo-400 w-4" : "bg-gray-600"
                        }`}
                    />
                ))}
            </div>
        </div>
    );
};

export default FeedbackCarousel;
