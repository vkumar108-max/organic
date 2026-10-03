import type { FaqItem } from "@/types";

export interface FaqGroup { title: string; items: FaqItem[] }

/** Site-wide FAQ. Answers about shipping/returns must match your real policies. */
export const demoFaqGroups: FaqGroup[] = [
  {
    title: "Ordering",
    items: [
      { question: "How do I place an order?", answer: "Browse a category, open a product, choose a pack size and add it to your cart. Then go to checkout, enter your delivery details and pick a payment method." },
      { question: "Can I change or cancel my order?", answer: "Please contact us as soon as possible with your order number. Changes are possible only before the order is packed." },
      { question: "Do I need an account to order?", answer: "An account makes tracking and reordering easier. Configure guest checkout in the backend if you prefer it." },
    ],
  },
  {
    title: "Payments",
    items: [
      { question: "Which payment methods are accepted?", answer: "UPI, cards, net banking and cash on delivery may be available. The options shown at checkout are the ones currently enabled." },
      { question: "Is my payment information safe?", answer: "Online payments are completed on the payment provider's secure page. This website never sees or stores your card details." },
    ],
  },
  {
    title: "Shipping & delivery",
    items: [
      { question: "How long will delivery take?", answer: "Delivery time depends on your location. See the Shipping Policy for current estimates." },
      { question: "How can I track my order?", answer: "Use the Track Order page with your order number and the phone number or email used at checkout." },
    ],
  },
  {
    title: "Products",
    items: [
      { question: "Where can I find ingredients and storage details?", answer: "Each product page lists ingredients, usage and storage information supplied by the business." },
      { question: "Are your products a substitute for medicine?", answer: "No. Our products are food items and are not intended to diagnose, treat, cure or prevent any disease. See the Disclaimer." },
    ],
  },
];
