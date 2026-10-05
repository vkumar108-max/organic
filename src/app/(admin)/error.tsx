"use client";

import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/states";
import { Button } from "@/components/ui/button";

export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Card>
      <ErrorState title="We couldn't load this page" description="An unexpected error occurred. Nothing was changed. Try again, and contact engineering if it persists." action={<Button onClick={reset}>Try again</Button>} />
    </Card>
  );
}
