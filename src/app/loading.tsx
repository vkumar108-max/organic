import { ProductGridSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="container-page py-8">
      <Skeleton className="mb-6 h-9 w-64" />
      <ProductGridSkeleton count={8} />
    </div>
  );
}
