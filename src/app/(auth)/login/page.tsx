import type { Metadata } from "next";
import Link from "next/link";
import AuthForm from "@/components/layout/AuthForm";

export const metadata: Metadata = { title: "로그인" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const next = (await searchParams).next;
  const nextPath = typeof next === "string" ? next : "/";

  return (
    <div className="container-page flex justify-center py-16">
      <div className="w-full max-w-sm">
        <h1 className="text-center text-2xl font-bold">로그인</h1>
        <AuthForm mode="login" next={nextPath} />
        <p className="mt-6 text-center text-sm text-muted">
          아직 회원이 아니신가요?{" "}
          <Link
            href={`/signup?next=${encodeURIComponent(nextPath)}`}
            className="font-semibold text-brand-700 hover:underline"
          >
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
