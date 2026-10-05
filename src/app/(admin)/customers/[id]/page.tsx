import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requirePermission } from "@/server/rbac/context";
import { getCustomerDetail } from "@/server/customers/queries";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { DetailList } from "@/components/data/detail-list";
import { EmptyState } from "@/components/ui/states";
import { EntityLink, MiniTable, Stat, Td } from "@/features/shared/ui";
import { formatDate, formatDateTime, formatMoney } from "@/lib/format";

export const metadata = { title: "Customer" };

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const ctx = await requirePermission("customers.view");
  const { id } = await params;
  const d = await getCustomerDetail(id);
  if (!d) notFound();
  const { customer: c, orders, paid } = d;
  return (
    <>
      <Link href="/customers" className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"><ArrowLeft className="h-4 w-4" />All customers</Link>
      <div className="mb-6 flex flex-wrap items-center gap-3"><h1 className="text-xl font-semibold text-slate-900">{c.name}</h1><StatusBadge status={c.status} /></div>
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <Stat label="Orders" value={orders.length} /><Stat label="Total spending" value={formatMoney(paid._sum.amount)} hint={`${paid._count} paid orders`} /><Stat label="Customer since" value={formatDate(c.createdAt)} />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card><CardHeader title="Profile" /><CardBody><DetailList columns={1} items={[
          { label: "Email", value: c.email }, { label: "Phone", value: c.phone },
          { label: "Store", value: ctx.can("stores.view") ? <EntityLink href={`/stores/${c.store.id}`}>{c.store.name}</EntityLink> : c.store.name },
          { label: "Seller", value: c.store.seller.name },
        ]} /></CardBody></Card>
        <Card className="lg:col-span-2"><CardHeader title="Order history" />
          {orders.length === 0 ? <EmptyState title="No orders" /> : ctx.can("orders.view") ? (
            <MiniTable head={["Order", "Amount", "Payment", "Status", "Date"]}>
              {orders.map((o) => <tr key={o.id}><Td><EntityLink href={`/orders/${o.id}`}>{o.number}</EntityLink></Td><Td>{formatMoney(o.amount)}</Td><Td><StatusBadge status={o.paymentStatus} /></Td><Td><StatusBadge status={o.status} /></Td><Td>{formatDateTime(o.placedAt)}</Td></tr>)}
            </MiniTable>
          ) : <EmptyState title="Order details restricted" description="Your role can't view orders." />}
        </Card>
      </div>
    </>
  );
}
