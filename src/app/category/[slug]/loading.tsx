import { ProductGridSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="container-page py-8">
      <Skeleton className="mb-6 h-9 w-64" />
      <div className="grid gap-8 lg:grid-cols-[17rem_1fr]">
        <Skeleton className="hidden h-96 lg:block" />
        <ProductGridSkeleton count={9} />
      </div>
    </div>
  );
}
