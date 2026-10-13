import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import ProfileForm from "@/components/checkout/ProfileForm";

export const metadata: Metadata = { title: "회원 정보" };

export default async function ProfilePage() {
  const user = await requireUser("/mypage/profile");
  return (
    <div>
      <h1 className="text-xl font-bold">회원 정보</h1>
      <ProfileForm email={user.email} name={user.name} phone={user.phone} />
    </div>
  );
}
