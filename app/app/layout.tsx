import type { Metadata } from "next";
import { AldimStoreProvider } from "@/lib/store";
import { ToastProvider } from "@/lib/toast";
import { AppShell } from "@/components/app-shell";

export const metadata: Metadata = {
  title: "Aldım - Panel",
  description: "Ürünlerini, faturalarını, garanti ve iade süreçlerini yönet.",
};

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <AldimStoreProvider>
        <AppShell>{children}</AppShell>
      </AldimStoreProvider>
    </ToastProvider>
  );
}
