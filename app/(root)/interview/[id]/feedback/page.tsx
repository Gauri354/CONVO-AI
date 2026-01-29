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

      {/* Coding Analysis */}
      {feedback?.codingAnalysis && (
        <div className="mt-12 p-8 bg-dark-200 rounded-2xl border border-primary-200/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Coding Analysis</h2>
            <span className={cn(
              "px-4 py-1 rounded-full text-xs font-bold uppercase",
              feedback.codingAnalysis.isOptimal ? "bg-success-100/20 text-success-100" : "bg-destructive-100/20 text-destructive-100"
            )}>
              {feedback.codingAnalysis.isOptimal ? "Optimal Solution" : "Sub-Optimal Solution"}
            </span>
          </div>
          
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="text-lg font-semibold text-primary-100 mb-2">Explanation</h3>
              <p className="text-light-100 text-sm leading-relaxed">{feedback.codingAnalysis.explanation}</p>
            </div>

            {!feedback.codingAnalysis.isOptimal && (
              <div>
                <h3 className="text-lg font-semibold text-success-100 mb-2">Optimal Approach</h3>
                <div className="bg-dark-300 p-4 rounded-xl border border-light-800 overflow-x-auto">
                  <pre className="text-xs text-light-100 font-mono">
                    <code>{feedback.codingAnalysis.optimalSolution}</code>
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mt-16 pt-8 border-t border-light-800 print:hidden">
        <Button className="btn-secondary flex-1" asChild>
          <Link href="/">Back to Dashboard</Link>
        </Button>
        
        <Button 
          className="btn-secondary flex-1" 
          onClick={() => window.print()}
        >
          Download PDF Report
        </Button>

        <Button className="btn-primary flex-1" asChild>
          <Link href={`/interview/${id}`}>Retake Interview</Link>
        </Button>
      </div>
    </section>
  );
};

export default Feedback;
