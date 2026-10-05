import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requirePermission } from "@/server/rbac/context";
import { getOrderDetail } from "@/server/orders/queries";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { DetailList } from "@/components/data/detail-list";
import { EntityLink, MiniTable, Mono, Td } from "@/features/shared/ui";
import { formatDateTime, formatMoney } from "@/lib/format";
import { humanize } from "@/config/statuses";

export const metadata = { title: "Order" };

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const ctx = await requirePermission("orders.view");
  const { id } = await params;
  const o = await getOrderDetail(id);
  if (!o) notFound();
  return (
    <>
      <Link href="/orders" className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"><ArrowLeft className="h-4 w-4" />All orders</Link>
      <div className="mb-6 flex flex-wrap items-center gap-3"><h1 className="text-xl font-semibold text-slate-900">Order {o.number}</h1><StatusBadge status={o.status} /><StatusBadge status={o.paymentStatus} /></div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2"><CardHeader title="Order details" /><CardBody><DetailList items={[
          { label: "Placed", value: formatDateTime(o.placedAt) }, { label: "Currency", value: o.currency },
          { label: "Store", value: ctx.can("stores.view") ? <EntityLink href={`/stores/${o.store.id}`}>{o.store.name}</EntityLink> : o.store.name },
          { label: "Seller", value: ctx.can("sellers.view") ? <EntityLink href={`/sellers/${o.store.seller.id}`}>{o.store.seller.name}</EntityLink> : o.store.seller.name },
          { label: "Customer", value: ctx.can("customers.view") ? <EntityLink href={`/customers/${o.customer.id}`}>{o.customer.name}</EntityLink> : o.customer.name }, { label: "Customer email", value: o.customer.email },
        ]} /></CardBody></Card>
        <Card><CardHeader title="Totals" /><CardBody>
          <dl className="space-y-2 text-sm">
            {[["Subtotal", o.subtotal], ["Shipping", o.shipping], ["Tax", o.tax]].map(([k, v]) => <div key={String(k)} className="flex justify-between"><dt className="text-slate-500">{String(k)}</dt><dd className="tabular-nums">{formatMoney(v as never)}</dd></div>)}
            <div className="flex justify-between border-t border-slate-100 pt-2 font-semibold"><dt>Total</dt><dd className="tabular-nums">{formatMoney(o.amount)}</dd></div>
          </dl>
        </CardBody></Card>
        <Card className="lg:col-span-3"><CardHeader title="Items" />
          <MiniTable head={["Item", "SKU", "Qty", "Unit price", "Line total"]}>
            {o.items.map((i) => <tr key={i.id}><Td>{i.name}</Td><Td><Mono>{i.sku ?? "—"}</Mono></Td><Td>{i.quantity}</Td><Td>{formatMoney(i.unitPrice)}</Td><Td>{formatMoney(Number(i.unitPrice) * i.quantity)}</Td></tr>)}
          </MiniTable>
        </Card>
        {ctx.can("payments.view") && (
          <Card className="lg:col-span-3"><CardHeader title="Transactions" description="Gateway references only — no card or credential data is stored." />
            <MiniTable head={["Payment", "Method", "Gateway", "Reference", "Amount", "Status", "Date"]}>
              {o.payments.length === 0 ? <tr><Td className="text-slate-400">No payment attempts</Td><Td>{""}</Td><Td>{""}</Td><Td>{""}</Td><Td>{""}</Td><Td>{""}</Td><Td>{""}</Td></tr> :
                o.payments.map((p) => <tr key={p.id}><Td><Mono>{p.code}</Mono></Td><Td>{humanize(p.method)}</Td><Td>{p.gateway ?? "—"}</Td><Td><Mono>{p.transactionRef ?? "—"}</Mono></Td><Td>{formatMoney(p.amount)}</Td><Td><StatusBadge status={p.status} /></Td><Td>{formatDateTime(p.createdAt)}</Td></tr>)}
            </MiniTable>
          </Card>
        )}
      </div>
    </>
  );
}
