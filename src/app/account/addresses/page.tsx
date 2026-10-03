"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { FormField } from "@/components/ui/FormField";
import { indianStates } from "@/lib/states";
import { addressSchema, fieldErrors } from "@/lib/validation";
import { useAddresses } from "@/store/addresses";

export default function AddressesPage() {
  const { addresses, add, remove } = useAddresses();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [adding, setAdding] = useState(false);

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const raw = Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>;
    const parsed = addressSchema.safeParse({ ...raw, line2: raw.line2 || undefined });
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    add(parsed.data);
    setErrors({});
    setAdding(false);
  };

  return (
    <section aria-labelledby="addr-title">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 id="addr-title" className="text-2xl font-semibold">Saved Addresses</h2>
        {!adding && <Button size="sm" onClick={() => setAdding(true)}>Add address</Button>}
      </div>
      <p className="mb-4 text-sm text-clay-600">Saved on this device only until the account backend is connected.</p>
      {adding && (
        <form onSubmit={submit} noValidate className="mb-6 grid gap-4 rounded-card border border-line p-5 sm:grid-cols-2">
          <FormField label="Full name" name="fullName" required error={errors.fullName} />
          <FormField label="Mobile number" name="mobile" inputMode="numeric" maxLength={10} required error={errors.mobile} />
          <div className="sm:col-span-2"><FormField label="Email" name="email" type="email" required error={errors.email} /></div>
          <div className="sm:col-span-2"><FormField label="Address" name="line1" required error={errors.line1} /></div>
          <FormField label="City" name="city" required error={errors.city} />
          <div>
            <label htmlFor="addr-state" className="mb-1.5 block text-sm font-medium">State</label>
            <select id="addr-state" name="state" defaultValue="" className="w-full rounded-lg border border-line bg-white px-4 py-3"><option value="" disabled>Select state</option>{indianStates.map((state) => <option key={state}>{state}</option>)}</select>
            {errors.state && <p className="mt-1 text-sm text-danger">{errors.state}</p>}
          </div>
          <FormField label="PIN code" name="pincode" inputMode="numeric" maxLength={6} required error={errors.pincode} />
          <div className="flex items-end gap-2 sm:col-span-2"><Button type="submit">Save address</Button><Button type="button" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button></div>
        </form>
      )}
      {addresses.length === 0 && !adding ? (
        <EmptyState icon="pin" title="No saved addresses" description="Add an address to speed up checkout." />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <li key={address.id} className="rounded-card border border-line p-4 text-sm">
              <p className="font-semibold">{address.fullName}</p>
              <p className="text-ink-soft">{address.line1}, {address.city}, {address.state} {address.pincode}</p>
              <p className="text-ink-soft">{address.mobile} · {address.email}</p>
              <button type="button" onClick={() => remove(address.id)} className="mt-3 font-semibold text-danger hover:underline">Remove</button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
