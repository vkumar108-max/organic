"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { formatPrice } from "@/lib/format";
import { useUi } from "@/store/ui";

interface Suggestions {
  products: { name: string; slug: string; category: string; price: number }[];
  categories: { name: string; slug: string }[];
}

interface Option { key: string; label: string; hint?: string; href: string; icon: "search" | "clock" | "leaf" | "tag" }

/**
 * Search combobox (ARIA 1.2 pattern): suggestions, recent searches, clear button.
 * Suggestions come from GET /api/search/suggest — the same endpoint the mobile app can use.
 */
export function SearchBar({ variant = "header", onDone }: { variant?: "header" | "overlay"; onDone?: () => void }) {
  const router = useRouter();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestions | null>(null);
  const [active, setActive] = useState(-1);
  const recent = useUi((state) => state.recentSearches);
  const addRecent = useUi((state) => state.addRecentSearch);
  const clearRecent = useUi((state) => state.clearRecentSearches);

  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) {
      setSuggestions(null);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch(`/api/search/suggest?q=${encodeURIComponent(term)}`, { signal: controller.signal })
        .then((response) => (response.ok ? response.json() : null))
        .then((data: Suggestions | null) => setSuggestions(data))
        .catch(() => undefined);
    }, 180);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const term = query.trim();
  const options: Option[] = term.length >= 2
    ? [
        ...(suggestions?.categories ?? []).map((category) => ({ key: `c-${category.slug}`, label: category.name, hint: "Category", href: `/category/${category.slug}`, icon: "tag" as const })),
        ...(suggestions?.products ?? []).map((product) => ({ key: `p-${product.slug}`, label: product.name, hint: formatPrice(product.price), href: `/product/${product.slug}`, icon: "leaf" as const })),
      ]
    : recent.map((item) => ({ key: `r-${item}`, label: item, href: `/search?q=${encodeURIComponent(item)}`, icon: "clock" as const }));

  const go = (href: string, saved?: string) => {
    if (saved) addRecent(saved);
    setFocused(false);
    setActive(-1);
    onDone?.();
    router.push(href);
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (active >= 0 && options[active]) return go(options[active].href, options[active].icon === "clock" ? options[active].label : undefined);
    if (term) go(`/search?q=${encodeURIComponent(term)}`, term);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") { event.preventDefault(); setActive((value) => Math.min(options.length - 1, value + 1)); }
    if (event.key === "ArrowUp") { event.preventDefault(); setActive((value) => Math.max(-1, value - 1)); }
    if (event.key === "Escape") { setFocused(false); inputRef.current?.blur(); }
  };

  const open = focused && (options.length > 0 || (term.length >= 2 && suggestions !== null));
  const noResults = term.length >= 2 && suggestions !== null && options.length === 0;

  return (
    <div className="relative w-full" onBlur={(event) => !event.currentTarget.contains(event.relatedTarget) && setFocused(false)}>
      <form role="search" onSubmit={submit} className="relative">
        <label htmlFor={`${listId}-input`} className="sr-only">Search products</label>
        <Icon name="search" size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft" />
        <input
          id={`${listId}-input`}
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          autoComplete="off"
          enterKeyHint="search"
          placeholder="Search for products, categories…"
          value={query}
          onChange={(event) => { setQuery(event.target.value); setActive(-1); }}
          onFocus={() => setFocused(true)}
          onKeyDown={onKeyDown}
          className={`w-full rounded-full border border-line bg-brand-50/60 py-3 pl-12 pr-24 text-[0.95rem] placeholder:text-ink-soft/70 focus:border-brand-500 focus:bg-white [&::-webkit-search-cancel-button]:hidden ${variant === "overlay" ? "text-base" : ""}`}
        />
        {query && (
          <button type="button" onClick={() => { setQuery(""); setSuggestions(null); inputRef.current?.focus(); }} aria-label="Clear search" className="absolute right-14 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-ink-soft hover:bg-brand-100">
            <Icon name="close" size={16} />
          </button>
        )}
        <button type="submit" aria-label="Search" className="absolute right-1.5 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-brand-600 text-white hover:bg-brand-700">
          <Icon name="search" size={18} />
        </button>
      </form>

      {(open || (focused && noResults)) && (
        <div className={`z-50 mt-2 overflow-hidden rounded-2xl border border-line bg-white shadow-lift ${variant === "header" ? "absolute inset-x-0" : ""}`}>
          {options.length > 0 ? (
            <>
              {term.length < 2 && (
                <div className="flex items-center justify-between px-4 pt-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  Recent searches
                  <button type="button" onClick={clearRecent} className="normal-case text-brand-700 hover:underline">Clear all</button>
                </div>
              )}
              <ul id={listId} role="listbox" aria-label="Search suggestions" className="max-h-80 overflow-y-auto py-2">
                {options.map((option, index) => (
                  <li key={option.key} id={`${listId}-${index}`} role="option" aria-selected={index === active}>
                    <button
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => go(option.href, option.icon === "clock" ? option.label : term)}
                      className={`flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-brand-50 ${index === active ? "bg-brand-50" : ""}`}
                    >
                      <Icon name={option.icon} size={16} className="text-ink-soft" />
                      <span className="flex-1 truncate">{option.label}</span>
                      {option.hint && <span className="text-sm text-ink-soft">{option.hint}</span>}
                    </button>
                  </li>
                ))}
              </ul>
              {term.length >= 2 && (
                <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => go(`/search?q=${encodeURIComponent(term)}`, term)} className="w-full border-t border-line px-4 py-3 text-left text-sm font-semibold text-brand-700 hover:bg-brand-50">
                  See all results for “{term}”
                </button>
              )}
            </>
          ) : (
            <p id={listId} role="status" className="px-4 py-5 text-center text-sm text-ink-soft">
              No matches for “{term}”. Try a different word, or <a className="font-semibold text-brand-700 underline" href="/shop">browse all products</a>.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
