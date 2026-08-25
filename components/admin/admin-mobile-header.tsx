"use client";

import { Icon } from "@/components/dashboard/icon";
import { useState } from "react";

/**
 * Mobile header for admin panel with menu and logout.
 * Shows on mobile devices only.
 */
export function AdminMobileHeader({ adminUsername }: { adminUsername: string }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 border-b-2 border-black bg-white md:hidden">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="font-headline text-lg font-bold text-black">Admin Panel</h1>
            <p className="text-xs text-on-surface-variant">{adminUsername}</p>
          </div>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="border-2 border-black bg-white p-2 transition-all hover:bg-brand-fixed"
            aria-label="Menu"
          >
            <Icon name={showMenu ? "close" : "menu"} className="text-xl" />
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {showMenu && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={() => setShowMenu(false)}
        >
          <div
            className="absolute right-0 top-0 h-full w-64 border-l-2 border-black bg-white p-4 shadow-hard"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="font-headline text-lg font-bold text-black">Menu</h2>
                <p className="text-xs text-on-surface-variant">{adminUsername}</p>
              </div>
              <button
                onClick={() => setShowMenu(false)}
                className="border-2 border-black bg-white p-2"
              >
                <Icon name="close" />
              </button>
            </div>

            <div className="space-y-2">
              <form action="/admin-auth/logout" method="post">
                <button
                  type="submit"
                  className="flex w-full items-center gap-3 border-2 border-black bg-white p-3 font-headline font-bold text-danger transition-all hover:bg-danger hover:text-white"
                >
                  <Icon name="logout" />
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
