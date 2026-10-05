"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/form-controls";
import { useToast } from "@/components/ui/toast";
import { saveSettings } from "@/server/settings/actions";
import type { FieldDef } from "@/server/settings/definitions";

export function SettingsForm({ section, fields, initial, readOnly }: { section: string; fields: FieldDef[]; initial: Record<string, unknown>; readOnly: boolean }) {
  const [values, setValues] = useState<Record<string, unknown>>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, start] = useTransition();
  const { toast } = useToast();
  const router = useRouter();
  const set = (k: string, v: unknown) => setValues((s) => ({ ...s, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    start(async () => {
      const res = await saveSettings({ section, values });
      if (res.ok) { toast("success", res.message); router.refresh(); }
      else { setErrors(res.fieldErrors ?? {}); toast("error", res.message); }
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {fields.map((f) => {
        const id = `s-${f.name}`;
        const v = values[f.name];
        if (f.type === "boolean") {
          return (
            <label key={f.name} className="flex items-start gap-3 text-sm text-slate-700">
              <input type="checkbox" disabled={readOnly} className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600" checked={Boolean(v)} onChange={(e) => set(f.name, e.target.checked)} />
              <span><span className="font-medium">{f.label}</span>{f.help && <span className="block text-xs text-slate-500">{f.help}</span>}</span>
            </label>
          );
        }
        return (
          <Field key={f.name} label={f.label} htmlFor={id} help={f.help} error={errors[f.name]}>
            {f.type === "select" ? (
              <Select id={id} disabled={readOnly} value={String(v ?? "")} onChange={(e) => set(f.name, e.target.value)}>{f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</Select>
            ) : f.type === "textarea" ? (
              <Textarea id={id} rows={3} disabled={readOnly} value={String(v ?? "")} onChange={(e) => set(f.name, e.target.value)} />
            ) : f.type === "number" ? (
              <Input id={id} type="number" disabled={readOnly} min={f.min} max={f.max} step="any" value={String(v ?? "")} onChange={(e) => set(f.name, e.target.value === "" ? "" : Number(e.target.value))} />
            ) : f.type === "color" ? (
              <div className="flex items-center gap-3"><input id={id} type="color" disabled={readOnly} value={String(v ?? "#000000")} onChange={(e) => set(f.name, e.target.value)} className="h-9 w-14 cursor-pointer rounded border border-slate-300" /><Input value={String(v ?? "")} disabled={readOnly} onChange={(e) => set(f.name, e.target.value)} className="max-w-[9rem] font-mono" /></div>
            ) : (
              <Input id={id} type={f.type} disabled={readOnly} value={String(v ?? "")} onChange={(e) => set(f.name, e.target.value)} />
            )}
          </Field>
        );
      })}
      {!readOnly && <div className="pt-2"><Button type="submit" variant="primary" loading={pending}>Save changes</Button></div>}
    </form>
  );
}
