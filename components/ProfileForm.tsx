"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateUser } from "@/lib/actions/auth.action";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { User, Save } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";

interface ProfileFormProps {
  user: {
    id: string;
    name: string;
    email: string;
    gender: "male" | "female";
    careerStage: string;
    profileImage?: string;
  };
}

const ProfileForm = ({ user }: ProfileFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    gender: user.gender,
    careerStage: user.careerStage,
    profileImage: user.profileImage || (user.gender === "female" ? "/female-avatar.png" : "/user-avatar.png"),
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profileImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const defaultAvatars = ["/user-avatar.png", "/female-avatar.png", "/ai-avatar.png", "/robot.png"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await updateUser(user.id, formData);

    setIsLoading(false);
    if (result.success) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {/* Profile Picture Header */}
      <div className="flex flex-col md:flex-row gap-6 items-center border-b border-light-800 pb-8">
        <div className="relative shrink-0">
          <Image
            src={formData.profileImage}
            alt="profile"
            width={100}
            height={100}
            className="rounded-full border-4 border-primary-200/20 object-cover w-[100px] h-[100px]"
          />
          <div className="absolute bottom-1 right-1 w-6 h-6 bg-success-100 border-4 border-dark-100 rounded-full"></div>
        </div>
        <div className="flex flex-col gap-4 flex-1 w-full">
          <div>
            <h2 className="text-2xl font-bold">{formData.name}</h2>
            <p className="text-light-400 capitalize">{formData.careerStage} • {formData.gender}</p>
          </div>
          
          <div className="flex flex-wrap items-center justify-between w-full gap-4">
            <div className="flex gap-2">
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange} 
              />
              <Button
                type="button"
                className="bg-dark-200 text-light-100 hover:bg-dark-300"
                onClick={() => fileInputRef.current?.click()}
              >
                Upload Photo
              </Button>
            </div>

            <div className="flex gap-2 items-center">
              <span className="text-sm text-light-400 mr-2 max-sm:hidden">Or select preset:</span>
              {defaultAvatars.map((avatar) => (
                <button
                  key={avatar}
                  type="button"
                  onClick={() => setFormData({ ...formData, profileImage: avatar })}
                  className={`size-10 rounded-full border-2 overflow-hidden hover:scale-110 transition-transform ${formData.profileImage === avatar ? 'border-primary-500' : 'border-transparent'}`}
                >
                  <Image src={avatar} alt="avatar" width={40} height={40} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="input"
            required
          />
        </div>

        {/* Email (Disabled) */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email Address (Cannot be changed)</Label>
          <Input
            id="email"
            value={user.email}
            disabled
            className="input opacity-50 cursor-not-allowed"
          />
        </div>

        {/* Gender */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="gender">Gender</Label>
          <select
            id="gender"
            value={formData.gender}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value as "male" | "female" })}
            className="input bg-dark-200 rounded-full min-h-12 px-5 text-light-100 border-none outline-none"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        {/* Career Stage */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="careerStage">Career Stage</Label>
          <select
            id="careerStage"
            value={formData.careerStage}
            onChange={(e) => setFormData({ ...formData, careerStage: e.target.value })}
            className="input bg-dark-200 rounded-full min-h-12 px-5 text-light-100 border-none outline-none"
          >
            <option value="student">Student</option>
            <option value="undergraduate">Undergraduate</option>
            <option value="graduate">Graduate</option>
            <option value="employee">Employee</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <Button type="submit" className="btn-primary flex gap-2 items-center" disabled={isLoading}>
          <Save size={18} />
          <span>{isLoading ? "Saving..." : "Save Changes"}</span>
        </Button>
      </div>
    </form>
  );
};

export default ProfileForm;
