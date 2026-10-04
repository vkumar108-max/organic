import type { ReactNode } from "react";
import { Button } from "./Button";
import { Icon, type IconName } from "./Icon";

interface EmptyStateProps {
  icon?: IconName;
  title: string;
  description: string;
  action?: { label: string; href: string };
  secondary?: { label: string; href: string };
  children?: ReactNode;
}

/** One component for every "nothing here" / error screen so none is ever blank. */
export function EmptyState({ icon = "leaf", title, description, action, secondary, children }: EmptyStateProps) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-14 text-center">
      <div className="mb-5 grid h-16 w-16 place-items-center rounded-full bg-brand-100 text-brand-700">
        <Icon name={icon} size={30} />
      </div>
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="mt-2 text-ink-soft">{description}</p>
      {children}
      {(action || secondary) && (
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {action && <Button href={action.href}>{action.label}</Button>}
          {secondary && <Button href={secondary.href} variant="outline">{secondary.label}</Button>}
        </div>
      )}
    </div>
  );
}
