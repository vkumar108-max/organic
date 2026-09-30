import { Rating } from "@/components/ui/Rating";
import { formatDate } from "@/lib/format";
import type { Review } from "@/types";

export function ReviewCard({ review }: { review: Review }) {
  return (
    <figure className="flex h-full flex-col gap-3 rounded-card border border-line bg-white p-5 shadow-card">
      <div className="flex items-center justify-between gap-2">
        <Rating value={review.rating} size={16} />
        {review.isSample && <span className="rounded-full bg-sand-100 px-2 py-0.5 text-[0.7rem] font-bold uppercase text-clay-600">Sample</span>}
      </div>
      {review.title && <p className="font-semibold">{review.title}</p>}
      <blockquote className="text-ink-soft">{review.body}</blockquote>
      <figcaption className="mt-auto flex flex-wrap items-center gap-x-2 text-sm">
        <span className="font-semibold">{review.author}</span>
        {review.verifiedPurchase && <span className="inline-flex items-center gap-1 text-brand-700">✓ Verified purchase</span>}
        <span className="text-ink-soft">· {formatDate(review.createdAt)}</span>
      </figcaption>
    </figure>
  );
}
