"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateUser } from "@/lib/actions/auth.action";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { User, Save } from "lucide-react";

interface ProfileFormProps {
  user: {
    id: string;
    name: string;
    email: string;
    gender: "male" | "female";
    careerStage: string;
  };
}

const ProfileForm = ({ user }: ProfileFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    gender: user.gender,
    careerStage: user.careerStage,
  });

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
