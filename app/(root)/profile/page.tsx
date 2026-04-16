import { getCurrentUser } from "@/lib/actions/auth.action";
import ProfileForm from "@/components/ProfileForm";
import Image from "next/image";
import { redirect } from "next/navigation";

const ProfilePage = async () => {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  return (
    <div className="flex flex-col gap-10 max-w-4xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold">My Profile</h1>
        <p className="text-light-400 text-lg">Manage your personal information and account settings.</p>
      </div>

      <div className="card-border w-full">
        <div className="card p-8 flex flex-col gap-10">
          <ProfileForm user={user} />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
