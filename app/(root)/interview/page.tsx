import InterviewSetupFlow from "@/components/InterviewSetupFlow";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { Suspense } from "react";

const Page = async () => {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  return (
    <Suspense fallback={<div className="flex items-center justify-center p-20">Loading setup...</div>}>
      <InterviewSetupFlow
        userName={user?.name!}
        userId={user?.id!}
      />
    </Suspense>
  );
};

export default Page;
