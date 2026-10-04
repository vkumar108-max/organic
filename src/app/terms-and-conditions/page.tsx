import { PolicyPage } from "@/components/layout/PolicyPage";
import { site } from "@/config/site";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Terms & Conditions", description: `Terms of use for shopping at ${site.name}.`, path: "/terms-and-conditions" });

export default function Page() {
  return (
    <PolicyPage title="Terms & Conditions" path="/terms-and-conditions" sections={[
      { heading: "Using this website", body: [`By using ${site.name} you agree to these terms. You must provide accurate information when ordering.`] },
      { heading: "Products & pricing", body: ["Prices are in Indian Rupees and may change without notice. We may correct errors in price or description and cancel affected orders with a full refund. Product images are illustrative."] },
      { heading: "Orders & payment", body: ["An order is confirmed only after you receive an order confirmation. We may cancel orders for stock, pricing or verification reasons."] },
      { heading: "Liability", body: ["Our products are food items. Read the label before use. To the extent permitted by law, our liability is limited to the value of the order. [Have this clause reviewed locally.]"] },
      { heading: "Governing law", body: ["These terms are governed by the laws of [your jurisdiction]."] },
    ]} />
  );
}
