"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Layers,
  Edit2,
  CheckCircle2,
  XCircle,
  Plus,
  UtensilsCrossed,
  Loader2,
  AlertCircle,
  Check,
  Save,
  X,
  ExternalLink,
} from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatCentsToBRL, parseBRLToCents } from "@/lib/utils/formatters";

interface ComboRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  base_price_cents: number;
  promo_price_cents: number | null;
  image_url: string | null;
  is_active: boolean;
  product_ingredients?: { name: string }[];
}

const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID || "a0000000-0000-0000-0000-000000000001";

export default function AdminCombosPage() {
  const [combos, setCombos] = useState<ComboRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal de Edição de Combo
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCombo, setEditingCombo] = useState<ComboRow | null>(null);
  const [comboName, setComboName] = useState("");
  const [comboPriceReais, setComboPriceReais] = useState("");
  const [comboDescription, setComboDescription] = useState("");
  const [comboImageUrl, setComboImageUrl] = useState("");
  const [comboIsActive, setComboIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchCombos = async () => {
    setIsLoading(true);
    const client = getSupabaseBrowserClient();
    if (!client) return;

    try {
      // Buscar categoria de combos
      const { data: catData } = await client
        .from("categories")
        .select("id")
        .eq("store_id", STORE_ID)
        .eq("slug", "combos")
        .single();

      if (!catData) {
        setCombos([]);
        setIsLoading(false);
        return;
      }

      // Buscar produtos da categoria combos
      const { data, error } = await client
        .from("products")
        .select(`
          id,
          name,
          slug,
          description,
          base_price_cents,
          promo_price_cents,
          image_url,
          is_active,
          product_ingredients(name)
        `)
        .eq("store_id", STORE_ID)
        .eq("category_id", catData.id)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      setCombos((data as unknown as ComboRow[]) || []);
    } catch (err: any) {
      console.error("Erro ao carregar combos:", err);
      alert(`Falha ao buscar combos: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCombos();
  }, []);

  const handleOpenEdit = (combo: ComboRow) => {
    setEditingCombo(combo);
    setComboName(combo.name);
    setComboPriceReais((combo.base_price_cents / 100).toFixed(2).replace(".", ","));
    setComboDescription(combo.description || "");
    setComboImageUrl(combo.image_url || "");
    setComboIsActive(combo.is_active);
    setIsModalOpen(true);
  };

  const handleToggleActive = async (combo: ComboRow) => {
    const client = getSupabaseBrowserClient();
    if (!client) return;

    const newStatus = !combo.is_active;
    setCombos((prev) =>
      prev.map((c) => (c.id === combo.id ? { ...c, is_active: newStatus } : c))
    );

    try {
      const { error } = await client
        .from("products")
        .update({ is_active: newStatus })
        .eq("id", combo.id);

      if (error) throw error;
    } catch (err: any) {
      alert(`Erro ao alterar status: ${err.message}`);
      fetchCombos();
    }
  };

  const handleSaveCombo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCombo) return;

    const client = getSupabaseBrowserClient();
    if (!client) return;

    const priceCents = parseBRLToCents(comboPriceReais);
    if (priceCents <= 0) {
      alert("O valor do combo deve ser superior a zero.");
      return;
    }

    try {
      setIsSaving(true);
      const { error } = await client
        .from("products")
        .update({
          name: comboName.trim(),
          description: comboDescription.trim() || null,
          base_price_cents: priceCents,
          image_url: comboImageUrl.trim() || null,
          is_active: comboIsActive,
        })
        .eq("id", editingCombo.id);

      if (error) throw error;

      setIsModalOpen(false);
      await fetchCombos();
    } catch (err: any) {
      alert(`Erro ao salvar combo: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-bebas text-3xl tracking-wide text-[#F3E3C7]">
            Gerenciamento de Combos
          </h1>
          <p className="text-xs text-zinc-400">
            Configure combos gastronômicos integrados (hambúrguer + bebida + batata rústica).
          </p>
        </div>

        <Link
          href="/admin/produtos"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition"
        >
          <UtensilsCrossed className="w-3.5 h-3.5" />
          <span>Ver todos os produtos</span>
        </Link>
      </div>

      {/* Lista de Combos */}
      {isLoading ? (
        <div className="p-12 text-center text-zinc-400 flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-[#FF6A00]" />
          <span className="text-xs">Carregando combos do PostgreSQL...</span>
        </div>
      ) : combos.length === 0 ? (
        <div className="p-12 text-center text-zinc-500 text-xs rounded-xl border border-zinc-800 bg-[#161616]">
          Nenhum combo cadastrado nesta loja.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {combos.map((combo) => (
            <div
              key={combo.id}
              className="rounded-xl border border-zinc-800 bg-[#161616] overflow-hidden flex flex-col justify-between"
            >
              <div className="p-5 flex gap-4">
                <div className="relative w-24 h-24 rounded-lg bg-zinc-800 overflow-hidden shrink-0 border border-zinc-700/60">
                  <Image
                    src={combo.image_url || "/images/combos/combo-classico.webp"}
                    alt={combo.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-zinc-100 text-sm truncate">
                      {combo.name}
                    </h3>
                    <span className="font-mono font-bold text-base text-[#F3E3C7] shrink-0">
                      {formatCentsToBRL(combo.base_price_cents)}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                    {combo.description || "Combo promocional completo."}
                  </p>

                  {/* Componentes inclusos */}
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {(combo.product_ingredients || []).map((ing, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-300"
                      >
                        <Check className="w-2.5 h-2.5 text-emerald-400" />
                        <span>{ing.name}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Barra de Ações do Card */}
              <div className="px-5 py-3 border-t border-zinc-800/80 bg-zinc-950/40 flex items-center justify-between text-xs">
                <button
                  onClick={() => handleToggleActive(combo)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition ${
                    combo.is_active
                      ? "bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/60"
                      : "bg-zinc-800 border border-zinc-700 text-zinc-400 hover:bg-zinc-700"
                  }`}
                >
                  {combo.is_active ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Ativo no Cardápio</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Pausado</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleOpenEdit(combo)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Editar Combo</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Edição */}
      {isModalOpen && editingCombo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />

          <div className="relative w-full max-w-md bg-[#141414] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-10 text-xs">
            <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="font-bebas text-2xl tracking-wide text-[#F3E3C7]">
                Editar Combo
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCombo} className="p-6 space-y-4">
              <div>
                <label className="block text-zinc-300 font-medium mb-1.5">Nome do Combo *</label>
                <input
                  type="text"
                  value={comboName}
                  onChange={(e) => setComboName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-[#0C0C0C] border border-zinc-800 text-zinc-200 focus:outline-none focus:border-[#FF6A00]"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1.5">Preço Total do Combo (R$) *</label>
                <input
                  type="text"
                  value={comboPriceReais}
                  onChange={(e) => setComboPriceReais(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-[#0C0C0C] border border-zinc-800 text-zinc-200 font-mono focus:outline-none focus:border-[#FF6A00]"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1.5">Caminho da Imagem</label>
                <input
                  type="text"
                  value={comboImageUrl}
                  onChange={(e) => setComboImageUrl(e.target.value)}
                  placeholder="/images/combos/combo-classico.webp"
                  className="w-full px-3 py-2 rounded-lg bg-[#0C0C0C] border border-zinc-800 text-zinc-200 font-mono focus:outline-none focus:border-[#FF6A00]"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1.5">Descrição do Combo</label>
                <textarea
                  rows={2}
                  value={comboDescription}
                  onChange={(e) => setComboDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0C0C0C] border border-zinc-800 text-zinc-200 focus:outline-none focus:border-[#FF6A00]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="chk-combo-active"
                  checked={comboIsActive}
                  onChange={(e) => setComboIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-[#FF6A00] focus:ring-0 bg-zinc-900 border-zinc-700"
                />
                <label htmlFor="chk-combo-active" className="text-zinc-300 font-medium cursor-pointer">
                  Combo ativo no cardápio
                </label>
              </div>

              <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#FF6A00] hover:bg-[#e05d00] text-black font-semibold text-xs transition disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Salvar Alterações</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

