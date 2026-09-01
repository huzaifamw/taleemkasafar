"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/dashboard/icon";

type NavItem = { href: string; label: string; icon: string };

const ADMIN_NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/users", label: "Users", icon: "group" },
  { href: "/admin/entry-tests", label: "Entry Tests", icon: "school" },
  { href: "/admin/questions", label: "Questions", icon: "quiz" },
  { href: "/admin/blogs", label: "Blogs", icon: "article" },
  { href: "/admin/feedback", label: "Feedback", icon: "forum" },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Fixed left sidebar for admin panel matching student dashboard design. */
export function AdminSidebar({ adminUsername }: { adminUsername: string }) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col gap-4 border-r-2 border-black bg-white p-4 md:flex">
      <div className="mb-6 flex flex-col gap-1">
        <span className="font-headline text-xl font-bold tracking-tighter text-black">
          Admin Panel
        </span>
        <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">
          Taleem ka Safar
        </span>
      </div>

      <nav className="flex flex-grow flex-col gap-2">
        {ADMIN_NAV.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={
                active
                  ? "flex items-center gap-3 border-2 border-black bg-brand p-3 font-headline font-bold text-white shadow-hard-sm"
                  : "flex items-center gap-3 border-2 border-black bg-white p-3 font-headline font-bold text-black transition-all hover:translate-x-1 hover:shadow-hard-sm"
              }
            >
              <Icon name={item.icon} filled={active} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-2 border-t-2 border-black pt-4">
        <div className="px-3 py-2">
          <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            Logged in as
          </p>
          <p className="font-headline text-sm font-bold text-black">
            {adminUsername}
          </p>
        </div>
        <form action="/admin-auth/logout" method="post">
          <button
            type="submit"
            className="flex w-full items-center gap-3 border-2 border-black bg-white p-3 text-left font-headline font-bold text-danger transition-all hover:translate-x-1 hover:bg-danger hover:text-white hover:shadow-hard-sm"
          >
            <Icon name="logout" />
            Logout
          </button>
        </form>
      </div>
    </aside>
  );
}
