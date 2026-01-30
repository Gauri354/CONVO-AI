import dayjs from "dayjs";
import Link from "next/link";
import { FileText, Download, ExternalLink } from "lucide-react";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { redirect } from "next/navigation";
import { getAllFeedbacksByUserId, getInterviewById } from "@/lib/actions/general.action";
import { Button } from "@/components/ui/button";

const ReportsPage = async () => {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const feedbacks = await getAllFeedbacksByUserId(user.id);

  // Fetch interview details for each feedback to show the role
  const reports = await Promise.all(
    feedbacks.map(async (f) => {
      const interview = await getInterviewById(f.interviewId);
      return {
        ...f,
        role: interview?.role || "Unknown Interview",
      };
    })
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold">My Interview Reports</h1>
        <p className="text-light-400 text-lg">Track your progress and download your performance summaries.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {reports.length > 0 ? (
          reports.map((report) => (
            <div
              key={report.id}
              className="card-border w-full"
            >
              <div className="card p-6 flex flex-row items-center justify-between max-sm:flex-col max-sm:gap-6">
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-primary-200/10 rounded-2xl text-primary-200">
                    <FileText size={32} />
                  </div>
                  <div>
                    <h3 className="capitalize">{report.role} Interview</h3>
                    <div className="flex gap-4 mt-1">
                      <p className="text-sm text-light-400">
                        Date: {dayjs(report.createdAt).format("MMM D, YYYY")}
                      </p>
                      <p className="text-sm font-bold text-primary-200">
                        Score: {report.totalScore}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button className="btn-secondary" asChild>
                    <Link href={`/interview/${report.interviewId}/feedback`} className="flex gap-2 items-center">
                      <ExternalLink size={16} />
                      <span>View Report</span>
                    </Link>
                  </Button>

                  <Button className="btn-primary" asChild>
                    <Link href={`/interview/${report.interviewId}/feedback`} className="flex gap-2 items-center">
                      <Download size={16} />
                      <span>Download PDF</span>
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-dark-200 rounded-3xl border border-dashed border-light-800">
            <FileText size={64} className="text-light-800 mb-4" />
            <p className="text-light-400">You haven't completed any interviews yet.</p>
            <Button className="btn-primary mt-6" asChild>
              <Link href="/interview">Start Your First Interview</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
