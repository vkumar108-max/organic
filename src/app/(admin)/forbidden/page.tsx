import { ShieldAlert } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { LinkButton } from "@/components/ui/button";

export const metadata = { title: "Access denied" };

export default function Forbidden() {
  return (
    <Card>
      <EmptyState icon={<ShieldAlert className="h-6 w-6" />} title="You don't have access to this section" description="Your role doesn't include the permission required. Ask a Super Admin if you need access." action={<LinkButton href="/" variant="primary">Back to overview</LinkButton>} />
    </Card>
  );
}
