import { EmptyState } from "@/components/ui/EmptyState";

export default function PostNotFound() {
  return <div className="container-page py-10"><EmptyState icon="search" title="Article not found" description="This article may have been moved or removed." action={{ label: "All articles", href: "/blog" }} /></div>;
}
