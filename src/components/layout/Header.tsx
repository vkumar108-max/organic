import { announcements } from "@/config/site";
import { Logo } from "@/components/ui/Logo";
import { repo } from "@/lib/data";
import { AnnouncementBar } from "./AnnouncementBar";
import { HeaderActions } from "./HeaderActions";
import { MegaMenu } from "./MegaMenu";
import { MobileMenu } from "./MobileMenu";
import { SearchBar } from "./SearchBar";

/** Server component: fetches menu data once, hands small props to client islands. */
export async function Header() {
  const [categories, featured] = await Promise.all([repo.listCategories(), repo.listProducts({ featured: true, pageSize: 1 })]);
  return (
    <>
      <AnnouncementBar messages={announcements} />
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
        <div className="container-page flex items-center gap-3 py-2.5 md:gap-6 md:py-4">
          <MobileMenu categories={categories} />
          <div className="mr-auto md:mr-0"><Logo /></div>
          <div className="mx-auto hidden max-w-2xl flex-1 md:block"><SearchBar /></div>
          <HeaderActions />
        </div>
        <MegaMenu categories={categories} featured={featured.items[0] ?? null} />
        <div className="border-b border-line md:hidden" />
      </header>
    </>
  );
}
