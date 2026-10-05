"use server";

import { createAction, ActionError, idSchema } from "../actions/create-action";

type Op = { allowedFrom: string[]; apply: (d: { type: string }) => Record<string, unknown>; audit: string; verb: string };

const OPS: Record<string, Op> = {
  verify: { allowedFrom: ["PENDING", "VERIFYING", "FAILED"], apply: (d) => ({ status: "VERIFIED", verifiedAt: new Date(), sslStatus: d.type === "SUBDOMAIN" ? "ACTIVE" : "PENDING" }), audit: "domain.verified", verb: "marked as verified" },
  retry: { allowedFrom: ["PENDING", "FAILED"], apply: () => ({ status: "VERIFYING" }), audit: "domain.verification_retried", verb: "queued for re-verification" },
  disable: { allowedFrom: ["PENDING", "VERIFYING", "VERIFIED", "FAILED"], apply: () => ({ status: "DISABLED" }), audit: "domain.disabled", verb: "disabled" },
  enable: { allowedFrom: ["DISABLED"], apply: () => ({ status: "PENDING", verifiedAt: null }), audit: "domain.enabled", verb: "re-enabled (pending verification)" },
};

function domainAction(op: keyof typeof OPS) {
  const o = OPS[op]!;
  return createAction({
    permission: "domains.manage", schema: idSchema,
    handler: async ({ id }, ctx) => {
      await ctx.tx(async (tx) => {
        const d = await tx.domain.findUnique({ where: { id } });
        if (!d) throw new ActionError("Domain not found.");
        if (!o.allowedFrom.includes(d.status)) throw new ActionError(`A ${d.status.toLowerCase()} domain can't be ${o.verb}.`);
        await tx.domain.update({ where: { id }, data: o.apply(d) });
        await ctx.audit({ action: o.audit, targetType: "Domain", targetId: id, description: `Domain ${d.hostname} ${o.verb}`, metadata: { from: d.status } }, tx);
      });
      return `Domain ${o.verb}.`;
    },
  });
}

export const verifyDomain = domainAction("verify");
export const retryDomain = domainAction("retry");
export const disableDomain = domainAction("disable");
export const enableDomain = domainAction("enable");
