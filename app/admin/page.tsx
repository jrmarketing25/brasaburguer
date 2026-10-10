import React from "react";
import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full rounded-2xl border border-brasa-border bg-brasa-surface p-8 text-center shadow-card space-y-6">
        <div className="mx-auto w-12 h-12 rounded-full bg-brasa-orange/10 border border-brasa-orange/30 flex items-center justify-center text-brasa-orange">
          <Lock className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h1 className="font-bebas text-3xl tracking-wide text-brasa-cream uppercase">
            Painel Administrativo
          </h1>
          <p className="text-sm text-zinc-400">
            Módulo reservado para a Etapa 07 (gestão de produtos, pedidos, horários e configurações white label).
          </p>
        </div>
        <Link href="/">
          <Button variant="outline" className="w-full gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar para o Cardápio
          </Button>
        </Link>
      </div>
    </div>
  );
}

