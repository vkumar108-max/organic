import { PageShell } from "./PageShell";

export interface PolicySection { heading: string; body: string[] }

/** Shared layout for every legal/policy page. Content lives with each route. */
export function PolicyPage({ title, path, sections }: { title: string; path: string; sections: PolicySection[] }) {
  return (
    <PageShell title={title} path={path} narrow>
      <p className="mb-6 rounded-lg border border-dashed border-clay-500/50 bg-sand-50 p-4 text-sm text-clay-600">
        <strong>Template text:</strong> this is general starter wording, not legal advice. Replace bracketed items and have it reviewed by a qualified professional before publishing.
      </p>
      {sections.map((section) => (
        <section key={section.heading}>
          <h2>{section.heading}</h2>
          {section.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </section>
      ))}
    </PageShell>
  );
}
