import { ReviewCard } from "@/components/product/ReviewCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Review } from "@/types";

export function CustomerReviews({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) return null;
  const hasSample = reviews.some((review) => review.isSample);
  return (
    <section aria-labelledby="reviews" className="section bg-sand-50">
      <div className="container-page">
        <SectionHeading id="reviews" eyebrow="Customer reviews" title="What customers say" align="center" />
        {hasSample && (
          <p className="mx-auto -mt-3 mb-6 max-w-xl rounded-lg bg-white px-4 py-2 text-center text-sm text-clay-600">
            These are <strong>sample reviews</strong> for layout preview only. They will be replaced by real customer reviews.
          </p>
        )}
        <ul className="grid gap-4 md:grid-cols-3">
          {reviews.slice(0, 3).map((review) => <li key={review.id}><ReviewCard review={review} /></li>)}
        </ul>
      </div>
    </section>
  );
}
