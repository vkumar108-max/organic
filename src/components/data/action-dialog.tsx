"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Dropdown } from "@/components/ui/dropdown";
import { Field, Input, Select, Textarea } from "@/components/ui/form-controls";
import { useToast } from "@/components/ui/toast";

export type FormField = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "select" | "number" | "checkbox" | "checkboxes" | "email" | "password" | "url";
  options?: { value: string; label: string }[];
  required?: boolean;
  placeholder?: string;
  help?: string;
  defaultValue?: string | number | boolean | string[] | null;
  /** number: blank submits null (e.g. "unlimited") */
  nullable?: boolean;
  step?: string;
};

export type ActionResult = { ok: true; message: string; data?: unknown } | { ok: false; message: string; fieldErrors?: Record<string, string> };

export type ActionDef = {
  label: string;
  /** A server action. Receives `{ ...input, ...formValues }`. */
  action: (input: never) => Promise<ActionResult>;
  input?: Record<string, unknown>;
  destructive?: boolean;
  confirm?: { title: string; description: string; confirmLabel?: string };
  /** When present, a form dialog is shown. */
  form?: { title: string; description?: string; fields: FormField[]; submitLabel?: string; size?: "sm" | "md" | "lg" };
  hidden?: boolean;
};

type Values = Record<string, string | boolean | string[]>;

const initialValues = (fields: FormField[]): Values =>
  Object.fromEntries(fields.map((f) => [f.name, f.type === "checkbox" ? Boolean(f.defaultValue) : f.type === "checkboxes" ? ((f.defaultValue as string[]) ?? []) : String(f.defaultValue ?? "")]));

function coerce(fields: FormField[], v: Values) {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    const raw = v[f.name];
    if (f.type === "number") out[f.name] = raw === "" ? (f.nullable ? null : undefined) : Number(raw);
    else if (f.type === "checkbox" || f.type === "checkboxes") out[f.name] = raw;
    else out[f.name] = typeof raw === "string" && raw.trim() === "" && !f.required ? undefined : raw;
  }
  return out;
}

/** Runs one ActionDef: optional confirmation / form dialog -> server action -> toast -> refresh. */
function ActionDialog({ def, open, onClose }: { def: ActionDef; open: boolean; onClose: () => void }) {
  const { toast } = useToast();
  const router = useRouter();
  const [pending, start] = useTransition();
  const fields = def.form?.fields ?? [];
  const [values, setValues] = useState<Values>(() => initialValues(fields));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const submit = () => {
    setErrors({}); setFormError(null);
    start(async () => {
      const res = await def.action({ ...(def.input ?? {}), ...coerce(fields, values) } as never);
      if (res.ok) {
        toast("success", res.message);
        onClose();
        router.refresh();
      } else {
        setErrors(res.fieldErrors ?? {});
        setFormError(res.message);
        toast("error", res.message);
      }
    });
  };

  const title = def.form?.title ?? def.confirm?.title ?? def.label;
  const description = def.form?.description ?? def.confirm?.description;
  const set = (name: string, val: string | boolean | string[]) => setValues((s) => ({ ...s, [name]: val }));

  return (
    <Modal
      open={open}
      onClose={pending ? () => {} : onClose}
      title={title}
      description={description}
      size={def.form?.size ?? "md"}
      footer={<>
        <Button variant="secondary" onClick={onClose} disabled={pending}>Cancel</Button>
        <Button variant={def.destructive ? "danger" : "primary"} loading={pending} onClick={submit} form="action-form">
          {def.form?.submitLabel ?? def.confirm?.confirmLabel ?? def.label}
        </Button>
      </>}
    >
      <form id="action-form" onSubmit={(e) => { e.preventDefault(); submit(); }} className="space-y-4">
        {fields.map((f) => {
          const id = `f-${f.name}`;
          const err = errors[f.name];
          const common = { id, name: f.name, required: f.required, placeholder: f.placeholder, "aria-invalid": Boolean(err) };
          if (f.type === "checkbox") {
            return (
              <label key={f.name} className="flex items-start gap-2 text-sm text-slate-700">
                <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600" checked={Boolean(values[f.name])} onChange={(e) => set(f.name, e.target.checked)} />
                <span>{f.label}{f.help && <span className="block text-xs text-slate-500">{f.help}</span>}</span>
              </label>
            );
          }
          if (f.type === "checkboxes") {
            const selected = (values[f.name] as string[]) ?? [];
            return (
              <Field key={f.name} label={f.label} help={f.help} error={err}>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {f.options?.map((o) => (
                    <label key={o.value} className="flex items-center gap-2 text-sm text-slate-700">
                      <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-brand-600" checked={selected.includes(o.value)}
                        onChange={(e) => set(f.name, e.target.checked ? [...selected, o.value] : selected.filter((x) => x !== o.value))} />
                      {o.label}
                    </label>
                  ))}
                </div>
              </Field>
            );
          }
          return (
            <Field key={f.name} label={f.label + (f.required ? " *" : "")} htmlFor={id} help={f.help} error={err}>
              {f.type === "textarea" ? (
                <Textarea {...common} rows={3} value={values[f.name] as string} onChange={(e) => set(f.name, e.target.value)} />
              ) : f.type === "select" ? (
                <Select {...common} value={values[f.name] as string} onChange={(e) => set(f.name, e.target.value)}>
                  {!f.required && <option value="">—</option>}
                  {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </Select>
              ) : (
                <Input {...common} type={f.type ?? "text"} step={f.step} value={values[f.name] as string} onChange={(e) => set(f.name, e.target.value)} autoComplete={f.type === "password" ? "new-password" : undefined} />
              )}
            </Field>
          );
        })}
        {formError && !Object.keys(errors).length && <p role="alert" className="text-sm text-red-600">{formError}</p>}
      </form>
    </Modal>
  );
}

const needsDialog = (d: ActionDef) => Boolean(d.confirm || d.form);

/** Single action as a button (detail-page headers, toolbars). */
export function ActionButton({ def, variant, size = "md" }: { def: ActionDef; variant?: "primary" | "secondary" | "danger" | "ghost"; size?: "sm" | "md" }) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const { toast } = useToast();
  const router = useRouter();
  if (def.hidden) return null;
  const run = () => {
    if (needsDialog(def)) return setOpen(true);
    start(async () => {
      const res = await def.action((def.input ?? {}) as never);
      toast(res.ok ? "success" : "error", res.message);
      if (res.ok) router.refresh();
    });
  };
  return (
    <>
      <Button variant={variant ?? (def.destructive ? "danger" : "secondary")} size={size} loading={pending} onClick={run}>{def.label}</Button>
      {open && <ActionDialog def={def} open onClose={() => setOpen(false)} />}
    </>
  );
}

/** "…" menu of actions for a table row. Hidden actions (no permission / invalid state) are omitted. */
export function RowActions({ actions, extra = [] }: { actions: ActionDef[]; extra?: { label: string; href: string }[] }) {
  const [active, setActive] = useState<ActionDef | null>(null);
  const [, start] = useTransition();
  const { toast } = useToast();
  const router = useRouter();
  const visible = actions.filter((a) => !a.hidden);
  if (visible.length + extra.length === 0) return null;

  const items = [
    ...extra.map((e) => ({ label: e.label, href: e.href, onSelect: () => {} })),
    ...visible.map((def) => ({
      label: def.label,
      destructive: def.destructive,
      onSelect: () => {
        if (needsDialog(def)) return setActive(def);
        start(async () => {
          const res = await def.action((def.input ?? {}) as never);
          toast(res.ok ? "success" : "error", res.message);
          if (res.ok) router.refresh();
        });
      },
    })),
  ];
  return (
    <>
      <Dropdown items={items} trigger={<span className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"><MoreHorizontal className="h-5 w-5" /></span>} />
      {active && <ActionDialog def={active} open onClose={() => setActive(null)} />}
    </>
  );
}
