import { useAppSelector } from "@/redux/store";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Graph } from "../components/Graph";
import { Area } from "../components/Area";
import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { LogoutHook, useLogout } from "@/hooks/useLogout";
import * as Sentry from '@sentry/react';
import { Speaker, FeedbackData } from "@/utils/types";
import ChatToView from "@/components/ChatToView";
import FeedbackCarousel from "@/components/FeedbackCarousel";
import InterviewSearch from "@/components/InterviewSearch";


type RecentInterview = {
    id: number;
    institution: string;
    typeofinterview: string;
    score: number;
    interview_date: string;
};

type RecentInterviewResponse = {
    recentInterviews: RecentInterview[];
    latestInterview: {
        chat: string;
        feedback: string | null;
    } | null;
};

const Home = () => {
    const user = useAppSelector((state) => state.user.user);
    const navigate = useNavigate();
    const {logout}: LogoutHook = useLogout();
    const [recentInterviews, setRecentInterviews] = useState<RecentInterview[]>([]);
    const [latestInterviewChat, setLatestInterviewChat] = useState<Speaker[]>([]);
    const [latestFeedback, setLatestFeedback] = useState<FeedbackData | null>(null);
    const [selectedLabel, setSelectedLabel] = useState<string>("Latest Interview");

    if (!user) {
        navigate('/login');
    }

    const fetchInterviewData = async () =>{
        // Create a custom span for the interview data fetch
        await Sentry.startSpan({
            name: 'interview.fetchRecent',
            op: 'db.query',
            attributes: {
                'component': 'frontend-interview',
                'endpoint': '/api/interview/getRecentInterview'
            }
        }, async () => {
            try{
                const response = await api.get<RecentInterviewResponse>("/api/interview/getRecentInterview");
                setRecentInterviews(response.data.recentInterviews);
                setLatestInterviewChat(response.data.latestInterview ? JSON.parse(response.data.latestInterview.chat) : []);
                setLatestFeedback(response.data.latestInterview?.feedback ? JSON.parse(response.data.latestInterview.feedback) : null);
                setSelectedLabel("Latest Interview");
            }catch(err){
                console.log(err);
                // Capture the error in Sentry with additional context
                Sentry.captureException(err, {
                    tags: {
                        component: 'Home',
                        action: 'fetchInterviewData'
                    },
                    extra: {
                        userId: user?.email,
                        endpoint: '/api/interview/getRecentInterview'
                    }
                });
            }
        });
    }

    const onSelectInterview = async (interview: { id: number; institution: string; typeofinterview: string }) => {
        try {
            const response = await api.get<{ interview: { chat: string; feedback: string | null } | null }>(
                `/api/interview/interviewDetail/${interview.id}`
            );
            const data = response.data.interview;
            setLatestInterviewChat(data ? JSON.parse(data.chat) : []);
            setLatestFeedback(data?.feedback ? JSON.parse(data.feedback) : null);
            setSelectedLabel(`${interview.institution} — ${interview.typeofinterview}`);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        fetchInterviewData()
    }, []);

    return (
        <div className="flex justify-between items-start font-poppins">
            <div className="w-full h-full p-4 flex flex-col bg-night">
                {/* Top Section */}
                <div className="w-full text-white mb-6 text-left pl-20 flex justify-between items-center p-4">
                    <h2 className="text-2xl font-bold">Welcome Back {user?.email} 👋 </h2>
                    <div className="flex flex-row justify-start gap-4">
                        <Button className="shadow-2xl shadow-indigo-500/50" variant="outline" onClick={() => navigate("/intake")}>
                            Begin Interview
                        </Button>
                        <Button className="shadow-2xl shadow-indigo-500/50 mr-12" variant="outline" onClick={() => logout()}>
                            Log out
                        </Button>
                    </div>
                    
                </div>

                {/* Cards Section */}
                <div className="flex lg:flex-row flex-col-reverse gap-8 w-full items-center justify-between mt-4">
                    <div className="flex flex-wrap flex-row justify-evenly gap-10 w-3/4 mb-10">
                        {/* Card 1 */}
                        <div className="w-full lg:w-[45%] max-w-[400px] p-4 bg-darkGray rounded-3xl drop-shadow-2xl h-[300px] border-2">
                            <h3 className="font-bold text-white">Recent Performance</h3>
                            <p className="text-white text-sm">Scored from 1-10</p>
                            <Graph interviews={recentInterviews} />
                        </div>
                        {/* Card 2 */}
                        <div className="w-full lg:w-[45%] max-w-[400px] p-4 bg-darkGray rounded-3xl drop-shadow-2xl h-[300px] border-2">
                            <h3 className="font-bold text-white">Average Performance</h3>
                            <p className="text-white text-sm">Scale from 1-10</p>
                            <Area interviews={recentInterviews} />
                        </div>
                        {/* Latest Feedback */}
                        <div className="w-full lg:w-[95%] p-4 bg-darkGray rounded-3xl drop-shadow-2xl border-2">
                            <h3 className="font-bold text-white">{selectedLabel} Feedback</h3>
                            <FeedbackCarousel feedback={latestFeedback} />
                        </div>
                    </div>
                    <div className="w-3/4 lg:w-1/3 flex flex-col gap-10 mb-10">
                        <div className="relative z-50 p-4 bg-darkGray rounded-3xl drop-shadow-2xl border-2 overflow-visible">
                            <h3 className="font-bold text-white mb-2">Search Interviews</h3>
                            <InterviewSearch onSelect={onSelectInterview} />
                        </div>
                        <div className="relative z-10 p-4 bg-darkGray rounded-3xl drop-shadow-2xl border-2 h-fit max-h-[500px]">
                            <h3 className="font-bold text-white">Interview Chat Log</h3>
                            <ChatToView interviewer={undefined} chatLog={latestInterviewChat} />
                        </div>
                    </div>
                </div>

                
                
            </div>
        </div>


    )
}

export default Home;