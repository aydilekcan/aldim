"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderClosed,
  RotateCcw,
  Settings,
  Plus,
  ArrowLeft,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { cn } from "@/lib/utils";
import { LEGAL_DISCLAIMER } from "@/lib/templates";

const NAV = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/app/products", label: "Ürünler", icon: Package },
  { href: "/app/documents", label: "Belgeler", icon: FolderClosed },
  { href: "/app/returns", label: "İadeler", icon: RotateCcw },
  { href: "/app/settings", label: "Ayarlar", icon: Settings },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function DesktopSidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:w-64 border-r border-ink-200 bg-white">
      <div className="px-5 h-16 flex items-center">
        <BrandLogo href="/app" />
      </div>
      <nav className="flex-1 px-3 py-2 space-y-1">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-brand-50 text-brand-800"
                  : "text-ink-600 hover:bg-ink-50 hover:text-ink-900",
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4">
        <Link
          href="/app/products/new"
          className="flex items-center justify-center gap-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white h-11 text-sm font-medium shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Yeni ürün ekle
        </Link>
      </div>
      <div className="p-4 text-[11px] leading-relaxed text-ink-400 border-t border-ink-100">
        {LEGAL_DISCLAIMER}
      </div>
    </aside>
  );
}

function MobileTopbar() {
  const pathname = usePathname();
  const isDashboard = pathname === "/app";
  return (
    <header className="md:hidden sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-ink-100">
      <div className="h-14 px-4 flex items-center justify-between">
        {isDashboard ? (
          <BrandLogo href="/app" />
        ) : (
          <Link
            href="/app"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-700 -ml-1 px-2 py-1.5 rounded-lg"
          >
            <ArrowLeft className="h-4 w-4" />
            Geri
          </Link>
        )}
        <Link
          href="/app/products/new"
          aria-label="Ürün ekle"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-700 text-white shadow-sm active:bg-brand-800"
        >
          <Plus className="h-5 w-5" />
        </Link>
      </div>
    </header>
  );
}

function MobileBottomNav() {
  const pathname = usePathname();
  const items = [
    { href: "/app", label: "Ana sayfa", icon: LayoutDashboard, exact: true },
    { href: "/app/products", label: "Ürünler", icon: Package },
    { href: "/app/products/new", label: "Ekle", icon: Plus, primary: true },
    { href: "/app/documents", label: "Belgeler", icon: FolderClosed },
    { href: "/app/settings", label: "Ayarlar", icon: Settings },
  ];
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-ink-100 safe-bottom">
      <ul className="grid grid-cols-5 h-14">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href, item.exact);
          if (item.primary) {
            return (
              <li key={item.href} className="flex justify-center">
                <Link
                  href={item.href}
                  aria-label={item.label}
                  className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-brand-700 text-white shadow-pop active:bg-brand-800 ring-4 ring-white"
                >
                  <Icon className="h-6 w-6" />
                </Link>
              </li>
            );
          }
          return (
            <li key={item.href} className="flex">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition",
                  active ? "text-brand-700" : "text-ink-500 active:text-ink-700",
                )}
              >
                <Icon className={cn("h-5 w-5", active && "stroke-[2.4]")} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ink-50">
      <DesktopSidebar />
      <div className="md:pl-64">
        <MobileTopbar />
        <main className="with-bottom-nav max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
          {children}
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
