"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  UtensilsCrossed,
  FolderTree,
  Layers,
  SlidersHorizontal,
  ShoppingBag,
  Truck,
  Settings,
  ExternalLink,
  LogOut,
  Menu,
  X,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { AdminAuthProvider, useAdminAuth } from "@/lib/supabase/auth-context";

const NAV_ITEMS = [
  { href: "/admin", label: "Visão Geral", icon: LayoutDashboard, exact: true },
  { href: "/admin/produtos", label: "Produtos", icon: UtensilsCrossed },
  { href: "/admin/categorias", label: "Categorias", icon: FolderTree },
  { href: "/admin/combos", label: "Combos", icon: Layers },
  { href: "/admin/adicionais", label: "Adicionais", icon: SlidersHorizontal },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingBag },
  { href: "/admin/entregas", label: "Entregas & Taxas", icon: Truck },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
];

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, membership, isLoading, signOut } = useAdminAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLoginPage = pathname === "/admin/login";

  // Redirecionamento seguro para rota de login se não autenticado
  useEffect(() => {
    if (!isLoading && !isLoginPage) {
      if (!user || !membership) {
        router.replace("/admin/login");
      }
    }
  }, [user, membership, isLoading, isLoginPage, router]);

  // Fechar menu mobile ao mudar de rota
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[#FF6A00] animate-spin" />
        <p className="text-xs text-zinc-400 font-medium">Verificando credenciais de acesso...</p>
      </div>
    );
  }

  if (!user || !membership) {
    return null; // O useEffect já está redirecionando para /admin/login
  }

  const handleSignOut = async () => {
    await signOut();
    router.replace("/admin/login");
  };

  return (
    <div className="min-h-screen bg-[#080808] text-[#F3E3C7] flex flex-col md:flex-row selection:bg-[#FF6A00] selection:text-black">
      {/* ============================================================== */}
      {/* SIDEBAR DESKTOP                                                */}
      {/* ============================================================== */}
      <aside className="hidden md:flex md:w-64 bg-[#111111] border-r border-zinc-800/80 flex-col shrink-0 sticky top-0 h-screen z-30">
        {/* Logo & Marca */}
        <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between">
          <Link href="/admin" className="block relative w-36 h-10">
            <Image
              src="/images/brand/logo-brasa-vetorial.svg"
              alt="BRASA BURGERS"
              fill
              className="object-contain object-left"
              priority
            />
          </Link>
          <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] font-mono text-zinc-400 font-semibold uppercase tracking-wider">
            ADMIN
          </span>
        </div>

        {/* Navegação Principal */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-[#FF6A00] text-black font-semibold shadow-md shadow-[#FF6A00]/20"
                    : "text-zinc-400 hover:text-[#F3E3C7] hover:bg-zinc-800/50"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-black" : "text-zinc-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Rodapé da Sidebar */}
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-950/40 space-y-3">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 hover:text-white transition group"
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Ver Cardápio Público</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300" />
          </Link>

          {/* Dados do Usuário & Logout */}
          <div className="flex items-center justify-between pt-1">
            <div className="min-w-0 pr-2">
              <div className="flex items-center gap-1.5 text-xs text-zinc-200 font-medium truncate">
                <ShieldCheck className="w-3.5 h-3.5 text-[#FF6A00] shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wide">
                Função: {membership.role}
              </span>
            </div>

            <button
              onClick={handleSignOut}
              title="Encerrar Sessão"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ============================================================== */}
      {/* HEADER MOBILE & DRAWER                                         */}
      {/* ============================================================== */}
      <div className="md:hidden bg-[#111111] border-b border-zinc-800 sticky top-0 z-40">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 rounded-lg text-zinc-300 hover:bg-zinc-800 transition"
              aria-label="Abrir Menu Administrativo"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link href="/admin" className="relative w-28 h-7">
              <Image
                src="/images/brand/logo-brasa-vetorial.svg"
                alt="BRASA BURGERS"
                fill
                className="object-contain object-left"
              />
            </Link>
          </div>

          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-zinc-800/80 border border-zinc-700/60 text-xs text-zinc-300"
          >
            <span>Cardápio</span>
            <ExternalLink className="w-3 h-3 text-zinc-400" />
          </Link>
        </div>

        {/* Drawer Mobile */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Conteúdo Drawer */}
            <div className="relative w-72 max-w-[80vw] bg-[#111111] border-r border-zinc-800 h-full flex flex-col z-10">
              <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                <span className="font-bebas text-lg tracking-wide text-zinc-200">
                  Painel de Controle
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition ${
                        isActive
                          ? "bg-[#FF6A00] text-black font-semibold"
                          : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-zinc-800 bg-zinc-950/60 space-y-3">
                <div className="text-xs text-zinc-400 truncate">
                  <span className="block font-medium text-zinc-200">{user.email}</span>
                  <span className="text-[10px] text-zinc-500 uppercase">Perfil: {membership.role}</span>
                </div>

                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-red-400 hover:bg-zinc-800 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sair do Painel</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* CONTEÚDO PRINCIPAL                                             */}
      {/* ============================================================== */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminShell>{children}</AdminShell>
    </AdminAuthProvider>
  );
}
