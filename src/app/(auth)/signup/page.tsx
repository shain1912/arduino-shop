import type { Metadata } from "next";
import Link from "next/link";
import AuthForm from "@/components/layout/AuthForm";

export const metadata: Metadata = { title: "회원가입" };

export default async function SignupPage({ searchParams }: PageProps<"/signup">) {
  const next = (await searchParams).next;
  const nextPath = typeof next === "string" ? next : "/";

  return (
    <div className="container-page flex justify-center py-16">
      <div className="w-full max-w-sm">
        <h1 className="text-center text-2xl font-bold">회원가입</h1>
        <AuthForm mode="signup" next={nextPath} />
        <p className="mt-6 text-center text-sm text-muted">
          이미 계정이 있으신가요?{" "}
          <Link
            href={`/login?next=${encodeURIComponent(nextPath)}`}
            className="font-semibold text-brand-700 hover:underline"
          >
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
