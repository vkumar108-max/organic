import { EmptyState } from "@/components/ui/EmptyState";

export default function ProductNotFound() {
  return <div className="container-page py-10"><EmptyState icon="search" title="Product not found" description="This product may have been removed or the link is incorrect." action={{ label: "Browse all products", href: "/shop" }} secondary={{ label: "Categories", href: "/categories" }} /></div>;
}
