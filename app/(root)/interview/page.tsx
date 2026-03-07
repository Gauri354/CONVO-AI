import InterviewSetupFlow from "@/components/InterviewSetupFlow";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  return (
    <div className="flex flex-col gap-8 w-full">
      <InterviewSetupFlow
        userName={user.name}
        userId={user.id}
      />
    </div>
  );
}
