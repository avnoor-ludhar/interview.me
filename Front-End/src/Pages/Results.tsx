import { useAppSelector } from "@/redux/store";
import { interviewContent, MeetingState, dataForResults } from "@/utils/types";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "@/lib/axios";
import ReactMarkdown from "react-markdown";
import ChatToView from "@/components/ChatToView";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import * as Sentry from "@sentry/react";

const gradeColor = (grade: number) => {
  if (grade >= 8) return { ring: "border-emerald-400", text: "text-emerald-400", bg: "bg-emerald-400/10" };
  if (grade >= 5) return { ring: "border-amber-400", text: "text-amber-400", bg: "bg-amber-400/10" };
  return { ring: "border-red-400", text: "text-red-400", bg: "bg-red-400/10" };
};

const starKeys = ["situation", "task", "action", "result"] as const;

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
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/");
    } else if (!fromMeeting) {
      navigate("/home");
    }

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

  const grade = data?.feedback?.grade ?? 0;
  const colors = gradeColor(grade);

  return (
    <div className="min-h-screen w-full pb-16">
      {/* Header */}
      <div className="w-full text-white lg:px-40 md:px-20 px-10 flex justify-between items-center h-20 mb-2">
        <Button
          variant="ghost"
          className="gap-2 text-gray-300 hover:text-white"
          onClick={() => navigate("/home")}
        >
          <ArrowLeft className="w-4 h-4" />
          Back To Home
        </Button>
      </div>

      <div className="w-full flex flex-col items-center px-4">
        <div className="w-full max-w-4xl space-y-8">
          {/* Title Area */}
          <div className="text-center space-y-1">
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Interview Results
            </h1>
            {state?.position && (
              <p className="text-gray-400 text-base">
                {state.companyName && <span>{state.companyName} &middot; </span>}
                {state.position}
              </p>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
              <p className="text-gray-400 text-sm animate-pulse">
                Generating your feedback — this may take a few minutes...
              </p>
            </div>
          ) : error ? (
            <Card className="border-red-500/30 bg-red-500/5">
              <CardContent className="py-8 text-center">
                <p className="text-red-400">{error}</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Grade + Summary Hero */}
              {data?.feedback ? (
                <Card className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-gray-700/60 overflow-hidden">
                  <CardContent className="p-8">
                    <div className="flex flex-col sm:flex-row items-center gap-8">
                      {/* Grade Ring */}
                      <div className="flex-shrink-0">
                        <div
                          className={`w-28 h-28 rounded-full border-4 ${colors.ring} ${colors.bg} flex items-center justify-center`}
                        >
                          <div className="text-center">
                            <span className={`text-4xl font-bold ${colors.text}`}>
                              {grade}
                            </span>
                            <span className="text-gray-400 text-sm block -mt-1">/10</span>
                          </div>
                        </div>
                      </div>

                      {/* Summary */}
                      <div className="flex-1 text-center sm:text-left">
                        <h2 className="text-xs uppercase tracking-widest text-indigo-300 font-semibold mb-2">
                          Overall Summary
                        </h2>
                        <div className="text-gray-200 text-sm leading-relaxed prose prose-invert prose-sm max-w-none">
                          <ReactMarkdown>{data.feedback.summary}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-gray-700/60 bg-gray-800/40">
                  <CardContent className="py-8 text-center">
                    <Loader2 className="w-6 h-6 text-indigo-400 animate-spin mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">Feedback loading...</p>
                  </CardContent>
                </Card>
              )}

              {/* STAR Evaluation */}
              {data?.feedback?.star && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-white tracking-tight px-1">
                    STAR Evaluation
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    {starKeys.map((key) => {
                      const category = data.feedback!.star[key];
                      const catColors = gradeColor(category.score);
                      return (
                        <Card
                          key={key}
                          className="bg-gray-800/50 border-gray-700/50 hover:border-indigo-500/30 transition-colors"
                        >
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base font-semibold text-indigo-200 flex items-center justify-between">
                              <span className="capitalize">{key}</span>
                              <span className={`text-sm font-bold ${catColors.text}`}>
                                {category.score}/10
                              </span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {category.issues.length > 0 && (
                              <div>
                                <p className="text-xs uppercase tracking-wider text-red-400 font-semibold mb-1">Issues</p>
                                <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                                  {category.issues.map((issue, i) => (
                                    <li key={i}>{issue}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {category.improvements.length > 0 && (
                              <div>
                                <p className="text-xs uppercase tracking-wider text-emerald-400 font-semibold mb-1">Improvements</p>
                                <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                                  {category.improvements.map((tip, i) => (
                                    <li key={i}>{tip}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Mock Answer */}
              {data?.feedback?.mockAnswer && (
                <div className="space-y-3">
                  <h2 className="text-lg font-semibold text-white tracking-tight px-1">
                    Mock Answer
                  </h2>
                  <Card className="bg-gray-800/50 border-gray-700/50">
                    <CardContent className="p-6">
                      <div className="text-gray-200 text-sm leading-relaxed prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown>{data.feedback.mockAnswer}</ReactMarkdown>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Suggestions */}
              {data?.feedback?.suggestions && data.feedback.suggestions.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-lg font-semibold text-white tracking-tight px-1">
                    Suggestions
                  </h2>
                  <Card className="bg-gray-800/50 border-gray-700/50">
                    <CardContent className="p-6">
                      <ul className="space-y-2">
                        {data.feedback.suggestions.map((suggestion, i) => (
                          <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                            <span className="text-indigo-400 mt-0.5">&#8226;</span>
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Chat Log — Collapsible */}
              <div className="space-y-3">
                <button
                  onClick={() => setChatOpen(!chatOpen)}
                  className="w-full flex items-center justify-between px-1 group"
                >
                  <h2 className="text-lg font-semibold text-white tracking-tight">
                    Chat Log
                  </h2>
                  <span className="text-gray-400 group-hover:text-white transition-colors">
                    {chatOpen ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </span>
                </button>
                {chatOpen && (
                  <Card className="bg-gray-800/50 border-gray-700/50">
                    <CardContent className="p-6">
                      <ChatToView interviewer={undefined} chatLog={data?.chat} />
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Results;
