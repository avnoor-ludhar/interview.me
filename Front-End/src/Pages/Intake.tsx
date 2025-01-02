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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Intake(): JSX.Element {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [jobType, setJobType] = useState("");
  const [position, setPosition] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = () => {
    // Error handling for empty fields
    if (!firstName || !lastName || !jobType || !position || !jobDescription) {
      setError("Please fill out all fields before submitting.");
      return;
    }

    // Error handling for Job Description character limit
    if (jobDescription.length > 300) {
      setError("Job description must not exceed 300 characters.");
      return;
    }

    // Reset error and proceed
    setError(null);
    console.log({ firstName, lastName, jobType, position, jobDescription });
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
          <CardHeader>
            <CardTitle>Job Information Form</CardTitle>
            <CardDescription>
              Please provide your details below to help us specialize your interview
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
                <Select onValueChange={setJobType}>
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
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  maxLength={100}
                  placeholder="e.g., Software Engineer"
                />
              </div>

              {/* Job Description */}
              <div className="flex flex-col gap-1">
                <Label htmlFor="job-description">Job Description</Label>
                <Textarea
                  id="job-description"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  maxLength={300}
                  placeholder="Briefly describe the job (max 300 characters)."
                  className="resize-none"
                />
                <p className="text-right text-sm text-gray-500">
                  {jobDescription.length}/300
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleSubmit}>
              Submit Application
            </Button>
          </CardFooter>
        </Card>
        {error && <AlertDestructive error={error} />}
      </div>
    </>
  );
}

export default Intake;
