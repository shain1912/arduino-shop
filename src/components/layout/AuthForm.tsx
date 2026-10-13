"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

// 외부 주소로 튕겨 나가지 않도록 내부 경로만 허용
function safeNext(next: string) {
  return next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

function translateError(message: string) {
  if (message.includes("Invalid login credentials")) return "이메일 또는 비밀번호가 올바르지 않습니다.";
  if (message.includes("User already registered")) return "이미 가입된 이메일입니다.";
  if (message.includes("Password should be")) return "비밀번호는 6자 이상이어야 합니다.";
  if (message.includes("rate limit")) return "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.";
  if (message.includes("valid email") || message.includes("invalid format")) return "이메일 형식이 올바르지 않습니다.";
  return message;
}

export default function AuthForm({ mode, next }: { mode: "login" | "signup"; next: string }) {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email")).trim();
    const password = String(form.get("password"));
    const supabase = createClient();
    setPending(true);

    if (mode === "signup") {
      const name = String(form.get("name")).trim();
      if (password !== String(form.get("passwordConfirm"))) {
        setError("비밀번호가 일치하지 않습니다.");
        setPending(false);
        return;
      }
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
      if (error) {
        setError(translateError(error.message));
        setPending(false);
        return;
      }
      if (!data.session) {
        // 이메일 인증이 켜져 있는 경우
        const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
        if (loginError) {
          setError("가입 확인 메일을 보냈습니다. 메일의 링크를 누른 뒤 로그인해 주세요.");
          setPending(false);
          return;
        }
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(translateError(error.message));
        setPending(false);
        return;
      }
    }

    // 헤더(루트 레이아웃)까지 로그인 상태로 다시 그리도록 전체 페이지를 새로 불러온다
    window.location.replace(safeNext(next));
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      {mode === "signup" && (
        <div>
          <label className="label" htmlFor="name">
            이름
          </label>
          <input id="name" name="name" className="input" autoComplete="name" required />
        </div>
      )}
      <div>
        <label className="label" htmlFor="email">
          이메일
        </label>
        <input id="email" name="email" type="email" className="input" autoComplete="email" required />
      </div>
      <div>
        <label className="label" htmlFor="password">
          비밀번호
        </label>
        <input
          id="password"
          name="password"
          type="password"
          className="input"
          minLength={6}
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          required
        />
      </div>
      {mode === "signup" && (
        <div>
          <label className="label" htmlFor="passwordConfirm">
            비밀번호 확인
          </label>
          <input
            id="passwordConfirm"
            name="passwordConfirm"
            type="password"
            className="input"
            minLength={6}
            autoComplete="new-password"
            required
          />
        </div>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" className="btn-primary w-full py-3" disabled={pending}>
        {pending ? "처리 중..." : mode === "login" ? "로그인" : "가입하기"}
      </button>
    </form>
  );
}
