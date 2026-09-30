/** Shown wherever real business data (ingredients, nutrition…) has not been supplied yet. */
export function PlaceholderNote({ children }: { children: string }) {
  return (
    <p className="rounded-lg border border-dashed border-clay-500/50 bg-sand-50 px-4 py-3 text-sm text-clay-600">
      <strong className="font-semibold">Placeholder:</strong> {children}
    </p>
  );
}
