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
          <div className="flex items-center gap-6 border-b border-light-800 pb-8">
            <div className="relative">
              <Image
                src={user.gender === "female" ? "/female-avatar.png" : "/user-avatar.png"}
                alt="profile"
                width={100}
                height={100}
                className="rounded-full border-4 border-primary-200/20"
              />
              <div className="absolute bottom-1 right-1 w-6 h-6 bg-success-100 border-4 border-dark-100 rounded-full"></div>
            </div>
            <div>
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <p className="text-light-400 capitalize">{user.careerStage} • {user.gender}</p>
            </div>
          </div>

          <ProfileForm user={user} />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
