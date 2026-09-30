import { cn } from "@/lib/format";

export const Skeleton = ({ className }: { className?: string }) => <div aria-hidden="true" className={cn("skeleton", className)} />;

export function ProductCardSkeleton() {
  return (
    <div className="rounded-card border border-line bg-white p-3" aria-hidden="true">
      <Skeleton className="aspect-square w-full" />
      <Skeleton className="mt-3 h-4 w-3/4" />
      <Skeleton className="mt-2 h-3 w-1/2" />
      <Skeleton className="mt-3 h-5 w-2/3" />
      <Skeleton className="mt-3 h-10 w-full rounded-full" />
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div role="status" aria-label="Loading products" className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }, (_, index) => <ProductCardSkeleton key={index} />)}
    </div>
  );
}

export function CategoryGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div role="status" aria-label="Loading categories" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, index) => <Skeleton key={index} className="h-56 rounded-card" />)}
    </div>
  );
}

export function BlogGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div role="status" aria-label="Loading articles" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, index) => (
        <div key={index}>
          <Skeleton className="aspect-[16/10] w-full" />
          <Skeleton className="mt-3 h-3 w-1/4" />
          <Skeleton className="mt-2 h-5 w-5/6" />
          <Skeleton className="mt-2 h-4 w-full" />
        </div>
      ))}
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div role="status" aria-label="Loading product" className="grid gap-8 py-6 lg:grid-cols-2">
      <Skeleton className="aspect-square w-full" />
      <div className="space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-12 w-full rounded-full" />
      </div>
    </div>
  );
}

export function CartSkeleton() {
  return (
    <div role="status" aria-label="Loading cart" className="grid gap-8 lg:grid-cols-[1fr_22rem]">
      <div className="space-y-4">
        {[0, 1, 2].map((key) => <Skeleton key={key} className="h-28 w-full rounded-card" />)}
      </div>
      <Skeleton className="h-64 w-full rounded-card" />
    </div>
  );
}

export function AccountSkeleton() {
  return (
    <div role="status" aria-label="Loading account" className="grid gap-6 lg:grid-cols-[16rem_1fr]">
      <Skeleton className="h-64 w-full rounded-card" />
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-32 w-full rounded-card" />
        <Skeleton className="h-32 w-full rounded-card" />
      </div>
    </div>
  );
}
