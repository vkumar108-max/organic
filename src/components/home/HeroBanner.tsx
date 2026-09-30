import { Button } from "@/components/ui/Button";
import { ProductArt } from "@/components/ui/ProductArt";
import { site } from "@/config/site";

/** Hero copy is intentionally free of health claims. */
export function HeroBanner() {
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-sand-50">
      <div className="container-page grid items-center gap-8 py-10 md:py-16 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:py-20">
        <div className="animate-fade-up">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-brand-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-brand-800">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-600" /> {site.name}
          </p>
          <h1 id="hero-title" className="text-[2.2rem] font-semibold leading-[1.1] sm:text-5xl lg:text-6xl">
            Natural Goodness, <span className="text-brand-600">Made Simple</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg text-ink-soft">
            Discover quality fruit, leaf and vegetable products for everyday living.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button href="/shop" size="lg">Shop Now</Button>
            <Button href="/categories" size="lg" variant="outline">Explore Categories</Button>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-soft">
            <li>✓ Simple ingredients lists</li>
            <li>✓ Multiple pack sizes</li>
            <li>✓ Secure checkout</li>
          </ul>
        </div>
        <div className="relative mx-auto w-full max-w-md lg:max-w-none" aria-hidden="true">
          <div className="absolute -inset-4 rounded-[2.5rem] bg-brand-100/60 blur-2xl" />
          <div className="relative grid grid-cols-6 grid-rows-6 gap-3">
            <div className="col-span-4 row-span-6 overflow-hidden rounded-3xl shadow-lift"><ProductArt tone="leaf" variant={0} className="aspect-[4/5] h-full w-full" /></div>
            <div className="col-span-2 row-span-3 overflow-hidden rounded-2xl shadow-card"><ProductArt tone="fruit" variant={1} className="h-full w-full" /></div>
            <div className="col-span-2 row-span-3 overflow-hidden rounded-2xl shadow-card"><ProductArt tone="vegetable" variant={3} className="h-full w-full" /></div>
          </div>
        </div>
      </div>
    </section>
  );
}
