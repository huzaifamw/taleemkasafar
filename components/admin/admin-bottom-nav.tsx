"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/dashboard/icon";

type NavItem = { href: string; label: string; icon: string };

const ADMIN_NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/users", label: "Users", icon: "group" },
  { href: "/admin/entry-tests", label: "Tests", icon: "school" },
  { href: "/admin/questions", label: "Questions", icon: "quiz" },
  { href: "/admin/blogs", label: "Blogs", icon: "article" },
  { href: "/admin/feedback", label: "Feedback", icon: "forum" },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Bottom navigation bar for mobile admin panel.
 * Matches student dashboard mobile nav design.
 */
export function AdminBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t-2 border-black bg-white md:hidden">
      <div className="flex items-center justify-around">
        {ADMIN_NAV.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={
                active
                  ? "flex flex-1 flex-col items-center gap-1 border-t-4 border-brand bg-brand-fixed py-2 text-brand"
                  : "flex flex-1 flex-col items-center gap-1 border-t-4 border-transparent py-2 text-on-surface-variant transition-colors hover:text-black"
              }
            >
              <Icon name={item.icon} filled={active} className="text-2xl" />
              <span className="text-xs font-bold">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
