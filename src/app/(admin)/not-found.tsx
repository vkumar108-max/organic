import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { LinkButton } from "@/components/ui/button";

export default function NotFound() {
  return <Card><EmptyState title="Record not found" description="It may have been removed, or the link is incorrect." action={<LinkButton href="/" variant="primary">Back to overview</LinkButton>} /></Card>;
}
