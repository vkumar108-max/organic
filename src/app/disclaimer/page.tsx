import { PolicyPage } from "@/components/layout/PolicyPage";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Disclaimer", description: "Important information about our products and website content.", path: "/disclaimer" });

export default function Page() {
  return (
    <PolicyPage title="Disclaimer" path="/disclaimer" sections={[
      { heading: "Not medical advice", body: ["Information on this website, including blog articles, is for general education only. It is not medical advice and is not intended to diagnose, treat, cure or prevent any disease."] },
      { heading: "Food products", body: ["Our products are food items and are not a substitute for a balanced diet or medicine. If you are pregnant, nursing, on medication or have a medical condition, consult a qualified professional before use."] },
      { heading: "Allergens", body: ["Please read ingredient and allergen information on the pack. [Add manufacturing-facility allergen statement once verified.]"] },
      { heading: "Accuracy", body: ["Product images are illustrative and packaging may vary. We make reasonable efforts to keep information accurate but do not warrant that it is error-free."] },
    ]} />
  );
}
