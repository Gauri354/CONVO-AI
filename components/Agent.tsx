"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Editor from "@monaco-editor/react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import { interviewer, RESUME_INTERVIEWER_PROMPT, GENERAL_INTERVIEWER_PROMPT } from "@/constants";
import { createFeedback, startInterview, updateInterviewProgress } from "@/lib/actions/general.action";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

const Agent = ({
  userName,
  userId,
  interviewId,
  feedbackId,
  type,
  questions,
  gender,
  currentQuestionIndex: currentQuestionIndexProp,
  resumeText,
  role,
  level,
  techstack,
}: AgentProps) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState<string>("");
  const [isCodingMode, setIsCodingMode] = useState(false);
  const [code, setCode] = useState("// Write your code here...");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(currentQuestionIndexProp || 0);

  useEffect(() => {
    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
    };

    const onCallEnd = () => {
      setCallStatus(CallStatus.FINISHED);
    };

    const onMessage = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    const onSpeechStart = () => {
      console.log("speech start");
      setIsSpeaking(true);
    };

    const onSpeechEnd = () => {
      console.log("speech end");
      setIsSpeaking(false);
    };

    const onError = (error: Error) => {
      console.log("Error:", error);
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }

    const handleGenerateFeedback = async (messages: SavedMessage[]) => {
      console.log("handleGenerateFeedback");

      const { success, feedbackId: id } = await createFeedback({
        interviewId: interviewId!,
        userId: userId!,
        transcript: messages,
        feedbackId,
        code: isCodingMode ? code : undefined,
      });

      if (success && id) {
        router.push(`/interview/${interviewId}/feedback`);
      } else {
        console.log("Error saving feedback");
        router.push("/");
      }
    };

    if (callStatus === CallStatus.FINISHED) {
      if (type === "generate") {
        router.push("/");
      } else {
        handleGenerateFeedback(messages);
      }
    }
  }, [messages, callStatus, feedbackId, interviewId, router, type, userId]);

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);

    if (type === "generate") {
      await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
        variableValues: {
          username: userName,
          userid: userId,
        },
      });
    } else {
      if (interviewId) {
        await startInterview(interviewId);
      }

      let formattedQuestions = "";
      if (questions) {
        const remainingQuestions = questions.slice(currentQuestionIndex);
        formattedQuestions = remainingQuestions
          .map((question) => `- ${question}`)
          .join("\n");
      }

      if (resumeText) {
        const resumeInterviewer = {
          ...interviewer,
          model: {
            ...interviewer.model,
            messages: [
              {
                role: "system",
                content: RESUME_INTERVIEWER_PROMPT,
              },
            ],
          },
        } as any;

        await vapi.start(resumeInterviewer, {
          variableValues: {
            resumeText: resumeText,
          },
        });
      } else if (formattedQuestions) {
        await vapi.start(interviewer, {
          variableValues: {
            questions: formattedQuestions,
          },
        });
      } else {
        const generalInterviewer = {
          ...interviewer,
          model: {
            ...interviewer.model,
            messages: [
              {
                role: "system",
                content: GENERAL_INTERVIEWER_PROMPT,
              },
            ],
          },
        } as any;

        await vapi.start(generalInterviewer, {
          variableValues: {
            role: role || "Software Engineer",
            level: level || "Mid",
            techstack: techstack ? techstack.join(", ") : "General",
          },
        });
      }
    }
  };

  const handleDisconnect = () => {
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  };

  return (
    <>
      <div className="call-view">
        {/* AI Interviewer Card */}
        <div className="card-interviewer">
          <div className="avatar">
            <Image
              src="/ai-avatar.png"
              alt="profile-image"
              width={65}
              height={54}
              className="object-cover"
            />
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>AI Interviewer</h3>
        </div>

        {/* User Profile Card / Camera View */}
        <div className="card-border">
          <div className="card-content relative overflow-hidden h-[400px]">
            <Image
              src={gender === "female" ? "/female-avatar.png" : "/user-avatar.png"}
              alt="profile-image"
              width={539}
              height={539}
              className="rounded-full object-cover size-[120px]"
            />
            <h3 className="mt-4">{userName}</h3>
          </div>
        </div>
      </div>

      {callStatus === CallStatus.ACTIVE && questions && questions.length > 0 && (
        <div className="mt-8 flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium text-light-400">Interview Progress</p>
            <p className="text-sm font-bold text-primary-200">
              Question {Math.min(currentQuestionIndex + 1, questions.length)} of {questions.length}
            </p>
          </div>
          <div className="w-full h-2 bg-dark-200 rounded-full overflow-hidden border border-light-800">
            <div
              className="h-full bg-primary-200 transition-all duration-500"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {callStatus === CallStatus.ACTIVE && (
        <div className="flex flex-col gap-4 mt-8">
          <div className="flex justify-between items-center">
            <h3>{isCodingMode ? "Coding Mode" : "Voice Mode"}</h3>
            <button
              onClick={() => setIsCodingMode(!isCodingMode)}
              className="btn-secondary text-xs py-1 h-8"
            >
              Switch to {isCodingMode ? "Voice" : "Coding"}
            </button>
          </div>

          {questions && questions.length > 0 && currentQuestionIndex < questions.length - 1 && (
            <button
              onClick={async () => {
                const newIndex = currentQuestionIndex + 1;
                setCurrentQuestionIndex(newIndex);
                if (interviewId) {
                  await updateInterviewProgress(interviewId, newIndex);
                }
              }}
              className="btn-primary w-full py-3"
            >
              Next Question
            </button>
          )}

          {isCodingMode && (
            <div className="h-[400px] rounded-2xl overflow-hidden border border-light-800">
              <Editor
                height="100%"
                defaultLanguage="javascript"
                theme="vs-dark"
                value={code}
                onChange={(value) => setCode(value || "")}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                }}
              />
            </div>
          )}
        </div>
      )}

      {messages.length > 0 && (
        <div className="transcript-border">
          <div className="transcript">
            <p
              key={lastMessage}
              className={cn(
                "transition-opacity duration-500 opacity-0",
                "animate-fadeIn opacity-100"
              )}
            >
              {lastMessage}
            </p>
          </div>
        </div>
      )}

      <div className="w-full flex justify-center">
        {callStatus !== CallStatus.ACTIVE ? (
          <button className="relative btn-call" onClick={() => handleCall()}>
            <span
              className={cn(
                "absolute animate-ping rounded-full opacity-75",
                callStatus !== CallStatus.CONNECTING && "hidden"
              )}
            />

            <span className="relative">
              {callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED
                ? "Start Interview"
                : ". . ."}
            </span>
          </button>
        ) : (
          <button className="btn-disconnect" onClick={() => handleDisconnect()}>
            End
          </button>
        )}
      </div>
    </>
  );
};

export default Agent;
