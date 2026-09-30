import { PolicyPage } from "@/components/layout/PolicyPage";
import { shippingRules } from "@/config/site";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Shipping Policy", description: "Delivery areas, charges and estimated delivery times.", path: "/shipping-policy" });

export default function Page() {
  return (
    <PolicyPage title="Shipping Policy" path="/shipping-policy" sections={[
      { heading: "Shipping charges", body: [`Orders above ₹${shippingRules.freeShippingThreshold} ship free. Below that, a flat charge of ₹${shippingRules.flatRate} applies. (Configured in src/config/site.ts.)`] },
      { heading: "Delivery time", body: [`${shippingRules.estimatedDelivery}. Remote locations may take longer.`] },
      { heading: "Areas served", body: ["[List the states / PIN codes you deliver to.]"] },
      { heading: "Tracking", body: ["Once shipped, you can follow your order on the Track Order page using your order number."] },
      { heading: "Delays", body: ["Weather, holidays and courier issues can delay deliveries. Contact us if your order is late."] },
    ]} />
  );
}
