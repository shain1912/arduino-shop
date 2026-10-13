import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  phone: string;
  isAdmin: boolean;
};

// 한 요청 안에서는 한 번만 조회한다
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, phone, role")
    .eq("id", claims.sub)
    .maybeSingle();

  return {
    id: claims.sub,
    email: (claims.email as string | undefined) ?? "",
    name: profile?.name ?? "",
    phone: profile?.phone ?? "",
    isAdmin: profile?.role === "admin",
  };
});

export async function requireUser(next = "/") {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return user;
}

export async function requireAdmin() {
  const user = await requireUser("/admin");
  if (!user.isAdmin) redirect("/");
  return user;
}
