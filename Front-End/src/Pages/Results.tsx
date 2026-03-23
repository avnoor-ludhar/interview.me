import { useAppSelector } from "@/redux/store";
import { interviewContent, MeetingState, dataForResults } from "@/utils/types";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "@/lib/axios";
import ReactMarkdown from "react-markdown";
import ChatToView from "@/components/ChatToView";
import { Button } from "@/components/ui/button";
import * as Sentry from "@sentry/react";

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract data passed through router state
  const interviewId: number = location.state?.interviewId;
  const state: MeetingState = location.state?.state;
  const fromMeeting: boolean | undefined = location.state?.fromMeeting;

  const user = useAppSelector((state) => state.user.user);

  // States for data and loading
  const [data, setData] = useState<dataForResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/");
    } else if (!fromMeeting) {
      navigate("/home");
    }

    // const endInterview = async () => {
    // await api.post(`/api/interview/end/${interviewId}`, {
    //     interviewId,
    //     //chatLog: state?.chatLog,
    //   intake: {
    //     firstName: state?.firstName ?? "",
    //     lastName: state?.lastName ?? "",
    //     jobType: state?.jobType ?? "",
    //     position: state?.position ?? "",
    //     companyName: state?.companyName ?? "",
    //     jobDescription: state?.jobDescription ?? "",
    //     interviewer: state?.interviewer ?? null,
    //   },
    // });
    // };

    //endInterview();

    // Function to fetch data with retry logic
    const fetchInterviewData = async () => {
      // Create a custom span for the interview feedback fetch
      await Sentry.startSpan(
        {
          name: "interview.fetchFeedback",
          op: "db.query",
          attributes: {
            component: "frontend-results",
            "interview.id": interviewId,
            endpoint: `/api/interview/feedback/${interviewId}`,
          },
        },
        async () => {
          try {
            const response = await api.get(
              `/api/interview/feedback/${interviewId}`,
            );
            const result: interviewContent | undefined = response.data;
            if (result) {
              setError(null);
              const data: dataForResults = {
                id: result.id,
                interview_id: result.interview_id,
                chat: JSON.parse(result.chat),
                feedback: result.feedback ? JSON.parse(result.feedback) : null,
              };
              setData(data); // Store data in state
              setLoading(false); // Stop loading when data is available
            } else {
              setError("Data is null");
              throw new Error("Data is null"); // Trigger retry if data is null
            }
          } catch (err: any) {
            setError(err?.message);
            console.error("Error fetching interview data:", err);
          }
        },
      );
    };

    const interval = setInterval(fetchInterviewData, 3000); // Retry every 5 seconds
    fetchInterviewData();

    return () => clearInterval(interval); // Clear interval on component unmount
  }, [user, fromMeeting, interviewId, navigate]);

  return (
    <>
      <div className="w-full text-white text-left lg:pl-40 md:pl-20 pl-10 flex justify-between items-center h-24 p-8 mb-4">
        <h2 className="text-2xl font-bold">Results Of Interview ✏️</h2>
        <Button
          className="shadow-2xl shadow-indigo-500/50 mr-12"
          variant="outline"
          onClick={() => navigate("/home")}
        >
          Back To Home
        </Button>
      </div>
      <div className="w-full flex items-center justify-center">
        <div className="shadow-lg rounded-lg p-6 w-full max-w-5xl">
          <h1 className="text-3xl font-bold mb-4">Interview Results</h1>
          <p className="text-lg mb-6">
            Position: <span className="font-semibold">{state?.position}</span>
          </p>
          {loading ? (
            <p className="text-center text-gray-300 animate-pulse">
              Loading data... May take a few minutes.
            </p>
          ) : error ? (
            <p className="text-center text-red-400">{error}</p>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-lg border border-gray-200">
                <h2 className="text-2xl font-semibold mb-2">Feedback:</h2>
                {data?.feedback ? (
                  <>
                    <div className="bg-gray-700 p-4 rounded-lg border mb-2">
                      <p className="text-xl font-bold">
                        Grade: {data.feedback.grade}/10
                      </p>
                      <ReactMarkdown>{data.feedback.summary}</ReactMarkdown>
                    </div>
                    {data.feedback.sections.map((section, index: number) => (
                      <div
                        key={index}
                        className="bg-gray-700 p-4 rounded-lg border mb-2"
                      >
                        <h3 className="text-lg font-semibold mb-2">
                          {section.title}
                        </h3>
                        <ReactMarkdown>{section.content}</ReactMarkdown>
                      </div>
                    ))}
                  </>
                ) : (
                  <p>Feedback Loading...</p>
                )}
              </div>

              <div className="flex flex-col items-center p-4 rounded-lg border border-gray-200">
                <p className="font-semibold text-2xl mb-4">Chat Log</p>
                <ChatToView interviewer={undefined} chatLog={data?.chat} />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Results;
