import Link from "next/link";
import { CheckCircle2, CircleSlash } from "lucide-react";
import { requirePermission } from "@/server/rbac/context";
import { getSection } from "@/server/settings/service";
import { SETTINGS_SECTIONS } from "@/server/settings/definitions";
import { secretStatus } from "@/lib/env";
import { Card, CardBody, CardHeader, PageHeader } from "@/components/ui/card";
import { SettingsForm } from "@/features/settings/settings-form";
import { cn } from "@/lib/utils";

export const metadata = { title: "Settings" };

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ section?: string }> }) {
  const ctx = await requirePermission("settings.view");
  const id = (await searchParams).section;
  const def = SETTINGS_SECTIONS.find((s) => s.id === id) ?? SETTINGS_SECTIONS[0]!;
  const values = await getSection(def.id);
  const secrets = secretStatus();
  const manage = ctx.can("settings.manage");
  const credential = def.id === "payment" ? { label: "Gateway API credentials", ok: secrets.paymentGateway, hint: "PAYMENT_GATEWAY_KEY_ID / PAYMENT_GATEWAY_SECRET" } : def.id === "email" ? { label: "SMTP credentials", ok: secrets.smtp, hint: "SMTP_HOST / SMTP_USER / SMTP_PASSWORD" } : null;

  return (
    <>
      <PageHeader title="Settings" description="Platform-wide configuration. Secrets live in server environment variables, never in this UI." />
      <div className="grid gap-6 lg:grid-cols-[14rem_1fr]">
        <nav aria-label="Settings sections" className="flex gap-1 overflow-x-auto lg:flex-col">
          {SETTINGS_SECTIONS.map((s) => (
            <Link key={s.id} href={`/settings?section=${s.id}`} aria-current={s.id === def.id ? "page" : undefined}
              className={cn("whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium", s.id === def.id ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100")}>{s.title}</Link>
          ))}
        </nav>
        <Card className="max-w-2xl">
          <CardHeader title={def.title} description={def.description} />
          <CardBody className="space-y-6">
            {credential && (
              <div className={cn("flex items-start gap-3 rounded-lg border p-3 text-sm", credential.ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-800")}>
                {credential.ok ? <CheckCircle2 className="mt-0.5 h-4 w-4" /> : <CircleSlash className="mt-0.5 h-4 w-4" />}
                <div><p className="font-medium">{credential.label}: {credential.ok ? "configured" : "not configured"}</p><p className="text-xs opacity-80">Set via server environment ({credential.hint}). Values are never sent to the browser.</p></div>
              </div>
            )}
            {!manage && <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">You have view-only access. Changing settings requires the settings.manage permission.</p>}
            <SettingsForm key={def.id} section={def.id} fields={def.fields} initial={values} readOnly={!manage} />
          </CardBody>
        </Card>
      </div>
    </>
  );
}
