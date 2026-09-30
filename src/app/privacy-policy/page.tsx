import { PolicyPage } from "@/components/layout/PolicyPage";
import { site } from "@/config/site";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Privacy Policy", description: `How ${site.name} collects, uses and protects your personal information.`, path: "/privacy-policy" });

export default function Page() {
  return (
    <PolicyPage title="Privacy Policy" path="/privacy-policy" sections={[
      { heading: "Information we collect", body: ["We collect the details you give us when you place an order, create an account, contact us or subscribe: name, mobile number, email address and delivery address.", "Payment details are entered on our payment provider's secure page. We never see or store your card number, UPI PIN or net-banking credentials."] },
      { heading: "How we use your information", body: ["To process and deliver orders, provide support, send order updates and, if you opt in, share product news and offers. You can unsubscribe at any time."] },
      { heading: "Sharing", body: ["We share information only with service providers needed to run the store (payment, shipping, email) and where required by law. We do not sell personal data."] },
      { heading: "Your choices", body: ["You may request access, correction or deletion of your data by contacting us at [support email]."] },
      { heading: "Cookies & local storage", body: ["We use local storage in your browser to remember your cart, wishlist and recent searches. [Describe any analytics or advertising cookies you add.]"] },
      { heading: "Contact", body: [`Questions about this policy: ${site.contact.email}`] },
    ]} />
  );
}
