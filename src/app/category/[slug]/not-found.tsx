import { EmptyState } from "@/components/ui/EmptyState";

export default function CategoryNotFound() {
  return <div className="container-page py-10"><EmptyState icon="grid" title="Category not found" description="We couldn’t find that category. Here are all the categories you can browse." action={{ label: "View all categories", href: "/categories" }} /></div>;
}
