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
          className="max-sm:hidden"
        />
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
