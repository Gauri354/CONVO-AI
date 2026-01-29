import InterviewSetupFlow from "@/components/InterviewSetupFlow";
import { getCurrentUser } from "@/lib/actions/auth.action";

const Page = async () => {
  const user = await getCurrentUser();

  return (
    <>
      <InterviewSetupFlow
        userName={user?.name!}
        userId={user?.id!}
      />
    </>
  );
};

export default Page;
