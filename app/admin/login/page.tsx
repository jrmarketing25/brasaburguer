"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Lock, Mail, Eye, EyeOff, Loader2, ArrowLeft, ShieldAlert } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAdminAuth } from "@/lib/supabase/auth-context";

export default function AdminLoginPage() {
  const router = useRouter();
  const { user, membership, isLoading: isAuthLoading } = useAdminAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Se já autenticado e com permissão, redirecionar diretamente para /admin
  useEffect(() => {
    if (!isAuthLoading && user && membership) {
      router.replace("/admin");
    }
  }, [user, membership, isAuthLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage("Por favor, preencha o e-mail e a senha.");
      return;
    }

    const client = getSupabaseBrowserClient();
    if (!client) {
      setErrorMessage("Erro: Cliente Supabase não configurado no ambiente local.");
      return;
    }

    try {
      setIsSubmitting(true);
      const { data, error } = await client.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setErrorMessage("E-mail ou senha incorretos.");
        } else {
          setErrorMessage(`Falha na autenticação: ${error.message}`);
        }
        setIsSubmitting(false);
        return;
      }

      if (data.user) {
        // Validação de vínculo na loja
        const storeId = process.env.NEXT_PUBLIC_STORE_ID || "a0000000-0000-0000-0000-000000000001";
        const { data: memberData, error: memberError } = await client
          .from("store_members")
          .select("id, role")
          .eq("store_id", storeId)
          .eq("user_id", data.user.id)
          .maybeSingle();

        if (memberError || !memberData) {
          await client.auth.signOut();
          setErrorMessage(
            "Acesso negado: Este usuário não está vinculado à equipe da BRASA BURGERS."
          );
          setIsSubmitting(false);
          return;
        }

        // Sucesso
        router.replace("/admin");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Ocorreu um erro inesperado ao autenticar.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center p-4 selection:bg-[#FF6A00] selection:text-black">
      <div className="w-full max-w-md">
        {/* Card de Login */}
        <div className="rounded-2xl border border-zinc-800 bg-[#141414] p-8 shadow-2xl relative overflow-hidden">
          {/* Barra de destaque superior */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF6A00] to-[#E6391F]" />

          {/* Cabeçalho */}
          <div className="text-center space-y-3 mb-8">
            <div className="flex justify-center mb-2">
              <div className="relative w-40 h-12">
                <Image
                  src="/images/brand/logo-brasa-vetorial.svg"
                  alt="BRASA BURGERS"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-400">
              <Lock className="w-3 h-3 text-[#FF6A00]" />
              <span>Painel Administrativo White Label</span>
            </div>
            <p className="text-xs text-zinc-400">
              Autenticação de equipe para gestão do catálogo, pedidos e configurações.
            </p>
          </div>

          {/* Feedback de Erro */}
          {errorMessage && (
            <div className="mb-6 rounded-lg bg-red-950/40 border border-red-800/60 p-3.5 text-xs text-red-200 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                E-mail do Administrador
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@brasaburgers.com.br"
                  required
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#0C0C0C] border border-zinc-800 text-sm text-[#F3E3C7] placeholder-zinc-600 focus:outline-none focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00] transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Senha de Acesso
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-[#0C0C0C] border border-zinc-800 text-sm text-[#F3E3C7] placeholder-zinc-600 focus:outline-none focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-2.5 px-4 rounded-lg bg-[#FF6A00] hover:bg-[#e05d00] text-black font-semibold text-sm flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-[#FF6A00]/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Autenticando...</span>
                </>
              ) : (
                <span>Entrar no Painel</span>
              )}
            </button>
          </form>

          {/* Rodapé do Card */}
          <div className="mt-8 pt-6 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-[#F3E3C7] transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar ao Cardápio</span>
            </Link>

            <span className="text-[11px] text-zinc-600 font-mono">v1.0 Local</span>
          </div>
        </div>

        {/* Informação para ambiente de desenvolvimento */}
        <p className="mt-4 text-center text-xs text-zinc-600">
          Para criar ou redefinir a credencial local, utilize:{" "}
          <code className="text-zinc-400 font-mono">npm run create-admin</code>
        </p>
      </div>
    </div>
  );
}

