import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import InterviewCard from "@/components/InterviewCard";

import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getInterviewsByUserId,
} from "@/lib/actions/general.action";
import { interviewTemplates } from "@/constants";
import TemplateInterviewCard from "@/components/TemplateInterviewCard";

async function Home() {
  const user = await getCurrentUser();

  const userInterviews = user ? await getInterviewsByUserId(user.id) : [];

  const scheduledInterviews = userInterviews?.filter((i: Interview) => i.status === "scheduled") || [];
  const inProgressInterviews = userInterviews?.filter((i: Interview) => i.status === "in-progress") || [];
  const pastInterviews = userInterviews?.filter((i: Interview) => i.status === "completed" || i.finalized) || [];

  return (
    <>
      <section className="card-cta">
        <div className="flex flex-col gap-6 max-w-lg">
          <h2>Get Interview-Ready with AI-Powered Practice & Feedback</h2>
          <p className="text-lg">
            Practice real interview questions & get instant feedback
          </p>

          <Button asChild className="btn-primary max-sm:w-full">
            <Link href="/interview">Start New Interview</Link>
          </Button>
        </div>

        <Image
          src="/robot.png"
          alt="robo-dude"
          width={400}
          height={400}
        />
      </section>

      {/* Elevate Your Interview Game Section */}
      <section className="mt-16 flex flex-col gap-10">
        <div className="text-center space-y-4">
          <h2 className="text-4xl md:text-6xl font-bold text-light-900">
            Elevate Your <span className="text-primary-500">Interview Game</span>
          </h2>
          <p className="text-2xl text-light-500 font-medium">
            Your Comprehensive AI-Powered Interview Assistant
          </p>
        </div>

        <div className="bg-dark-100 p-8 rounded-2xl border border-dark-300 text-center max-w-4xl mx-auto shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent opacity-50"></div>
          <p className="text-light-400 text-lg leading-relaxed">
            Interviews can be daunting. From technical grilling to behavioral assessments, the pressure is on.
            Convo AI's <span className="text-primary-400 font-semibold">dual-layered AI Copilot</span> ensures you stay calm and confident by delivering real-time feedback and personalized suggestions during any interview scenario.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-dark-100 p-6 rounded-2xl border border-dark-300 flex flex-col gap-4 hover:border-primary-500/50 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center text-primary-500 font-bold text-xl border border-primary-500/20">1</div>
            <h3 className="text-xl font-bold">Comprehensive Scenarios</h3>
            <p className="text-sm text-light-500">
              Go beyond generic Q&A. Our AI analyzes your resume and chosen tech stack to generate hyper-relevant interview scenarios, ranging from behavioral screens to deep technical system design.
            </p>
            <ul className="text-sm text-light-400 space-y-2 mt-2">
              <li className="flex gap-2"><span className="text-primary-500">•</span> Resume-Contextualized Questions</li>
              <li className="flex gap-2"><span className="text-primary-500">•</span> 30+ Tech Stack Templates</li>
              <li className="flex gap-2"><span className="text-primary-500">•</span> Adaptive Difficulty Levels</li>
            </ul>
          </div>

          {/* Card 2 */}
          <div className="bg-dark-100 p-6 rounded-2xl border border-dark-300 flex flex-col gap-4 hover:border-primary-500/50 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center text-primary-500 font-bold text-xl border border-primary-500/20">2</div>
            <h3 className="text-xl font-bold">Intelligent Analysis</h3>
            <p className="text-sm text-light-500">
              Stop guessing how you did. Get immediate, data-driven feedback after every session. We break down your performance across technical accuracy, communication clarity, and confidence.
            </p>
            <ul className="text-sm text-light-400 space-y-2 mt-2">
              <li className="flex gap-2"><span className="text-primary-500">•</span> Instant Performance Scoring</li>
              <li className="flex gap-2"><span className="text-primary-500">•</span> Correct vs. Given Answer Diff</li>
              <li className="flex gap-2"><span className="text-primary-500">•</span> Targeted Improvement Tips</li>
              <li className="flex gap-2"><span className="text-primary-500">•</span> Soft Skill Evaluation</li>
            </ul>
          </div>

          {/* Card 3 */}
          <div className="bg-dark-100 p-6 rounded-2xl border border-dark-300 flex flex-col gap-4 hover:border-primary-500/50 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center text-primary-500 font-bold text-xl border border-primary-500/20">3</div>
            <h3 className="text-xl font-bold">Dynamic AI Copilot</h3>
            <p className="text-sm text-light-500">
              Experience an interview that feels truly human. Our voice-enabled agent listens to your tone, asks unscripted follow-ups, and challenges your logic in real-time.
            </p>
            <ul className="text-sm text-light-400 space-y-2 mt-2">
              <li className="flex gap-2"><span className="text-primary-500">•</span> Natural Voice Interaction</li>
              <li className="flex gap-2"><span className="text-primary-500">•</span> Context-Aware Follow-ups</li>
              <li className="flex gap-2"><span className="text-primary-500">•</span> Latency-Free Conversation</li>
            </ul>
          </div>
        </div>
      </section>


      <div className="flex flex-col gap-12 mt-12">
        {/* Scheduled Interviews */}
        <section className="flex flex-col gap-6">
          <h2>Scheduled Interviews</h2>
          <div className="interviews-section">
            {scheduledInterviews.length > 0 ? (
              scheduledInterviews.map((interview) => (
                <InterviewCard
                  key={interview.id}
                  userId={user?.id}
                  interviewId={interview.id}
                  role={interview.role}
                  type={interview.type}
                  techstack={interview.techstack}
                  createdAt={interview.createdAt}
                  status={interview.status}
                  currentQuestionIndex={interview.currentQuestionIndex}
                />
              ))
            ) : (
              <p className="text-light-400">No scheduled interviews</p>
            )}
          </div>
        </section>

        {/* In-Progress Interviews */}
        <section className="flex flex-col gap-6">
          <h2>In-Progress Interviews</h2>
          <div className="interviews-section">
            {inProgressInterviews.length > 0 ? (
              inProgressInterviews.map((interview) => (
                <InterviewCard
                  key={interview.id}
                  userId={user?.id}
                  interviewId={interview.id}
                  role={interview.role}
                  type={interview.type}
                  techstack={interview.techstack}
                  createdAt={interview.createdAt}
                  status={interview.status}
                  currentQuestionIndex={interview.currentQuestionIndex}
                />
              ))
            ) : (
              <p className="text-light-400">No interviews in progress</p>
            )}
          </div>
        </section>

        {/* Past Interviews */}
        <section className="flex flex-col gap-6">
          <h2>Past Interviews</h2>
          <div className="interviews-section">
            {pastInterviews.length > 0 ? (
              pastInterviews.map((interview) => (
                <InterviewCard
                  key={interview.id}
                  userId={user?.id}
                  interviewId={interview.id}
                  role={interview.role}
                  type={interview.type}
                  techstack={interview.techstack}
                  createdAt={interview.createdAt}
                  status={interview.status}
                  currentQuestionIndex={interview.currentQuestionIndex}
                />
              ))
            ) : (
              <p className="text-light-400">No past interviews</p>
            )}
          </div>
        </section>

        {/* Pick Your Interview */}
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2>Pick Your Interview</h2>
            <p className="text-light-400">Choose from our pre-built interview templates and start practicing instantly.</p>
          </div>
          <div className="interviews-section">
            {interviewTemplates.map((template) => (
              <TemplateInterviewCard
                key={template.id}
                id={template.id}
                userId={user?.id!}
                role={template.role}
                focus={template.focus}
                level={template.level}
                duration={template.duration}
                techstack={template.techstack}
                type={template.type}
              />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

export default Home;
