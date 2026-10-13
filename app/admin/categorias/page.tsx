"use client";

import React, { useState, useEffect } from "react";
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Save,
  X,
  Loader2,
  ArrowUpDown,
  UtensilsCrossed,
} from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  productCount?: number;
}

const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID || "a0000000-0000-0000-0000-000000000001";

export default function AdminCategoriasPage() {
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryRow | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form Fields
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formSortOrder, setFormSortOrder] = useState("1");
  const [formIsActive, setFormIsActive] = useState(true);

  const fetchCategories = async () => {
    setIsLoading(true);
    const client = getSupabaseBrowserClient();
    if (!client) return;

    try {
      // 1. Categorias
      const { data: catData, error } = await client
        .from("categories")
        .select("id, name, slug, description, sort_order, is_active")
        .eq("store_id", STORE_ID)
        .order("sort_order", { ascending: true });

      if (error) throw error;

      // 2. Contar produtos de cada categoria
      const categoriesWithCount = await Promise.all(
        (catData || []).map(async (cat) => {
          const { count } = await client
            .from("products")
            .select("id", { count: "exact", head: true })
            .eq("category_id", cat.id);
          return {
            ...cat,
            productCount: count || 0,
          };
        })
      );

      setCategories(categoriesWithCount);
    } catch (err: any) {
      console.error("Erro ao carregar categorias:", err);
      alert(`Falha ao buscar categorias: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenModal = (cat?: CategoryRow) => {
    if (cat) {
      setEditingCategory(cat);
      setFormName(cat.name);
      setFormSlug(cat.slug);
      setFormDescription(cat.description || "");
      setFormSortOrder(String(cat.sort_order));
      setFormIsActive(cat.is_active);
    } else {
      setEditingCategory(null);
      setFormName("");
      setFormSlug("");
      setFormDescription("");
      setFormSortOrder(String(categories.length + 1));
      setFormIsActive(true);
    }
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setFormName(val);
    if (!editingCategory) {
      const generated = val
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setFormSlug(generated);
    }
  };

  const handleToggleActive = async (cat: CategoryRow) => {
    const client = getSupabaseBrowserClient();
    if (!client) return;

    const newStatus = !cat.is_active;
    setCategories((prev) =>
      prev.map((c) => (c.id === cat.id ? { ...c, is_active: newStatus } : c))
    );

    try {
      const { error } = await client
        .from("categories")
        .update({ is_active: newStatus })
        .eq("id", cat.id);

      if (error) throw error;
    } catch (err: any) {
      alert(`Erro ao alterar status: ${err.message}`);
      fetchCategories();
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const client = getSupabaseBrowserClient();
    if (!client) return;

    if (!formName.trim()) {
      alert("O nome da categoria é obrigatório.");
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        store_id: STORE_ID,
        name: formName.trim(),
        slug: formSlug.trim() || formName.trim().toLowerCase().replace(/\s+/g, "-"),
        description: formDescription.trim() || null,
        sort_order: parseInt(formSortOrder, 10) || 1,
        is_active: formIsActive,
      };

      if (editingCategory) {
        const { error } = await client.from("categories").update(payload).eq("id", editingCategory.id);
        if (error) throw error;
      } else {
        const { error } = await client.from("categories").insert(payload);
        if (error) throw error;
      }

      setIsModalOpen(false);
      await fetchCategories();
    } catch (err: any) {
      alert(`Erro ao salvar categoria: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = async (cat: CategoryRow) => {
    if (cat.productCount && cat.productCount > 0) {
      alert(
        `Não é possível excluir a categoria "${cat.name}" porque há ${cat.productCount} produto(s) vinculados a ela. Mova ou exclua os produtos antes de remover a categoria.`
      );
      return;
    }

    const confirmDelete = window.confirm(
      `Tem certeza que deseja excluir a categoria "${cat.name}"?`
    );
    if (!confirmDelete) return;

    const client = getSupabaseBrowserClient();
    if (!client) return;

    try {
      const { error } = await client.from("categories").delete().eq("id", cat.id);
      if (error) throw error;
      await fetchCategories();
    } catch (err: any) {
      alert(`Erro ao excluir categoria: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-bebas text-3xl tracking-wide text-[#F3E3C7]">
            Gerenciamento de Categorias
          </h1>
          <p className="text-xs text-zinc-400">
            Organize os grupos do cardápio e a ordem de exibição na loja pública.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-[#FF6A00] hover:bg-[#e05d00] text-black font-semibold text-xs transition shadow-sm shadow-[#FF6A00]/20"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Categoria</span>
        </button>
      </div>

      {/* Tabela de Categorias */}
      <div className="rounded-xl border border-zinc-800 bg-[#161616] overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-zinc-400 flex flex-col items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-[#FF6A00]" />
            <span className="text-xs">Carregando categorias do PostgreSQL...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800/80 bg-zinc-950/40 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  <th className="py-3 px-4 w-16 text-center">Ordem</th>
                  <th className="py-3 px-4">Nome da Categoria</th>
                  <th className="py-3 px-4">Slug</th>
                  <th className="py-3 px-4">Produtos Vinculados</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-xs">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-zinc-800/20 transition">
                    {/* Ordem */}
                    <td className="py-3 px-4 text-center font-mono font-bold text-[#FF6A00]">
                      #{cat.sort_order}
                    </td>

                    {/* Nome & Descrição */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-zinc-200">{cat.name}</div>
                      {cat.description && (
                        <div className="text-[11px] text-zinc-500 truncate max-w-xs">
                          {cat.description}
                        </div>
                      )}
                    </td>

                    {/* Slug */}
                    <td className="py-3 px-4 text-zinc-400 font-mono">
                      /{cat.slug}
                    </td>

                    {/* Contagem de Produtos */}
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-800 text-[11px] text-zinc-300">
                        <UtensilsCrossed className="w-3 h-3 text-zinc-500" />
                        <span>{cat.productCount} produto(s)</span>
                      </span>
                    </td>

                    {/* Toggle Status */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggleActive(cat)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition ${
                          cat.is_active
                            ? "bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/60"
                            : "bg-zinc-800 border border-zinc-700 text-zinc-400 hover:bg-zinc-700"
                        }`}
                      >
                        {cat.is_active ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>Ativa</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-zinc-500" />
                            <span>Inativa</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Ações */}
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenModal(cat)}
                          title="Editar Categoria"
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat)}
                          title="Excluir Categoria"
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Cadastro / Edição de Categoria */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />

          <div className="relative w-full max-w-md bg-[#141414] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-10">
            <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="font-bebas text-2xl tracking-wide text-[#F3E3C7]">
                {editingCategory ? "Editar Categoria" : "Nova Categoria"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-medium mb-1.5">Nome da Categoria *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ex: Sobremesas Artesanais"
                  required
                  className="w-full px-3 py-2 rounded-lg bg-[#0C0C0C] border border-zinc-800 text-zinc-200 focus:outline-none focus:border-[#FF6A00]"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1.5">Slug (URL)</label>
                <input
                  type="text"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  placeholder="sobremesas-artesanais"
                  required
                  className="w-full px-3 py-2 rounded-lg bg-[#0C0C0C] border border-zinc-800 text-zinc-400 font-mono focus:outline-none focus:border-[#FF6A00]"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1.5">Ordem de Exibição</label>
                <input
                  type="number"
                  value={formSortOrder}
                  onChange={(e) => setFormSortOrder(e.target.value)}
                  min={1}
                  max={99}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-[#0C0C0C] border border-zinc-800 text-zinc-200 font-mono focus:outline-none focus:border-[#FF6A00]"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1.5">Descrição Curta</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Descrição exibida no cardápio..."
                  className="w-full px-3 py-2 rounded-lg bg-[#0C0C0C] border border-zinc-800 text-zinc-200 focus:outline-none focus:border-[#FF6A00]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="chk-cat-active"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-[#FF6A00] focus:ring-0 bg-zinc-900 border-zinc-700"
                />
                <label htmlFor="chk-cat-active" className="text-zinc-300 font-medium cursor-pointer">
                  Categoria ativa no cardápio
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
                  <span>{editingCategory ? "Salvar Alterações" : "Cadastrar Categoria"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

