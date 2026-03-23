import { Button } from "@/components/ui/button";
import { AlertDestructive } from "@/components/ui/AlertDestructive";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { models } from "@/assets/models";
import { InterviewerType } from "@/utils/types";

function Intake(): JSX.Element {
  const [page, setPage] = useState(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [jobType, setJobType] = useState("");
  const [position, setPosition] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [interviewer, setInterviewer] = useState<InterviewerType | null>(null); // Store both model and name
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const validatePage1 = () => {
    if (!firstName || !lastName || !jobType || !position) {
      setError("Please fill out all fields on this page.");
      return false;
    }
    setError(null);
    return true;
  };

  const validatePage2 = () => {
    if (!interviewer || !companyName || !jobDescription) {
      setError("Please fill out all fields on this page.");
      return false;
    }
    setError(null);
    return true;
  };

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!validatePage2() || submitting) return;

    try {
      setSubmitting(true);
      navigate("/meeting", {
        state: {
          firstName,
          lastName,
          jobType,
          position,
          companyName,
          jobDescription,
          interviewer, // Contains both model and name
          fromIntake: true,
        },
      });
    } catch (error) {
      console.error("Error starting interview:", error);
      setError("Could not continue to the interview. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleValueChange = (value: string) => {
    const selectedModel = models.find((model) => model.model === value);
    if (selectedModel) {
      setInterviewer(selectedModel);
    }
  };

  return (
    <>
      <div className="w-full text-white text-left pl-40 flex justify-between items-center h-24 p-8">
        <h2 className="text-2xl font-bold">Specialize Your Interview 💫</h2>
        <Button
          className="shadow-2xl shadow-indigo-500/50 mr-12"
          variant="outline"
          onClick={() => navigate("/home")}
        >
          Back To Home
        </Button>
      </div>
      <div className="flex flex-col items-center justify-start w-full">
        <Card className="lg:w-[600px] p-6 pb-0">
          {/* Progress Indicator */}
          <div className="flex space-x-3 mb-4 w-full items-center justify-center">
            <div
              className={`h-3 w-3 rounded-full ${page === 1 ? "bg-indigo-500/50" : "bg-gray-300"}`}
            ></div>
            <div
              className={`h-3 w-3 rounded-full ${page === 2 ? "bg-indigo-500/50" : "bg-gray-300"}`}
            ></div>
          </div>
          {page === 1 && (
            <>
              <CardHeader>
                <CardTitle>Job Information Form</CardTitle>
                <CardDescription>
                  Please provide your details below to help us specialize your
                  interview
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {/* First Name and Last Name */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="first-name">First Name</Label>
                      <Input
                        id="first-name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        maxLength={50}
                        placeholder="John"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="last-name">Last Name</Label>
                      <Input
                        id="last-name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        maxLength={50}
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                  {/* Job Type */}
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="job-type">Job Type</Label>
                    <Select value={jobType} onValueChange={setJobType}>
                      <SelectTrigger id="job-type">
                        <SelectValue placeholder="Select a job type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">Full-Time</SelectItem>
                        <SelectItem value="part-time">Part-Time</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Position */}
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="position">Job Position</Label>
                    <Input
                      id="position"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      maxLength={100}
                      placeholder="e.g., Software Engineer"
                    />
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {page === 2 && (
            <>
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
                <CardDescription>
                  Provide the company name and describe the job position
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {/* Company Name */}
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input
                      id="company-name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      maxLength={100}
                      placeholder="e.g., Google"
                    />
                  </div>
                  {/* Job Description */}
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="job-description">Job Description</Label>
                    <Textarea
                      id="job-description"
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      maxLength={600}
                      placeholder="Briefly describe the job (max 600 characters)."
                      className="resize-none"
                    />
                    <p className="text-right text-sm text-gray-500">
                      {jobDescription.length}/600
                    </p>
                  </div>
                  {/* Interviewer Selection */}
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="interviewer">Interviewer Name</Label>
                    <Select
                      value={interviewer?.model || ""}
                      onValueChange={(value) => handleValueChange(value)}
                    >
                      <SelectTrigger id="interviewer">
                        <SelectValue placeholder="Select an interviewer" />
                      </SelectTrigger>
                      <SelectContent>
                        {models.map((model) => (
                          <SelectItem key={model.model} value={model.model}>
                            {model.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </>
          )}

          <CardFooter className="flex justify-between">
            {page > 1 && (
              <Button variant="outline" onClick={() => setPage(page - 1)}>
                Back
              </Button>
            )}
            {page < 2 ? (
              <Button
                variant="outline"
                onClick={() => {
                  if (validatePage1()) setPage(page + 1);
                }}
              >
                Next
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit Information"}
              </Button>
            )}
          </CardFooter>
        </Card>
        {error && <AlertDestructive error={error} />}
      </div>
    </>
  );
}

export default Intake;
