import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import api from "@/lib/axios";
import debounce from "lodash/debounce";

type SearchResult = {
    id: number;
    institution: string;
    typeofinterview: string;
    score: number;
    interview_date: string;
};

type InterviewSearchProps = {
    onSelect: (interview: SearchResult) => void;
};

const InterviewSearch = ({ onSelect }: InterviewSearchProps) => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);

    const fetchInterviews = async (searchQuery: string) => {
        try {
            const response = await api.get<{ results: SearchResult[] }>(
                `/api/interview/searchInterviews?q=${encodeURIComponent(searchQuery)}`
            );
            setResults(response.data.results);
        } catch (err) {
            console.log(err);
            setResults([]);
        }
    };

    const debouncedFetchInterviews = useCallback(
        debounce((searchQuery: string) => {
            fetchInterviews(searchQuery);
        }, 300),
        []
    );

    useEffect(() => {
        if (query) {
            debouncedFetchInterviews(query);
        } else {
            setResults([]);
        }
        return () => {
            debouncedFetchInterviews.cancel();
        };
    }, [query, debouncedFetchInterviews]);

    const handleSelect = (interview: SearchResult) => {
        setQuery(interview.institution);
        setResults([]);
        onSelect(interview);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    return (
        <div className="relative w-full">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                    placeholder="Search by company name..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-9 bg-[#0b1220] border-gray-600 text-white placeholder:text-gray-400 focus-visible:ring-indigo-500"
                />
            </div>

            {results.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-[#0b1220] border border-gray-600 rounded-xl shadow-2xl overflow-hidden max-h-[240px] overflow-y-auto">
                    {results.map((interview) => (
                        <div
                            key={interview.id}
                            onClick={() => handleSelect(interview)}
                            className="w-full px-4 py-3 text-left bg-[#0b1220] hover:bg-indigo-600/30 transition-colors border-b border-gray-700/50 last:border-b-0 cursor-pointer"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-white text-sm font-medium">{interview.institution}</p>
                                    <p className="text-gray-400 text-xs">{interview.typeofinterview} &middot; {formatDate(interview.interview_date)}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="text-indigo-300 text-sm font-semibold">{interview.score}</span>
                                    <span className="text-gray-500 text-xs">/10</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default InterviewSearch;
