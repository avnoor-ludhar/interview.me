import { useAppSelector } from "@/redux/store";
import { MeetingState } from "@/utils/types";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "@/lib/axios";
import ReactMarkdown from 'react-markdown';

const Results = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Extract data passed through router state
    const interviewId: number = location.state?.interviewId;
    const state: MeetingState = location.state?.state;
    const fromMeeting: boolean | undefined = location.state?.fromMeeting;

    const user = useAppSelector(state => state.user.user);

    // States for data and loading
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) {
            navigate('/');
        } else if (!fromMeeting) {
            navigate("/home");
        }

        // Function to fetch data with retry logic
        const fetchInterviewData = async () => {
            try {
                const response = await api.get(`/api/interview/feedback/${interviewId}`);
                const result = response.data;
                if (result) {
                    setData(result); // Store data in state
                    setLoading(false); // Stop loading when data is available
                } else {
                    throw new Error("Data is null"); // Trigger retry if data is null
                }
            } catch (err) {
                console.error("Error fetching interview data:", err);
                setTimeout(fetchInterviewData, 5000); // Retry after 5 seconds
            }
        };

        const interval = setInterval(fetchInterviewData, 5000); // Retry every 5 seconds
        fetchInterviewData(); // Initial fetch

        return () => clearInterval(interval); // Clear interval on component unmount
    }, [user, fromMeeting, interviewId, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center p-4 text-white">
            <div className="bg-gray-900 shadow-lg rounded-lg p-6 w-full max-w-5xl">
                <h1 className="text-2xl font-bold mb-4">Interview Results</h1>
                <p className="text-lg mb-6">Position: <span className="font-semibold">{state?.position}</span></p>

                {loading ? (    
                    <p className="text-center text-gray-300 animate-pulse">Loading data... Please wait.</p>
                ) : error ? (
                    <p className="text-center text-red-400">{error}</p>
                ) : (
                    <div className="space-y-4">
                        <div className="bg-gray-800 p-4 rounded-lg border border-gray-200">
                            <h2 className="text-xl font-semibold mb-2">Feedback:</h2>
                            {data?.feedback?.split('\n\n').map((block: string, index: number) => (
                                <div key={index} className="bg-gray-700 p-4 rounded-lg border mb-2">
                                    <ReactMarkdown>{block}</ReactMarkdown>
                                </div>
                            )) || <p>Feedback Loading...</p>}
                        </div>

                        <div className="bg-gray-800 p-4 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-semibold mb-2">Chat Log:</h3>
                            <pre className="text-sm p-4 rounded-lg border overflow-x-auto">
                                {JSON.stringify(data?.chat, null, 2)}
                            </pre>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Results;
