"use client";

import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { ArrowRight, Code, Send } from "lucide-react";
import { generateCodingQuestions, saveCodingAnswer, completeCodingRound } from "@/lib/actions/general.action";
import { useRouter } from "next/navigation";

interface CodingRoundProps {
  interviewId: string;
  userId: string;
  initialQuestions?: string[];
}

const CodingRound = ({ interviewId, userId, initialQuestions }: CodingRoundProps) => {
  const router = useRouter();
  const [questions, setQuestions] = useState<string[]>(initialQuestions || []);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(!initialQuestions);
  const [submitting, setSubmitting] = useState(false);
  
  // IDE State
  const [language, setLanguage] = useState("javascript");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!initialQuestions || initialQuestions.length === 0) {
      handleGenerateQuestions();
    }
  }, []);

  const handleGenerateQuestions = async () => {
    setLoading(true);
    const result = await generateCodingQuestions(interviewId);
    if (result.success && result.questions) {
      setQuestions(result.questions);
    } else {
      toast.error("Failed to generate coding questions. Please try again.");
    }
    setLoading(false);
  };

  const currentCode = answers[currentStep] || "";

  const handleEditorChange = (value: string | undefined) => {
    setAnswers((prev) => ({ ...prev, [currentStep]: value || "" }));
  };

  const handleRunCode = async () => {
    if (!currentCode.trim()) {
      toast.error("Code is empty!");
      return;
    }

    setIsRunning(true);
    setOutput("Running code...");
    
    try {
      const response = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        body: JSON.stringify({
          language,
          version: "*",
          files: [{ content: currentCode }],
        }),
      });

      const data = await response.json();
      
      if (data.run) {
        setOutput(data.run.stdout || data.run.stderr || "No output returned.");
      } else {
        setOutput("Execution failed.");
      }
    } catch (error) {
      setOutput("Error: Could not connect to execution engine.");
    } finally {
      setIsRunning(false);
    }
  };

  const handleNext = async () => {
    if (!currentCode.trim()) {
      toast.error("Please provide some code before moving to the next question.");
      return;
    }

    const saveToast = toast.loading("Saving answer...");
    await saveCodingAnswer(interviewId, currentStep + 1, currentCode);
    toast.dismiss(saveToast);

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
      setOutput(""); // Clear output for next question
    }
  };

  const handleSubmit = async () => {
    if (!currentCode.trim()) {
      toast.error("Please provide some code for the final question.");
      return;
    }

    setSubmitting(true);
    const loadingToast = toast.loading("Finalizing coding round...");

    try {
      await saveCodingAnswer(interviewId, currentStep + 1, currentCode);
      await completeCodingRound(interviewId);
      
      toast.dismiss(loadingToast);
      toast.success("Coding round submitted successfully!");
      
      router.push(`/interview/${interviewId}/feedback`);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to submit coding round. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="size-12 rounded-full border-4 border-primary-500 border-t-transparent animate-spin" />
        <p className="text-light-400 font-medium">AI is generating your coding challenges...</p>
      </div>
    );
  }

  const isLastStep = currentStep === questions.length - 1;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 w-full">
      {/* Header */}
      <div className="flex justify-between items-center bg-dark-200 p-4 rounded-2xl border border-light-800/10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-500/10 rounded-lg">
            <Code className="text-primary-500 size-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Question {currentStep + 1}</h2>
            <p className="text-xs text-light-400">Coding Intelligence Test</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-dark-300 text-xs border border-light-800/20 rounded-md px-3 py-1.5 focus:outline-none focus:border-primary-500"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="csharp">C#</option>
            <option value="cpp">C++</option>
            <option value="c">C</option>
            <option value="typescript">TypeScript</option>
            <option value="ruby">Ruby</option>
            <option value="go">Go</option>
          </select>
          <div className="flex gap-1">
            {questions.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-1 w-4 rounded-full transition-all ${idx <= currentStep ? "bg-primary-500" : "bg-dark-300"}`} 
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 w-full">
        {/* Question Side */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="card-border bg-dark-200/50 p-6 h-fit shrink-0">
            <h3 className="text-xs font-bold text-primary-200 mb-3 uppercase tracking-widest">Problem Statement</h3>
            <p className="text-light-100 leading-relaxed text-sm">
              {questions[currentStep]}
            </p>
          </div>

          <div className="card-border flex-1 bg-dark-400 p-6 min-h-[300px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-light-400 uppercase tracking-widest">Output Console</h3>
              <Button 
                onClick={() => setOutput("")}
                variant="ghost" 
                className="h-6 text-[10px] text-light-500 hover:text-light-100"
              >
                Clear
              </Button>
            </div>
            <div className="font-mono text-xs text-success-100/90 whitespace-pre-wrap">
              {output || "Output will appear here after running your code..."}
            </div>
          </div>
        </div>

        {/* Editor Side */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="card-border overflow-hidden border-primary-500/20 shadow-2xl shadow-primary-500/5">
            <div className="bg-dark-300 px-4 py-2 border-b border-light-800/10 flex justify-between items-center">
              <div className="flex gap-1.5">
                <div className="size-2.5 rounded-full bg-red-500/20" />
                <div className="size-2.5 rounded-full bg-yellow-500/20" />
                <div className="size-2.5 rounded-full bg-green-500/20" />
              </div>
              <p className="text-[10px] text-light-500 font-mono">IDE: {language.toUpperCase()}</p>
            </div>
            
            <div className="h-[750px]">
              <Editor
                height="100%"
                language={language === 'c++' ? 'cpp' : language}
                theme="vs-dark"
                value={currentCode}
                onChange={handleEditorChange}
                options={{
                  fontSize: 15,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  padding: { top: 20, bottom: 20 },
                  fontFamily: "'Fira Code', 'Courier New', monospace",
                  fontLigatures: true,
                  lineNumbers: "on",
                  roundedSelection: true,
                }}
              />
            </div>
          </div>

          <div className="flex justify-between items-center bg-dark-200/50 p-4 rounded-2xl border border-light-800/10">
            <Button 
              onClick={handleRunCode}
              disabled={isRunning}
              variant="outline"
              className="border-primary-500/30 text-primary-200 hover:bg-primary-500/10 gap-2 min-w-[140px]"
            >
              {isRunning ? "Running..." : "Run Code"}
              <div className="size-2 rounded-full bg-success-100 animate-pulse" />
            </Button>

            <div className="flex gap-3">
              {isLastStep ? (
                <Button 
                  onClick={handleSubmit} 
                  disabled={submitting}
                  className="btn-primary min-w-[180px] flex gap-2 items-center"
                >
                  {submitting ? "Submitting..." : (
                    <>
                      <span>Complete Interview</span>
                      <Send size={16} />
                    </>
                  )}
                </Button>
              ) : (
                <Button 
                  onClick={handleNext} 
                  className="btn-primary min-w-[180px] flex gap-2 items-center"
                >
                  <span>Next Question</span>
                  <ArrowRight size={16} />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>

  );
};


export default CodingRound;
