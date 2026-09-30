import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { PlaceholderNote } from "@/components/ui/PlaceholderNote";
import { site } from "@/config/site";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "About Us", description: `Learn about ${site.name}, our products and how we work.`, path: "/about" });

export default function AboutPage() {
  return (
    <PageShell title="About Us" path="/about" intro={`${site.name} offers fruit, leaf and vegetable powders, tablets, dry vegetables and value combos.`} narrow>
      <PlaceholderNote>Add your real brand story, founding year, sourcing and quality processes here. Only state certifications or claims you can document.</PlaceholderNote>
      <h2>What we offer</h2>
      <p>A focused range of natural food products in convenient formats, each with clear pack sizes, pricing and product information.</p>
      <h2>How we work</h2>
      <ul>
        <li>Clear product pages with ingredients, storage and usage details as supplied by the business.</li>
        <li>Secure checkout with payments handled by a trusted provider.</li>
        <li>Order tracking and friendly customer support.</li>
      </ul>
      <div className="mt-8"><Button href="/shop">Start shopping</Button></div>
    </PageShell>
  );
}
