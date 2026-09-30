import { PolicyPage } from "@/components/layout/PolicyPage";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Refund Policy", description: "How returns, replacements and refunds work.", path: "/refund-policy" });

export default function Page() {
  return (
    <PolicyPage title="Refund Policy" path="/refund-policy" sections={[
      { heading: "Damaged or incorrect items", body: ["If your order arrives damaged or incorrect, contact us within [number] days of delivery with your order number and photos. We will offer a replacement or refund."] },
      { heading: "Change of mind", body: ["[State whether opened or unopened food products can be returned. Food items are commonly non-returnable once opened.]"] },
      { heading: "Refund timelines", body: ["Approved refunds are returned to the original payment method within [number] business days. Cash-on-delivery refunds are made by [method]."] },
      { heading: "Cancellations", body: ["Orders can be cancelled before they are packed. Contact us with your order number as soon as possible."] },
    ]} />
  );
}
