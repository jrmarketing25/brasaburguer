"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  UtensilsCrossed,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  Upload,
  X,
  Loader2,
  AlertCircle,
  Clock,
  Sparkles,
  ChevronRight,
  Save,
} from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatCentsToBRL, parseBRLToCents } from "@/lib/utils/formatters";
import { uploadStorageFile } from "@/lib/supabase/storage";

interface ProductRow {
  id: string;
  name: string;
  slug: string;
  category_id: string | null;
  base_price_cents: number;
  promo_price_cents: number | null;
  image_url: string | null;
  badge: string | null;
  is_active: boolean;
  is_featured: boolean;
  description: string | null;
  prep_time_min: number | null;
  sort_order: number;
  categories?: { name: string; slug: string } | null;
  product_ingredients?: { id?: string; name: string; is_removable: boolean }[];
}

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID || "a0000000-0000-0000-0000-000000000001";

export default function AdminProdutosPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  // Modal de edição / cadastro
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductRow | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formCategoryId, setFormCategoryId] = useState("");
  const [formPriceReais, setFormPriceReais] = useState("");
  const [formPromoPriceReais, setFormPromoPriceReais] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formBadge, setFormBadge] = useState("");
  const [formPrepTime, setFormPrepTime] = useState("20");
  const [formIsActive, setFormIsActive] = useState(true);
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formIngredients, setFormIngredients] = useState<{ name: string; is_removable: boolean }[]>([]);
  const [newIngredientName, setNewIngredientName] = useState("");

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Carregar produtos e categorias do PostgreSQL
  const fetchData = async () => {
    setIsLoading(true);
    const client = getSupabaseBrowserClient();
    if (!client) return;

    try {
      // 1. Categorias
      const { data: catData } = await client
        .from("categories")
        .select("id, name, slug")
        .eq("store_id", STORE_ID)
        .order("sort_order", { ascending: true });

      setCategories(catData || []);

      // 2. Produtos com categorias e ingredientes
      const { data: prodData, error } = await client
        .from("products")
        .select(`
          id,
          name,
          slug,
          category_id,
          base_price_cents,
          promo_price_cents,
          image_url,
          badge,
          is_active,
          is_featured,
          description,
          prep_time_min,
          sort_order,
          categories(name, slug),
          product_ingredients(id, name, is_removable)
        `)
        .eq("store_id", STORE_ID)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      setProducts((prodData as unknown as ProductRow[]) || []);
    } catch (err: any) {
      console.error("Erro ao listar produtos:", err);
      setFeedbackMessage({ type: "error", text: `Falha ao carregar produtos: ${err.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Abrir modal para novo produto ou edição
  const handleOpenModal = (prod?: ProductRow) => {
    setFeedbackMessage(null);
    if (prod) {
      setEditingProduct(prod);
      setFormName(prod.name);
      setFormSlug(prod.slug);
      setFormCategoryId(prod.category_id || (categories[0]?.id || ""));
      setFormPriceReais((prod.base_price_cents / 100).toFixed(2).replace(".", ","));
      setFormPromoPriceReais(
        prod.promo_price_cents ? (prod.promo_price_cents / 100).toFixed(2).replace(".", ",") : ""
      );
      setFormDescription(prod.description || "");
      setFormImageUrl(prod.image_url || "");
      setFormBadge(prod.badge || "");
      setFormPrepTime(String(prod.prep_time_min || 20));
      setFormIsActive(prod.is_active);
      setFormIsFeatured(prod.is_featured);
      setFormIngredients(prod.product_ingredients || []);
    } else {
      setEditingProduct(null);
      setFormName("");
      setFormSlug("");
      setFormCategoryId(categories[0]?.id || "");
      setFormPriceReais("32,90");
      setFormPromoPriceReais("");
      setFormDescription("");
      setFormImageUrl("/images/products/brasa-classico.webp");
      setFormBadge("");
      setFormPrepTime("20");
      setFormIsActive(true);
      setFormIsFeatured(false);
      setFormIngredients([]);
    }
    setIsModalOpen(true);
  };

  // Autogerar slug ao digitar nome (se novo)
  const handleNameChange = (val: string) => {
    setFormName(val);
    if (!editingProduct) {
      const generated = val
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setFormSlug(generated);
    }
  };

  // Upload de imagem para Supabase Storage
  const handleFileUpload = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecione um arquivo de imagem válido.");
      return;
    }

    try {
      setIsUploading(true);
      const ext = file.name.split(".").pop() || "webp";
      const fileName = `${STORE_ID}/products/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
      
      const { url, error } = await uploadStorageFile("products", fileName, file);
      if (error) {
        alert(`Erro no upload: ${error.message}`);
      } else if (url) {
        setFormImageUrl(url);
      }
    } catch (err: any) {
      alert(`Falha no upload: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Toggle rápido de ativação na tabela
  const handleToggleActive = async (prod: ProductRow) => {
    const client = getSupabaseBrowserClient();
    if (!client) return;

    const newStatus = !prod.is_active;
    // Otimista
    setProducts((prev) =>
      prev.map((p) => (p.id === prod.id ? { ...p, is_active: newStatus } : p))
    );

    try {
      const { error } = await client
        .from("products")
        .update({ is_active: newStatus })
        .eq("id", prod.id);

      if (error) throw error;
    } catch (err: any) {
      alert(`Erro ao alterar status: ${err.message}`);
      fetchData();
    }
  };

  // Salvar produto (INSERT ou UPDATE)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const client = getSupabaseBrowserClient();
    if (!client) return;

    if (!formName.trim()) {
      alert("O nome do produto é obrigatório.");
      return;
    }

    const basePriceCents = parseBRLToCents(formPriceReais);
    const promoPriceCents = formPromoPriceReais ? parseBRLToCents(formPromoPriceReais) : null;

    if (basePriceCents <= 0) {
      alert("O preço deve ser superior a zero.");
      return;
    }

    try {
      setIsSaving(true);
      setFeedbackMessage(null);

      const payload = {
        store_id: STORE_ID,
        category_id: formCategoryId || null,
        name: formName.trim(),
        slug: formSlug.trim() || formName.trim().toLowerCase().replace(/\s+/g, "-"),
        description: formDescription.trim() || null,
        base_price_cents: basePriceCents,
        promo_price_cents: promoPriceCents,
        image_url: formImageUrl || null,
        badge: formBadge.trim() || null,
        prep_time_min: parseInt(formPrepTime, 10) || 20,
        is_active: formIsActive,
        is_featured: formIsFeatured,
      };

      let productId = editingProduct?.id;

      if (editingProduct) {
        // UPDATE
        const { error } = await client.from("products").update(payload).eq("id", editingProduct.id);
        if (error) throw error;
      } else {
        // INSERT
        const { data: newProd, error } = await client
          .from("products")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw error;
        productId = newProd.id;
      }

      // Sincronizar Ingredientes
      if (productId) {
        // Deletar anteriores e reinserir
        await client.from("product_ingredients").delete().eq("product_id", productId);
        if (formIngredients.length > 0) {
          const ingPayload = formIngredients.map((ing, idx) => ({
            product_id: productId,
            name: ing.name,
            is_removable: ing.is_removable,
            sort_order: idx + 1,
          }));
          await client.from("product_ingredients").insert(ingPayload);
        }
      }

      setIsModalOpen(false);
      await fetchData();
    } catch (err: any) {
      console.error("Erro ao salvar produto:", err);
      alert(`Erro ao salvar produto: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Exclusão segura com verificação
  const handleDeleteProduct = async (prod: ProductRow) => {
    const confirmDelete = window.confirm(
      `Tem certeza que deseja excluir o produto "${prod.name}"?\nEsta ação não poderá ser desfeita.`
    );
    if (!confirmDelete) return;

    const client = getSupabaseBrowserClient();
    if (!client) return;

    try {
      // Verificar se há itens de pedido associados
      const { count } = await client
        .from("order_items")
        .select("id", { count: "exact", head: true })
        .eq("product_id", prod.id);

      if (count && count > 0) {
        alert(
          `Não é permitido excluir este produto porque ele está vinculado a ${count} histórico(s) de pedidos. Em vez de excluir, desative o produto para removê-lo do cardápio público.`
        );
        return;
      }

      const { error } = await client.from("products").delete().eq("id", prod.id);
      if (error) throw error;

      await fetchData();
    } catch (err: any) {
      alert(`Falha ao excluir produto: ${err.message}`);
    }
  };

  // Filtragem local dos produtos
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || p.category_id === categoryFilter;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && p.is_active) ||
      (statusFilter === "inactive" && !p.is_active);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-bebas text-3xl tracking-wide text-[#F3E3C7]">
            Gerenciamento de Produtos
          </h1>
          <p className="text-xs text-zinc-400">
            Cadastre, edite preços, organize ingredientes e controle a visibilidade no cardápio.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-[#FF6A00] hover:bg-[#e05d00] text-black font-semibold text-xs transition shadow-sm shadow-[#FF6A00]/20"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Produto</span>
        </button>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="p-3.5 rounded-xl border border-zinc-800 bg-[#161616] flex flex-col md:flex-row items-center gap-3">
        {/* Campo de Busca */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome do burger ou slug..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#0C0C0C] border border-zinc-800 text-xs text-[#F3E3C7] placeholder-zinc-600 focus:outline-none focus:border-[#FF6A00]"
          />
        </div>

        {/* Filtro por Categoria */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-zinc-500 shrink-0" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full md:w-auto px-3 py-2 rounded-lg bg-[#0C0C0C] border border-zinc-800 text-xs text-zinc-300 focus:outline-none focus:border-[#FF6A00]"
          >
            <option value="all">Todas as categorias</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Status */}
        <div className="flex items-center gap-1 w-full md:w-auto bg-[#0C0C0C] p-1 rounded-lg border border-zinc-800 text-xs">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1 rounded text-xs transition ${
              statusFilter === "all" ? "bg-zinc-800 text-white font-medium" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setStatusFilter("active")}
            className={`px-3 py-1 rounded text-xs transition ${
              statusFilter === "active" ? "bg-emerald-950/70 text-emerald-400 font-medium" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Ativos
          </button>
          <button
            onClick={() => setStatusFilter("inactive")}
            className={`px-3 py-1 rounded text-xs transition ${
              statusFilter === "inactive" ? "bg-amber-950/70 text-amber-400 font-medium" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Inativos
          </button>
        </div>
      </div>

      {/* Tabela de Produtos */}
      <div className="rounded-xl border border-zinc-800 bg-[#161616] overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-zinc-400 flex flex-col items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-[#FF6A00]" />
            <span className="text-xs">Carregando catálogo do PostgreSQL...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-xs">
            Nenhum produto encontrado com os filtros atuais.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800/80 bg-zinc-950/40 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  <th className="py-3 px-4">Produto</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4">Preço (R$)</th>
                  <th className="py-3 px-4">Preparo</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-xs">
                {filteredProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-zinc-800/20 transition">
                    {/* Imagem + Nome + Badge */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-11 h-11 rounded-lg bg-zinc-800 overflow-hidden shrink-0 border border-zinc-700/50">
                          <Image
                            src={prod.image_url || "/images/products/brasa-classico.webp"}
                            alt={prod.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-medium text-zinc-200 flex items-center gap-1.5">
                            <span>{prod.name}</span>
                            {prod.badge && (
                              <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-[10px] text-[#F3E3C7] border border-zinc-700">
                                {prod.badge}
                              </span>
                            )}
                            {prod.is_featured && (
                              <span title="Destaque">
                                <Sparkles className="w-3 h-3 text-[#FF6A00]" />
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-zinc-500 font-mono">/{prod.slug}</span>
                        </div>
                      </div>
                    </td>

                    {/* Categoria */}
                    <td className="py-3 px-4 text-zinc-400">
                      {prod.categories?.name || "Sem categoria"}
                    </td>

                    {/* Preço */}
                    <td className="py-3 px-4 font-mono">
                      <div className="font-semibold text-[#F3E3C7]">
                        {formatCentsToBRL(prod.base_price_cents)}
                      </div>
                      {prod.promo_price_cents && (
                        <div className="text-[10px] text-emerald-400">
                          Promo: {formatCentsToBRL(prod.promo_price_cents)}
                        </div>
                      )}
                    </td>

                    {/* Tempo de Preparo */}
                    <td className="py-3 px-4 text-zinc-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-zinc-500" />
                        <span>{prod.prep_time_min || 20} min</span>
                      </div>
                    </td>

                    {/* Toggle Status */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggleActive(prod)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition ${
                          prod.is_active
                            ? "bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/60"
                            : "bg-zinc-800 border border-zinc-700 text-zinc-400 hover:bg-zinc-700"
                        }`}
                      >
                        {prod.is_active ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>Ativo</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-zinc-500" />
                            <span>Inativo</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Ações */}
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenModal(prod)}
                          title="Editar Produto"
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod)}
                          title="Excluir Produto"
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

      {/* ============================================================== */}
      {/* MODAL DE CADASTRO / EDIÇÃO                                     */}
      {/* ============================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />

          <div className="relative w-full max-w-2xl bg-[#141414] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col z-10">
            {/* Topo do Modal */}
            <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h2 className="font-bebas text-2xl tracking-wide text-[#F3E3C7]">
                  {editingProduct ? "Editar Produto" : "Novo Produto"}
                </h2>
                <span className="text-[11px] text-zinc-500">
                  Preencha os dados gastronômicos e comerciais do item.
                </span>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulário com Scroll */}
            <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
              {/* Linha 1: Nome e Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1.5">Nome do Produto *</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Ex: Brasa Trufado"
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
                    placeholder="brasa-trufado"
                    required
                    className="w-full px-3 py-2 rounded-lg bg-[#0C0C0C] border border-zinc-800 text-zinc-400 font-mono focus:outline-none focus:border-[#FF6A00]"
                  />
                </div>
              </div>

              {/* Linha 2: Categoria, Preço Base e Preço Promo */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1.5">Categoria</label>
                  <select
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0C0C0C] border border-zinc-800 text-zinc-200 focus:outline-none focus:border-[#FF6A00]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1.5">Preço Base (R$) *</label>
                  <input
                    type="text"
                    value={formPriceReais}
                    onChange={(e) => setFormPriceReais(e.target.value)}
                    placeholder="32,90"
                    required
                    className="w-full px-3 py-2 rounded-lg bg-[#0C0C0C] border border-zinc-800 text-zinc-200 font-mono focus:outline-none focus:border-[#FF6A00]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1.5">Preço Promo (Opcional)</label>
                  <input
                    type="text"
                    value={formPromoPriceReais}
                    onChange={(e) => setFormPromoPriceReais(e.target.value)}
                    placeholder="29,90"
                    className="w-full px-3 py-2 rounded-lg bg-[#0C0C0C] border border-zinc-800 text-zinc-200 font-mono focus:outline-none focus:border-[#FF6A00]"
                  />
                </div>
              </div>

              {/* Linha 3: Fotografia com Upload ou URL */}
              <div>
                <label className="block text-zinc-300 font-medium mb-1.5">Fotografia do Produto</label>
                <div className="flex items-center gap-4 p-3 rounded-lg border border-zinc-800 bg-[#0C0C0C]">
                  <div className="relative w-16 h-16 rounded-lg bg-zinc-800 overflow-hidden shrink-0 border border-zinc-700">
                    <Image
                      src={formImageUrl || "/images/products/brasa-classico.webp"}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <input
                      type="text"
                      value={formImageUrl}
                      onChange={(e) => setFormImageUrl(e.target.value)}
                      placeholder="/images/products/... ou URL pública"
                      className="w-full px-3 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300 font-mono focus:outline-none focus:border-[#FF6A00]"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="flex items-center gap-1.5 px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs transition"
                      >
                        {isUploading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF6A00]" />
                        ) : (
                          <Upload className="w-3.5 h-3.5 text-[#FF6A00]" />
                        )}
                        <span>{isUploading ? "Enviando..." : "Fazer Upload (Storage Local)"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Linha 4: Badge, Tempo e Switches */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1.5">Badge / Destaque</label>
                  <input
                    type="text"
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    placeholder="Ex: Mais pedido, Novo"
                    className="w-full px-3 py-2 rounded-lg bg-[#0C0C0C] border border-zinc-800 text-zinc-200 focus:outline-none focus:border-[#FF6A00]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1.5">Preparo (min)</label>
                  <input
                    type="number"
                    value={formPrepTime}
                    onChange={(e) => setFormPrepTime(e.target.value)}
                    min={5}
                    max={120}
                    className="w-full px-3 py-2 rounded-lg bg-[#0C0C0C] border border-zinc-800 text-zinc-200 font-mono focus:outline-none focus:border-[#FF6A00]"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="chk-active"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-[#FF6A00] focus:ring-0 bg-zinc-900 border-zinc-700"
                  />
                  <label htmlFor="chk-active" className="text-zinc-300 font-medium cursor-pointer">
                    Disponível no cardápio
                  </label>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="chk-featured"
                    checked={formIsFeatured}
                    onChange={(e) => setFormIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-[#FF6A00] focus:ring-0 bg-zinc-900 border-zinc-700"
                  />
                  <label htmlFor="chk-featured" className="text-zinc-300 font-medium cursor-pointer">
                    Produto em destaque
                  </label>
                </div>
              </div>

              {/* Linha 5: Descrição */}
              <div>
                <label className="block text-zinc-300 font-medium mb-1.5">Descrição Gastronômica</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Blend artesanal grelhado na brasa..."
                  className="w-full px-3 py-2 rounded-lg bg-[#0C0C0C] border border-zinc-800 text-zinc-200 focus:outline-none focus:border-[#FF6A00]"
                />
              </div>

              {/* Linha 6: Ingredientes */}
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <label className="block text-zinc-300 font-medium">
                  Ingredientes (Removíveis no Pedido pelo Cliente)
                </label>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newIngredientName}
                    onChange={(e) => setNewIngredientName(e.target.value)}
                    placeholder="Ex: Queijo cheddar fatiado, Bacon..."
                    className="flex-1 px-3 py-1.5 rounded-lg bg-[#0C0C0C] border border-zinc-800 text-zinc-200 focus:outline-none focus:border-[#FF6A00]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newIngredientName.trim()) {
                        setFormIngredients((prev) => [
                          ...prev,
                          { name: newIngredientName.trim(), is_removable: true },
                        ]);
                        setNewIngredientName("");
                      }
                    }}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium"
                  >
                    Adicionar
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {formIngredients.map((ing, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 text-[11px]"
                    >
                      <span>{ing.name}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setFormIngredients((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="text-zinc-500 hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Botões do Rodapé */}
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
                  <span>{editingProduct ? "Salvar Alterações" : "Cadastrar Produto"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

