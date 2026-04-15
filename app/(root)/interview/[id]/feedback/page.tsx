import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

import {
  getFeedbackByInterviewId,
  getInterviewById,
} from "@/lib/actions/general.action";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { cn } from "@/lib/utils";
import PrintButton from "@/components/PrintButton";

const Feedback = async ({ params }: RouteParams) => {
  const { id } = await params;
  const user = await getCurrentUser();

  const interview = await getInterviewById(id);
  if (!interview) redirect("/");

  const feedback = await getFeedbackByInterviewId({
    interviewId: id,
    userId: user?.id!,
  });

  return (
    <section className="section-feedback max-w-4xl mx-auto p-8 bg-dark-300 rounded-3xl shadow-2xl border border-light-800 my-10 print:shadow-none print:border-none print:bg-white print:text-black">
      {/* Report Header */}
      <div className="flex flex-col gap-4 border-b border-light-800 pb-8 print:border-black">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-primary-100 print:text-black">Interview Performance Report</h1>
            <p className="text-xl text-light-400 mt-2 capitalize">{interview.role} Interview</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-light-400">Date: {feedback?.createdAt ? dayjs(feedback.createdAt).format("MMM D, YYYY") : "N/A"}</p>
            <p className="text-sm text-light-400">Candidate: {user?.name}</p>
          </div>
        </div>
      </div>

      {/* Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
        <div className="md:col-span-1 flex flex-col items-center justify-center p-8 bg-dark-200 rounded-2xl border border-primary-200/20 print:bg-gray-100">
          <p className="text-sm font-bold uppercase tracking-wider text-light-400">Overall Score</p>
          <div className="relative flex items-center justify-center mt-4">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="58"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-dark-300"
              />
              <circle
                cx="64"
                cy="64"
                r="58"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={364.4}
                strokeDashoffset={364.4 - (364.4 * (feedback?.totalScore || 0)) / 100}
                className="text-primary-200"
              />
            </svg>
            <span className="absolute text-3xl font-bold">{feedback?.totalScore}%</span>
          </div>
        </div>

        <div className="md:col-span-2 flex flex-col gap-6">
          <h2 className="text-2xl font-bold">Category Breakdown</h2>
          <div className="flex flex-col gap-4">
            {feedback?.categoryScores?.map((category, index) => (
              <div key={index} className="flex flex-col gap-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{category.name}</span>
                  <span className="font-bold">{category.score}%</span>
                </div>
                <div className="w-full h-2 bg-dark-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-200 transition-all duration-1000"
                    style={{ width: `${category.score}%` }}
                  />
                </div>
                <p className="text-xs text-light-400 mt-1">{category.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Final Assessment */}
      <div className="mt-12 p-6 bg-primary-200/5 rounded-2xl border border-primary-200/10">
        <h2 className="text-2xl font-bold mb-4">Executive Summary</h2>
        <p className="text-light-100 leading-relaxed italic">"{feedback?.finalAssessment}"</p>
      </div>

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
        <div className="p-6 bg-success-100/5 rounded-2xl border border-success-100/20">
          <h3 className="text-xl font-bold text-success-100 mb-4 flex items-center gap-2">
            <Image src="/star.svg" width={20} height={20} alt="star" className="brightness-150" />
            Key Strengths
          </h3>
          <ul className="space-y-3">
            {feedback?.strengths?.map((strength, index) => (
              <li key={index} className="flex gap-2 items-start text-sm">
                <span className="text-success-100 font-bold">•</span>
                {strength}
              </li>
            ))}
          </ul>
        </div>

        <div className="p-6 bg-destructive-100/5 rounded-2xl border border-destructive-100/20">
          <h3 className="text-xl font-bold text-destructive-100 mb-4 flex items-center gap-2">
            <Image src="/calendar.svg" width={20} height={20} alt="warning" className="invert brightness-200" />
            Areas for Improvement
          </h3>
          <ul className="space-y-3">
            {feedback?.areasForImprovement?.map((area, index) => (
              <li key={index} className="flex gap-2 items-start text-sm">
                <span className="text-destructive-100 font-bold">•</span>
                {area}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Resume Alignment */}
      {feedback?.resumeAlignment && (
        <div className="mt-12 p-8 bg-dark-200 rounded-2xl border border-primary-200/20">
          <h2 className="text-2xl font-bold mb-4">Resume Alignment</h2>
          <p className="text-light-100 leading-relaxed">{feedback.resumeAlignment}</p>
        </div>
      )}

      {/* Coding Detailed analysis */}
      {feedback?.codingDetailedAnalysis && feedback.codingDetailedAnalysis.length > 0 && (
        <div className="mt-12 flex flex-col gap-8 print:break-before-page">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-primary-100 print:text-black">Coding Round Detailed Analysis</h2>
            <div className="flex flex-col items-end">
              <span className="text-sm text-light-400 font-medium print:text-gray-600">Coding Proficiency</span>
              <span className="text-2xl font-bold text-primary-200 print:text-black">{feedback.codingOverallScore || 0}%</span>
            </div>
          </div>

          <div className="flex flex-col gap-10">
            {feedback.codingDetailedAnalysis.map((item, index) => (
              <div key={index} className="flex flex-col gap-6 p-8 bg-dark-200 rounded-3xl border border-light-800/20 relative overflow-hidden group hover:border-primary-500/30 transition-all duration-300 print:bg-white print:border-black print:shadow-none">
                {/* Question Status Badge */}
                <div className={cn(
                  "absolute top-0 right-0 px-6 py-2 rounded-bl-2xl text-xs font-bold uppercase tracking-widest",
                  item.isCorrect ? "bg-success-100 text-dark-400" : "bg-destructive-100 text-white"
                )}>
                  {item.isCorrect ? "Correct" : "Incorrect"} • {item.score}/10
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex gap-4 items-start">
                    <span className="flex items-center justify-center size-8 rounded-full bg-primary-500/10 text-primary-200 font-bold text-sm shrink-0 print:border print:border-black print:text-black">
                      {index + 1}
                    </span>
                    <h3 className="text-lg font-semibold text-light-100 print:text-black">{item.question}</h3>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
                    {/* User Answer */}
                    <div className="flex flex-col gap-3">
                      <p className="text-xs font-bold text-light-500 uppercase tracking-widest pl-1 print:text-gray-600">Your Solution</p>
                      <div className="bg-dark-400 p-5 rounded-2xl border border-light-800/50 h-full max-h-[300px] overflow-auto print:bg-gray-50 print:border-black">
                        <pre className="text-xs font-mono text-light-200 whitespace-pre-wrap print:text-black">
                          <code>{item.userAnswer}</code>
                        </pre>
                      </div>
                    </div>

                    {/* Optimal Solution */}
                    <div className="flex flex-col gap-3">
                      <p className="text-xs font-bold text-success-100/70 uppercase tracking-widest pl-1 print:text-gray-600">Optimal Solution</p>
                      <div className="bg-success-100/5 p-5 rounded-2xl border border-success-100/20 h-full max-h-[300px] overflow-auto print:bg-gray-50 print:border-black">
                        <pre className="text-xs font-mono text-success-100/90 whitespace-pre-wrap print:text-black font-semibold">
                          <code>{item.optimalSolution}</code>
                        </pre>
                      </div>
                    </div>
                  </div>

                  {/* AI Feedback */}
                  <div className="bg-dark-400/50 p-4 rounded-xl border border-light-800/30 mt-2 print:border-black">
                    <p className="text-sm text-light-400 italic print:text-black">
                      <span className="text-primary-400 font-bold not-italic print:text-black underline underline-offset-4 decoration-primary-500/30">AI Insight: </span>
                      {item.explanation}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mt-16 pt-8 border-t border-light-800 print:hidden">
        <Button className="btn-secondary flex-1" asChild>
          <Link href="/">Back to Dashboard</Link>
        </Button>

        <PrintButton />

        <Button className="btn-primary flex-1" asChild>
          <Link href={`/interview/${id}`}>Retake Interview</Link>
        </Button>
      </div>
    </section>
  );
};

export default Feedback;
