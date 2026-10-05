import "server-only";

/** Centralised env access. Only booleans about secrets ever leave the server. */
export const env = {
  sessionTtlHours: Number(process.env.SESSION_TTL_HOURS ?? 12),
  isProd: process.env.NODE_ENV === "production",
  storefrontBaseDomain: process.env.STOREFRONT_BASE_DOMAIN ?? "storelaunch.app",
};

export const secretStatus = () => ({
  paymentGateway: Boolean(process.env.PAYMENT_GATEWAY_KEY_ID && process.env.PAYMENT_GATEWAY_SECRET),
  smtp: Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD),
});
