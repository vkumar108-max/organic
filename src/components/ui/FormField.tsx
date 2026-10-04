import { useId, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/format";

type Common = { label: string; error?: string; hint?: string };
type InputProps = Common & { as?: "input" } & InputHTMLAttributes<HTMLInputElement>;
type AreaProps = Common & { as: "textarea" } & TextareaHTMLAttributes<HTMLTextAreaElement>;

/** Label + control + inline error wired with aria-invalid / aria-describedby. */
export function FormField(props: InputProps | AreaProps) {
  const { label, error, hint, as = "input", className, ...rest } = props as Common & { as?: string; className?: string } & Record<string, unknown>;
  const id = useId();
  const describedBy = [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(" ") || undefined;
  const classes = cn("w-full rounded-lg border bg-white px-4 py-3 text-[0.95rem] placeholder:text-ink-soft/60", error ? "border-danger" : "border-line focus:border-brand-500", className);
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}{rest.required ? <span className="text-danger" aria-hidden="true"> *</span> : null}
      </label>
      {as === "textarea" ? (
        <textarea id={id} aria-invalid={!!error} aria-describedby={describedBy} className={classes} {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)} />
      ) : (
        <input id={id} aria-invalid={!!error} aria-describedby={describedBy} className={classes} {...(rest as InputHTMLAttributes<HTMLInputElement>)} />
      )}
      {hint && !error && <p id={`${id}-hint`} className="mt-1 text-xs text-ink-soft">{hint}</p>}
      {error && <p id={`${id}-error`} className="mt-1 text-sm text-danger">{error}</p>}
    </div>
  );
}
