import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/ui/Icon";
import { ProductArt } from "@/components/ui/ProductArt";
import type { Category } from "@/types";

export function CategoryCard({ category }: { category: Category }) {
  return (
    <article className="group relative overflow-hidden rounded-card border border-line bg-white transition duration-200 hover:-translate-y-0.5 hover:shadow-lift">
      <div className="relative aspect-[16/10] overflow-hidden">
        {category.image ? (
          <Image src={category.image} alt="" fill sizes="(min-width:1024px) 30vw, (min-width:640px) 45vw, 92vw" className="object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <ProductArt tone={category.tone} label="" className="h-full w-full transition duration-500 group-hover:scale-105" />
        )}
      </div>
      <div className="flex flex-col gap-1.5 p-5">
        <h3 className="text-xl font-semibold">
          <Link href={`/category/${category.slug}`} className="after:absolute after:inset-0 after:content-['']">{category.name}</Link>
        </h3>
        <p className="text-sm text-ink-soft">{category.shortDescription}</p>
        <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-brand-700" aria-hidden="true">
          Explore <Icon name="arrowRight" size={16} className="transition group-hover:translate-x-1" />
        </span>
      </div>
    </article>
  );
}

export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
      {categories.map((category) => <li key={category.id}><CategoryCard category={category} /></li>)}
    </ul>
  );
}
