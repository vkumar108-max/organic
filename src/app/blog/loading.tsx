import { BlogGridSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="container-page py-8">
      <Skeleton className="mb-6 h-9 w-56" />
      <BlogGridSkeleton count={6} />
    </div>
  );
}
