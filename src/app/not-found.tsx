import { EmptyState } from "@/components/ui/EmptyState";

export default function NotFound() {
  return (
    <div className="container-page py-10">
      <p className="text-center text-sm font-bold uppercase tracking-widest text-clay-500">Error 404</p>
      <EmptyState icon="search" title="We couldn’t find that page" description="The page may have moved or the link may be incorrect. Try searching, or head back to the shop." action={{ label: "Go to home", href: "/" }} secondary={{ label: "Browse categories", href: "/categories" }} />
    </div>
  );
}
