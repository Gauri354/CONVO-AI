"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";
import { createInterview } from "@/lib/actions/general.action";
import { extractResumeText } from "@/lib/actions/resume.action";
import { Upload, Brain, Calendar, ArrowRight, ArrowLeft } from "lucide-react";

type Step = "TYPE_SELECTION" | "RESUME_UPLOAD" | "SETUP_DETAILS" | "SCHEDULE";

const InterviewSetupFlow = ({ userId, userName }: { userId: string; userName: string }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>("TYPE_SELECTION");
  const [interviewType, setInterviewType] = useState<"AI" | "RESUME">("AI");
  const [resume, setResume] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [details, setDetails] = useState({
    role: "",
    company: "",
    level: "Junior",
    techStack: "",
  });

  useEffect(() => {
    const role = searchParams.get("role");
    const level = searchParams.get("level");
    const techstack = searchParams.get("techstack");
    const type = searchParams.get("type");
    const shortcut = searchParams.get("shortcut");

    if (shortcut === "true" && role) {
      setDetails({
        role,
        company: "",
        level: level || "Junior",
        techStack: techstack || "",
      });
      setInterviewType("AI");
      setStep("SCHEDULE");
    }
  }, [searchParams]);

  const handleNext = async () => {
    try {
      if (step === "TYPE_SELECTION") {
        if (interviewType === "RESUME") setStep("RESUME_UPLOAD");
        else setStep("SETUP_DETAILS");
      } else if (step === "RESUME_UPLOAD") {
        if (!resume) {
          toast.error("Please upload a resume first");
          return;
        }

        const loadingToast = toast.loading("Analyzing resume...");
        const formData = new FormData();
        formData.append("file", resume);

        const result = await extractResumeText(formData);
        toast.dismiss(loadingToast);

        if (result.success && result.text) {
          setResumeText(result.text);
          setStep("SCHEDULE");
        } else {
          toast.error(result.message || "Failed to analyze resume. Please try again.");
        }
      } else if (step === "SETUP_DETAILS") {
        if (!details.role || !details.techStack) {
          toast.error("Please fill in all required fields");
          return;
        }
        setStep("SCHEDULE");
      }
    } catch (error) {
      console.error("[SetupFlow] Error in handleNext:", error);
      toast.error("An unexpected error occurred during resume analysis.");
    }
  };

  const handleBack = () => {
    if (step === "RESUME_UPLOAD") setStep("TYPE_SELECTION");
    else if (step === "SETUP_DETAILS") setStep("TYPE_SELECTION");
    else if (step === "SCHEDULE") {
      if (interviewType === "RESUME") setStep("RESUME_UPLOAD");
      else setStep("SETUP_DETAILS");
    }
  };

  const handleFinish = async (scheduleType: "NOW" | "LATER") => {
    const loadingToast = toast.loading(scheduleType === "NOW" ? "Preparing interview..." : "Scheduling interview...");

    try {
      console.log("[SetupFlow] Creating interview...", { interviewType, scheduleType });
      const result = await createInterview({
        role: details.role || (interviewType === "RESUME" ? "Resume-Based Interview" : ""),
        level: details.level,
        techstack: details.techStack || (interviewType === "RESUME" ? "General" : ""),
        type: interviewType === "AI" ? "Technical" : "Mixed",
        userId,
        status: scheduleType === "NOW" ? "in-progress" : "scheduled",
        questions: [],
        resumeText: resumeText || "",
      });

      toast.dismiss(loadingToast);

      if (result.success) {
        toast.success(scheduleType === "NOW" ? "Starting interview..." : "Interview scheduled!");
        if (scheduleType === "NOW") {
          console.log("[SetupFlow] Redirecting to interview:", result.id);
          router.push(`/interview/${result.id}`);
        } else {
          router.push("/");
        }
      } else {
        console.error("[SetupFlow] createInterview failed:", result.message);
        toast.error(result.message || "Failed to create interview. Please try again.");
      }
    } catch (error) {
      console.error("[SetupFlow] Error in handleFinish:", error);
      toast.dismiss(loadingToast);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-8 card-border">
      <div className="card p-8 flex flex-col gap-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Setup Your Interview</h2>
          <span className="text-sm text-light-400">Step {step === "TYPE_SELECTION" ? 1 : (step === "RESUME_UPLOAD" || step === "SETUP_DETAILS") ? 2 : 3} of 3</span>
        </div>

        {step === "TYPE_SELECTION" && (
          <div className="flex flex-col gap-6">
            <h3>Select Interview Type</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => setInterviewType("AI")}
                className={`p-6 rounded-xl border-2 transition-all flex flex-col items-center gap-4 ${interviewType === "AI" ? "border-primary-200 bg-primary-200/10" : "border-dark-200 hover:border-light-600"
                  }`}
              >
                <Brain size={48} className="text-primary-200" />
                <div className="text-center">
                  <p className="font-bold">AI-Generated</p>
                  <p className="text-xs text-light-400">Based on role & tech stack</p>
                </div>
              </button>
              <button
                onClick={() => setInterviewType("RESUME")}
                className={`p-6 rounded-xl border-2 transition-all flex flex-col items-center gap-4 ${interviewType === "RESUME" ? "border-primary-200 bg-primary-200/10" : "border-dark-200 hover:border-light-600"
                  }`}
              >
                <Upload size={48} className="text-primary-200" />
                <div className="text-center">
                  <p className="font-bold">Resume-Based</p>
                  <p className="text-xs text-light-400">Tailored to your experience</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {step === "RESUME_UPLOAD" && (
          <div className="flex flex-col gap-6">
            <h3>Upload Your Resume</h3>
            <div className="btn-upload flex flex-col items-center justify-center gap-4 border-dashed border-2 border-light-600 p-12">
              <Upload size={48} className="text-light-400" />
              <input
                type="file"
                className="hidden"
                id="resume-upload"
                onChange={(e) => setResume(e.target.files?.[0] || null)}
              />
              <label htmlFor="resume-upload" className="cursor-pointer text-primary-200 font-bold hover:underline">
                {resume ? resume.name : "Click to upload PDF or Doc"}
              </label>
            </div>
          </div>
        )}

        {step === "SETUP_DETAILS" && (
          <div className="flex flex-col gap-6">
            <h3>Interview Details</h3>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label>Job Role</Label>
                <Input
                  placeholder="e.g. Frontend Developer"
                  value={details.role}
                  onChange={(e) => setDetails({ ...details, role: e.target.value })}
                  className="input"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Company (Optional)</Label>
                <Input
                  placeholder="e.g. Google, Startup X"
                  value={details.company}
                  onChange={(e) => setDetails({ ...details, company: e.target.value })}
                  className="input"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Tech Stack</Label>
                <Input
                  placeholder="e.g. React, Node.js, AWS"
                  value={details.techStack}
                  onChange={(e) => setDetails({ ...details, techStack: e.target.value })}
                  className="input"
                />
              </div>
            </div>
          </div>
        )}

        {step === "SCHEDULE" && (
          <div className="flex flex-col gap-6">
            <h3>Final Step: Schedule</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button onClick={() => handleFinish("NOW")} className="btn-primary flex gap-2 items-center justify-center py-8">
                <Brain size={20} />
                <span>Start Now</span>
              </Button>
              <Button onClick={() => handleFinish("LATER")} className="btn-secondary flex gap-2 items-center justify-center py-8">
                <Calendar size={20} />
                <span>Schedule Later</span>
              </Button>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-4">
          {step !== "TYPE_SELECTION" ? (
            <Button onClick={handleBack} variant="ghost" className="flex gap-2 items-center text-light-400">
              <ArrowLeft size={16} />
              <span>Back</span>
            </Button>
          ) : <div></div>}

          {step !== "SCHEDULE" && (
            <Button onClick={handleNext} className="btn-primary flex gap-2 items-center">
              <span>Next</span>
              <ArrowRight size={16} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewSetupFlow;
