import Image from "next/image";
import Link from "next/link";
import { ProductArt } from "@/components/ui/ProductArt";
import { formatDate } from "@/lib/format";
import type { BlogPost } from "@/types";

export function BlogCard({ post, priority = false }: { post: BlogPost; priority?: boolean }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-card border border-line bg-white transition hover:shadow-lift">
      <div className="relative aspect-[16/10] overflow-hidden">
        {post.image ? (
          <Image src={post.image} alt="" fill sizes="(min-width:1024px) 30vw, 92vw" priority={priority} className="object-cover" />
        ) : (
          <ProductArt tone={post.tone} label="" className="h-full w-full transition duration-500 group-hover:scale-105" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-clay-500">{post.category}</p>
        <h3 className="text-lg font-semibold leading-snug">
          <Link href={`/blog/${post.slug}`} className="hover:text-brand-700">{post.title}</Link>
        </h3>
        <p className="line-clamp-3 text-sm text-ink-soft">{post.excerpt}</p>
        <div className="mt-auto flex items-center justify-between pt-3 text-sm">
          <time dateTime={post.publishedAt} className="text-ink-soft">{formatDate(post.publishedAt)}</time>
          <Link href={`/blog/${post.slug}`} className="font-semibold text-brand-700 hover:underline" aria-label={`Read more: ${post.title}`}>Read More →</Link>
        </div>
      </div>
    </article>
  );
}
