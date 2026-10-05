import { Skeleton, TableSkeleton } from "@/components/ui/states";
import { Card } from "@/components/ui/card";

export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <Skeleton className="mb-6 h-7 w-48" />
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
      <Card><TableSkeleton /></Card>
    </div>
  );
}
