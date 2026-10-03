import { Icon, type IconName } from "@/components/ui/Icon";
import { SectionHeading } from "@/components/ui/SectionHeading";

/**
 * Trust points describe how the store operates (checkout, support), not
 * unverified product claims. Edit the copy once the business confirms details.
 */
const points: { icon: IconName; title: string; text: string }[] = [
  { icon: "leaf", title: "Quality focused", text: "Every product page lists what is inside, so you can decide with confidence." },
  { icon: "check", title: "Carefully selected", text: "Ingredients and pack details are shown clearly before you buy." },
  { icon: "package", title: "Careful packaging", text: "Packed to protect your order in transit. (Confirm packaging details.)" },
  { icon: "lock", title: "Secure payments", text: "Online payments are handled on the payment provider's secure page." },
  { icon: "truck", title: "Reliable delivery", text: "Track your order from placement to delivery." },
  { icon: "headset", title: "Customer support", text: "Questions about an order? Reach us through the contact page." },
];

export function WhyChooseUs() {
  return (
    <section aria-labelledby="why-us" className="section bg-brand-50/70">
      <div className="container-page">
        <SectionHeading id="why-us" eyebrow="Why shop with us" title="Made easy from browse to doorstep" align="center" />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {points.map((point) => (
            <li key={point.title} className="flex gap-4 rounded-card bg-white p-5 shadow-card">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-100 text-brand-700"><Icon name={point.icon} size={24} /></span>
              <div>
                <h3 className="font-sans text-base font-semibold">{point.title}</h3>
                <p className="mt-1 text-sm text-ink-soft">{point.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
