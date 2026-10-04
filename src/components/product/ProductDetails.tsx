import { Accordion } from "@/components/ui/Accordion";
import { PlaceholderNote } from "@/components/ui/PlaceholderNote";
import { shippingRules } from "@/config/site";
import type { Product } from "@/types";

/** Ingredients, usage, nutrition, storage, shipping — with honest placeholders. */
export function ProductDetails({ product }: { product: Product }) {
  return (
    <div className="space-y-4">
      <section aria-labelledby="highlights" className="rounded-card border border-line p-5">
        <h2 id="highlights" className="mb-3 text-xl font-semibold">Product highlights</h2>
        <ul className="list-disc space-y-1.5 pl-5 text-ink-soft">
          {product.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}
        </ul>
      </section>
      <Accordion
        defaultOpen="description"
        items={[
          { id: "description", title: "Description", content: <p className="text-ink-soft">{product.description}</p> },
          {
            id: "ingredients",
            title: "Ingredients",
            content: product.ingredients ? <p className="text-ink-soft">{product.ingredients}</p> : <PlaceholderNote>Ingredient list to be supplied by the business. Do not publish until verified against the pack label.</PlaceholderNote>,
          },
          {
            id: "usage",
            title: "How to use",
            content: product.usage ? <p className="text-ink-soft">{product.usage}</p> : <PlaceholderNote>Usage instructions to be supplied by the business. No dosage or health guidance is provided in demo data.</PlaceholderNote>,
          },
          {
            id: "nutrition",
            title: "Nutritional information",
            content: product.nutrition ? (
              <table className="w-full max-w-md text-left text-sm">
                <caption className="sr-only">Nutritional information</caption>
                <thead><tr><th className="border-b border-line py-2">Nutrient</th><th className="border-b border-line py-2">Per serving</th></tr></thead>
                <tbody>
                  {product.nutrition.map((row) => (
                    <tr key={row.nutrient}><td className="border-b border-line py-2">{row.nutrient}</td><td className="border-b border-line py-2">{row.perServing}</td></tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <PlaceholderNote>Nutritional values to be supplied from lab-verified data. Not shown until available.</PlaceholderNote>
            ),
          },
          {
            id: "storage",
            title: "Storage information",
            content: product.storage ? <p className="text-ink-soft">{product.storage}</p> : <PlaceholderNote>Storage instructions to be supplied by the business.</PlaceholderNote>,
          },
          {
            id: "shipping",
            title: "Shipping information",
            content: (
              <p className="text-ink-soft">
                Free shipping on orders above ₹{shippingRules.freeShippingThreshold}; otherwise a flat ₹{shippingRules.flatRate} applies. {shippingRules.estimatedDelivery}. See our{" "}
                <a className="text-brand-700 underline" href="/shipping-policy">Shipping Policy</a>.
              </p>
            ),
          },
        ]}
      />
    </div>
  );
}
