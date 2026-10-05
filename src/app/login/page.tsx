import { redirect } from "next/navigation";
import { Rocket } from "lucide-react";
import { getAuthContext } from "@/server/rbac/context";
import { LoginForm } from "./login-form";

export const metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await getAuthContext()) redirect("/");
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-900 to-brand-900 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-3 text-white">
          <div className="rounded-xl bg-brand-500 p-2.5"><Rocket className="h-6 w-6" /></div>
          <div className="leading-tight"><p className="text-lg font-bold tracking-wide">STORELAUNCH</p><p className="text-xs uppercase tracking-widest text-slate-400">Super Admin</p></div>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
          <h1 className="text-lg font-semibold text-slate-900">Sign in</h1>
          <p className="mt-1 text-sm text-slate-500">Authorized platform staff only. All access is logged.</p>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
