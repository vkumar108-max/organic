import { z } from "zod";

export type FieldDef = {
  name: string;
  label: string;
  type: "text" | "email" | "number" | "boolean" | "select" | "textarea" | "color" | "url";
  options?: { value: string; label: string }[];
  help?: string;
  min?: number;
  max?: number;
};

export type SectionDef<S extends z.ZodObject<z.ZodRawShape> = z.ZodObject<z.ZodRawShape>> = {
  id: string;
  title: string;
  description: string;
  fields: FieldDef[];
  schema: S;
  defaults: z.infer<S>;
};

const section = <S extends z.ZodObject<z.ZodRawShape>>(s: SectionDef<S>) => s;

export const SETTINGS_SECTIONS = [
  section({
    id: "general",
    title: "General",
    description: "Core platform identity and contact details.",
    fields: [
      { name: "platformName", label: "Platform name", type: "text" },
      { name: "supportEmail", label: "Support email", type: "email" },
      { name: "timezone", label: "Default timezone", type: "text", help: "IANA name, e.g. UTC or America/New_York" },
      { name: "defaultCurrency", label: "Default currency", type: "select", options: ["USD", "EUR", "GBP", "INR", "AUD", "CAD"].map((c) => ({ value: c, label: c })) },
    ],
    schema: z.object({
      platformName: z.string().trim().min(2).max(60),
      supportEmail: z.string().trim().email().max(120),
      timezone: z.string().trim().min(1).max(60),
      defaultCurrency: z.enum(["USD", "EUR", "GBP", "INR", "AUD", "CAD"]),
    }),
    defaults: { platformName: "STORELAUNCH", supportEmail: "support@storelaunch.app", timezone: "UTC", defaultCurrency: "USD" as const },
  }),
  section({
    id: "branding",
    title: "Platform branding",
    description: "Appearance of platform-owned pages and emails.",
    fields: [
      { name: "logoUrl", label: "Logo URL", type: "url" },
      { name: "primaryColor", label: "Primary colour", type: "color" },
      { name: "footerText", label: "Footer text", type: "text" },
    ],
    schema: z.object({
      logoUrl: z.string().trim().max(300).refine((v) => v === "" || /^https?:\/\//.test(v), "Must be an http(s) URL"),
      primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a hex colour like #4f46e5"),
      footerText: z.string().trim().max(160),
    }),
    defaults: { logoUrl: "", primaryColor: "#4f46e5", footerText: "Powered by STORELAUNCH" },
  }),
  section({
    id: "email",
    title: "Email settings",
    description: "Sender identity for platform emails. SMTP credentials are configured through server environment variables.",
    fields: [
      { name: "fromName", label: "From name", type: "text" },
      { name: "fromEmail", label: "From email", type: "email" },
      { name: "replyTo", label: "Reply-to email", type: "email" },
    ],
    schema: z.object({
      fromName: z.string().trim().min(1).max(60),
      fromEmail: z.string().trim().email().max(120),
      replyTo: z.string().trim().email().max(120),
    }),
    defaults: { fromName: "STORELAUNCH", fromEmail: "no-reply@storelaunch.app", replyTo: "support@storelaunch.app" },
  }),
  section({
    id: "payment",
    title: "Payment configuration",
    description: "Which gateway the platform uses to bill sellers. API keys are read from server environment variables and are never shown here.",
    fields: [
      { name: "provider", label: "Gateway", type: "select", options: [{ value: "stripe", label: "Stripe" }, { value: "razorpay", label: "Razorpay" }, { value: "paypal", label: "PayPal" }, { value: "manual", label: "Manual / bank transfer" }] },
      { name: "testMode", label: "Test mode", type: "boolean", help: "Use sandbox credentials." },
      { name: "autoRetryFailed", label: "Retry failed subscription charges", type: "boolean" },
      { name: "retryAttempts", label: "Retry attempts", type: "number", min: 0, max: 10 },
    ],
    schema: z.object({
      provider: z.enum(["stripe", "razorpay", "paypal", "manual"]),
      testMode: z.boolean(),
      autoRetryFailed: z.boolean(),
      retryAttempts: z.coerce.number().int().min(0).max(10),
    }),
    defaults: { provider: "stripe" as const, testMode: true, autoRetryFailed: true, retryAttempts: 3 },
  }),
  section({
    id: "commission",
    title: "Commission settings",
    description: "Platform commission on seller sales and payout rules.",
    fields: [
      { name: "defaultRatePercent", label: "Default commission (%)", type: "number", min: 0, max: 50 },
      { name: "minimumPayout", label: "Minimum payout amount", type: "number", min: 0, max: 100000 },
      { name: "payoutSchedule", label: "Payout schedule", type: "select", options: [{ value: "WEEKLY", label: "Weekly" }, { value: "BIWEEKLY", label: "Every 2 weeks" }, { value: "MONTHLY", label: "Monthly" }] },
      { name: "holdDays", label: "Hold period (days)", type: "number", min: 0, max: 60 },
    ],
    schema: z.object({
      defaultRatePercent: z.coerce.number().min(0).max(50),
      minimumPayout: z.coerce.number().min(0).max(100000),
      payoutSchedule: z.enum(["WEEKLY", "BIWEEKLY", "MONTHLY"]),
      holdDays: z.coerce.number().int().min(0).max(60),
    }),
    defaults: { defaultRatePercent: 5, minimumPayout: 50, payoutSchedule: "WEEKLY" as const, holdDays: 7 },
  }),
  section({
    id: "notifications",
    title: "Notification settings",
    description: "Which events notify the admin team.",
    fields: [
      { name: "newSeller", label: "New seller registrations", type: "boolean" },
      { name: "payoutRequest", label: "Payout requests", type: "boolean" },
      { name: "urgentTicket", label: "Urgent support tickets", type: "boolean" },
      { name: "failedPayment", label: "Failed subscription payments", type: "boolean" },
      { name: "digest", label: "Digest frequency", type: "select", options: [{ value: "OFF", label: "Off" }, { value: "DAILY", label: "Daily" }, { value: "WEEKLY", label: "Weekly" }] },
    ],
    schema: z.object({
      newSeller: z.boolean(), payoutRequest: z.boolean(), urgentTicket: z.boolean(), failedPayment: z.boolean(),
      digest: z.enum(["OFF", "DAILY", "WEEKLY"]),
    }),
    defaults: { newSeller: true, payoutRequest: true, urgentTicket: true, failedPayment: true, digest: "DAILY" as const },
  }),
  section({
    id: "security",
    title: "Security settings",
    description: "Sign-in protection for admin accounts.",
    fields: [
      { name: "maxLoginAttempts", label: "Failed logins before lockout", type: "number", min: 3, max: 20 },
      { name: "lockoutMinutes", label: "Lockout duration (minutes)", type: "number", min: 1, max: 1440 },
      { name: "requireTwoFactor", label: "Require two-factor authentication", type: "boolean", help: "Prepared for a future release; the flag is stored but not yet enforced." },
    ],
    schema: z.object({
      maxLoginAttempts: z.coerce.number().int().min(3).max(20),
      lockoutMinutes: z.coerce.number().int().min(1).max(1440),
      requireTwoFactor: z.boolean(),
    }),
    defaults: { maxLoginAttempts: 5, lockoutMinutes: 15, requireTwoFactor: false },
  }),
  section({
    id: "maintenance",
    title: "Maintenance mode",
    description: "Flag consumed by the seller dashboard and storefronts. The admin panel stays available.",
    fields: [
      { name: "enabled", label: "Maintenance mode enabled", type: "boolean" },
      { name: "message", label: "Message shown to visitors", type: "textarea" },
    ],
    schema: z.object({ enabled: z.boolean(), message: z.string().trim().max(400) }),
    defaults: { enabled: false, message: "We're performing scheduled maintenance and will be back shortly." },
  }),
];

export type SectionId = (typeof SETTINGS_SECTIONS)[number]["id"];
