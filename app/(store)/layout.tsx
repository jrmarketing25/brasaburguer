import React from "react";
import { StoreHeader } from "@/components/layout/store-header";
import { BottomNav } from "@/components/layout/bottom-nav";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-brasa-bg text-brasa-cream relative pb-20">
      <StoreHeader />
      <main className="flex-1 flex flex-col">{children}</main>
      <footer className="border-t border-brasa-border py-6 text-center text-xs text-brasa-creamMuted">
        <div className="mx-auto max-w-md sm:max-w-2xl px-4">
          <p>© {new Date().getFullYear()} BRASA BURGERS. Todos os direitos reservados.</p>
          <p className="mt-1 text-[11px] text-zinc-500">
            Cardápio Digital & Delivery Artesanal
          </p>
        </div>
      </footer>
      <BottomNav />
    </div>
  );
}
