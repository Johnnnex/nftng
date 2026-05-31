"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Icon } from "@iconify/react";
import { cn, hasPermission } from "@/lib";
import { poppins, satoshi } from "@/app/layout";
import { ADMIN_NAV_ITEMS, ADMIN_SUPER_NAV_ITEMS } from "@/data";
import type { AdminNavItem } from "@/data";
import { NavSkeleton } from "@/components";
import { useAuthStore } from "@/store";

const ROUTE_TITLES: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/products": "Products",
  "/admin/products/new": "New Product",
  "/admin/products/config": "Sales Configuration",
  "/admin/orders": "Orders",
  "/admin/logistics/items": "Items Queue",
  "/admin/logistics/trips": "Trips",
  "/admin/logistics/international": "International Orders",
  "/admin/logistics/config": "Geo Configuration",
  "/admin/logistics": "Logistics",
  "/admin/registrations": "Registrations",
  "/admin/team": "Admins",
  "/admin/team/roles": "Role Templates",
};

// ── Nav item with optional accordion children ────────────

type NavItemProps = {
  item: AdminNavItem;
  collapsed: boolean;
  pathname: string;
};

function NavItem({ item, collapsed, pathname }: NavItemProps) {
  const hasChildren = !!item.children?.length;
  const isChildActive = item.children?.some((c) => pathname === c.href) ?? false;
  const isActive = pathname === item.href && !hasChildren;
  const [open, setOpen] = useState(isChildActive);

  useEffect(() => {
    if (isChildActive) setOpen(true);
  }, [isChildActive]);

  if (hasChildren) {
    // When sidebar is collapsed, children can't be shown — navigate to the item's base href directly.
    if (collapsed) {
      return (
        <Link
          href={item.href}
          title={item.label}
          className={cn(
            "flex items-center justify-center py-2.5 rounded-lg transition-colors",
            isChildActive ? "bg-[#6EC93E]/15 text-[#6EC93E]" : "text-[#6B7280] hover:text-[#D1D5DB] hover:bg-[#161B22]",
          )}
        >
          <Icon icon={item.icon} className="w-5 h-5 shrink-0" />
        </Link>
      );
    }

    return (
      <div>
        <button
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
            isChildActive ? "text-[#6EC93E]" : "text-[#6B7280] hover:text-[#D1D5DB] hover:bg-[#161B22]",
          )}
        >
          <Icon icon={item.icon} className="w-5 h-5 shrink-0" />
          <span className={cn(satoshi.className, "text-[0.875rem] font-medium whitespace-nowrap flex-1 text-left")}>
            {item.label}
          </span>
          <Icon
            icon="solar:alt-arrow-down-bold"
            className={cn("w-3.5 h-3.5 shrink-0 transition-transform duration-200", open && "rotate-180")}
          />
        </button>

        {open && (
          <div className="mt-0.5 ml-4 flex flex-col gap-0.5 border-l border-[#1f2937] pl-3">
            {item.children!.map((child) => (
              <Link
                key={child.label + child.href}
                href={child.href}
                className={cn(
                  satoshi.className,
                  "text-[0.8125rem] py-1.5 px-2 rounded-md transition-colors whitespace-nowrap",
                  pathname === child.href
                    ? "text-[#6EC93E] font-medium"
                    : "text-[#6B7280] hover:text-[#D1D5DB] hover:bg-[#161B22]",
                )}
              >
                {child.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
        isActive ? "bg-[#6EC93E]/15 text-[#6EC93E]" : "text-[#6B7280] hover:text-[#D1D5DB] hover:bg-[#161B22]",
        collapsed && "justify-center px-0",
      )}
    >
      <Icon icon={item.icon} className="w-5 h-5 shrink-0" />
      {!collapsed && <span className={cn(satoshi.className, "text-[0.875rem] font-medium whitespace-nowrap")}>{item.label}</span>}
    </Link>
  );
}

// ─────────────────────────────────────────────────────────

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const { admin, hydrated, logout, clearAuth } = useAuthStore();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = useCallback(async () => {
    setLoggingOut(true);
    try {
      await logout();
    } catch {
      clearAuth();
    } finally {
      router.push("/admin/login");
    }
  }, [logout, clearAuth, router]);

  const pageTitle =
    ROUTE_TITLES[pathname] ??
    (pathname.endsWith("/edit") ? "Edit Product" : "Admin");

  const visibleNav = ADMIN_NAV_ITEMS.filter(
    (item) => !item.module || hasPermission(admin?.permissions ?? {}, admin?.isSuper ?? false, item.module, "read"),
  );
  const visibleSuperNav = ADMIN_SUPER_NAV_ITEMS.filter(
    (item) => !item.module || hasPermission(admin?.permissions ?? {}, admin?.isSuper ?? false, item.module, "read"),
  );

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside
        className={cn(
          "flex flex-col shrink-0 bg-[#0D1117] border-r border-[#161B22] transition-[width] duration-300 ease-in-out overflow-hidden h-screen sticky top-0",
          collapsed ? "w-[4.5rem]" : "w-60",
        )}
      >
        {/* Logo */}
        <div className={cn("flex items-center gap-2.5 px-4 py-5 border-b border-[#161B22]", collapsed && "justify-center px-0")}>
          <div className="w-8 h-8 rounded-lg bg-[#6EC93E] flex items-center justify-center shrink-0">
            <Icon icon="solar:shield-bold-duotone" className="w-[1.1rem] h-[1.1rem] text-white" />
          </div>
          {!collapsed && (
            <span className={cn(poppins.className, "text-white font-semibold text-[0.9375rem] tracking-tight whitespace-nowrap")}>
              NFTNG <span className="text-[#6EC93E]">Admin</span>
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex flex-col flex-1 overflow-y-auto p-2 gap-0.5">
          {!hydrated ? (
            <NavSkeleton collapsed={collapsed} />
          ) : (
            <>
              {visibleNav.map((item) => (
                <NavItem key={item.href} item={item} collapsed={collapsed} pathname={pathname} />
              ))}

              {visibleSuperNav.length > 0 && (
                <div className={cn("mt-auto pt-2 border-t border-[#161B22]", collapsed ? "mx-0" : "mx-1")}>
                  {visibleSuperNav.map((item) => (
                    <NavItem key={item.href} item={item} collapsed={collapsed} pathname={pathname} />
                  ))}
                </div>
              )}
            </>
          )}
        </nav>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className={cn(
            "flex items-center gap-2 px-4 py-3.5 border-t border-[#161B22] text-[#4B5563] hover:text-[#9CA3AF] transition-colors",
            collapsed && "justify-center px-0",
          )}
        >
          <Icon icon={collapsed ? "solar:alt-arrow-right-bold" : "solar:alt-arrow-left-bold"} className="w-4 h-4 shrink-0" />
          {!collapsed && <span className={cn(satoshi.className, "text-[0.8125rem]")}>Collapse</span>}
        </button>
      </aside>

      {/* ── Main ─────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Top bar */}
        <header className="h-[3.75rem] shrink-0 bg-white border-b border-[#E5E7EB] flex items-center px-6 gap-3">
          <h1 className={cn(poppins.className, "text-[1rem] font-semibold text-[#111827] flex-1")}>{pageTitle}</h1>

          {!hydrated ? (
            /* Skeleton for the right side while auth store hydrates */
            <div className="flex items-center gap-2 animate-pulse">
              <div className="w-9 h-9 rounded-lg bg-[#F3F4F6]" />
              <div className="w-px h-5 bg-[#E5E7EB]" />
              <div className="flex items-center gap-2 px-2 py-1">
                <div className="w-7 h-7 rounded-full bg-[#F3F4F6]" />
                <div className="h-3.5 w-24 rounded-full bg-[#F3F4F6]" />
                <div className="h-3 w-3 rounded-full bg-[#F3F4F6]" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {/* Notifications */}
              <div ref={notifRef} className="relative">
                <button
                  onClick={() => { setShowNotif((v) => !v); setShowProfile(false); }}
                  className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#F3F4F6] transition-colors text-[#6B7280]"
                >
                  <Icon icon="solar:bell-bold-duotone" className="w-5 h-5" />
                </button>
                {showNotif && (
                  <div className="absolute right-0 top-11 z-50 w-80 bg-white rounded-xl border border-[#E5E7EB] shadow-lg overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[#F3F4F6]">
                      <p className={cn(poppins.className, "text-[0.875rem] font-semibold text-[#111827]")}>Notifications</p>
                      <span className={cn(satoshi.className, "text-[0.75rem] text-[#9CA3AF] cursor-pointer hover:text-[#6B7280]")}>Mark all read</span>
                    </div>
                    <div className="flex flex-col items-center justify-center py-10 gap-2">
                      <Icon icon="solar:bell-off-bold-duotone" className="w-8 h-8 text-[#D1D5DB]" />
                      <p className={cn(satoshi.className, "text-[0.875rem] text-[#9CA3AF]")}>No notifications yet</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="w-px h-5 bg-[#E5E7EB]" />

              {/* Profile */}
              <div ref={profileRef} className="relative">
                <button
                  onClick={() => { setShowProfile((v) => !v); setShowNotif(false); }}
                  className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-[#F3F4F6] transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-[#6EC93E]/15 border border-[#6EC93E]/30 flex items-center justify-center shrink-0">
                    <Icon icon="solar:user-bold-duotone" className="w-4 h-4 text-[#6EC93E]" />
                  </div>
                  <span className={cn(satoshi.className, "text-[0.875rem] font-medium text-[#374151]")}>{admin ? `${admin.firstName} ${admin.lastName}` : "Admin"}</span>
                  <Icon
                    icon="solar:alt-arrow-down-bold"
                    className={cn("w-3.5 h-3.5 text-[#9CA3AF] transition-transform duration-200", showProfile && "rotate-180")}
                  />
                </button>

                {showProfile && (
                  <div className="absolute right-0 top-11 z-50 w-56 bg-white rounded-xl border border-[#E5E7EB] shadow-lg overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#F3F4F6]">
                      <p className={cn(satoshi.className, "text-[0.875rem] font-semibold text-[#111827] truncate")}>{admin ? `${admin.firstName} ${admin.lastName}` : "Admin"}</p>
                      <p className={cn(satoshi.className, "text-[0.75rem] text-[#9CA3AF] truncate mt-0.5")}>{admin?.email ?? ""}</p>
                    </div>
                    <div className="p-1">
                      <button className={cn(satoshi.className, "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[0.875rem] text-[#374151] hover:bg-[#F9FAFB] transition-colors text-left")}>
                        <Icon icon="solar:settings-bold-duotone" className="w-4 h-4 text-[#9CA3AF]" />
                        Settings
                      </button>
                      <button
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className={cn(satoshi.className, "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[0.875rem] text-red-500 hover:bg-red-50 transition-colors text-left disabled:opacity-60")}
                      >
                        {loggingOut
                          ? <Icon icon="svg-spinners:3-dots-fade" className="w-4 h-4" />
                          : <Icon icon="solar:logout-3-bold-duotone" className="w-4 h-4" />
                        }
                        {loggingOut ? "Signing out…" : "Sign out"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
