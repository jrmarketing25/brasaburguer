"use client";

import React, { useState, useEffect } from "react";
import {
  SlidersHorizontal,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Loader2,
  CheckCircle2,
  XCircle,
  PlusCircle,
  DollarSign,
  UtensilsCrossed,
} from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatCentsToBRL, parseBRLToCents } from "@/lib/utils/formatters";

interface CustomOption {
  id?: string;
  name: string;
  description?: string;
  price_cents: number;
  is_available: boolean;
  max_quantity: number;
}

interface CustomGroupRow {
  id: string;
  name: string;
  description: string | null;
  type: "addition" | "removal" | "choice";
  min_selections: number;
  max_selections: number;
  is_required: boolean;
  sort_order: number;
  customization_options?: CustomOption[];
}

const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID || "a0000000-0000-0000-0000-000000000001";

export default function AdminAdicionaisPage() {
  const [groups, setGroups] = useState<CustomGroupRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal de Grupo
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<CustomGroupRow | null>(null);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [groupType, setGroupType] = useState<"addition" | "removal" | "choice">("addition");
  const [groupMin, setGroupMin] = useState("0");
  const [groupMax, setGroupMax] = useState("4");
  const [groupIsRequired, setGroupIsRequired] = useState(false);
  const [isSavingGroup, setIsSavingGroup] = useState(false);

  // Modal de Opção dentro de um Grupo
  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [editingOption, setEditingOption] = useState<CustomOption | null>(null);
  const [optionName, setOptionName] = useState("");
  const [optionPriceReais, setOptionPriceReais] = useState("0,00");
  const [optionDescription, setOptionDescription] = useState("");
  const [optionIsAvailable, setOptionIsAvailable] = useState(true);
  const [isSavingOption, setIsSavingOption] = useState(false);

  const fetchGroups = async () => {
    setIsLoading(true);
    const client = getSupabaseBrowserClient();
    if (!client) return;

    try {
      const { data, error } = await client
        .from("customization_groups")
        .select(`
          id,
          name,
          description,
          type,
          min_selections,
          max_selections,
          is_required,
          sort_order,
          customization_options (
            id,
            name,
            description,
            price_cents,
            is_available,
            max_quantity,
            sort_order
          )
        `)
        .eq("store_id", STORE_ID)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      setGroups((data as CustomGroupRow[]) || []);
    } catch (err: any) {
      console.error("Erro ao carregar grupos de customização:", err);
      alert(`Falha ao carregar adicionais: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  // Abrir modal de grupo
  const handleOpenGroupModal = (group?: CustomGroupRow) => {
    if (group) {
      setEditingGroup(group);
      setGroupName(group.name);
      setGroupDescription(group.description || "");
      setGroupType(group.type);
      setGroupMin(String(group.min_selections));
      setGroupMax(String(group.max_selections));
      setGroupIsRequired(group.is_required);
    } else {
      setEditingGroup(null);
      setGroupName("");
      setGroupDescription("");
      setGroupType("addition");
      setGroupMin("0");
      setGroupMax("4");
      setGroupIsRequired(false);
    }
    setIsGroupModalOpen(true);
  };

  const handleSaveGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    const client = getSupabaseBrowserClient();
    if (!client) return;

    const min = parseInt(groupMin, 10) || 0;
    const max = parseInt(groupMax, 10) || 1;

    if (min > max) {
      alert("O número mínimo de seleções não pode ser maior que o máximo.");
      return;
    }

    try {
      setIsSavingGroup(true);
      const payload = {
        store_id: STORE_ID,
        name: groupName.trim(),
        description: groupDescription.trim() || null,
        type: groupType,
        min_selections: min,
        max_selections: max,
        is_required: groupIsRequired,
      };

      if (editingGroup) {
        const { error } = await client
          .from("customization_groups")
          .update(payload)
          .eq("id", editingGroup.id);
        if (error) throw error;
      } else {
        const { error } = await client.from("customization_groups").insert(payload);
        if (error) throw error;
      }

      setIsGroupModalOpen(false);
      await fetchGroups();
    } catch (err: any) {
      alert(`Erro ao salvar grupo: ${err.message}`);
    } finally {
      setIsSavingGroup(false);
    }
  };

  const handleDeleteGroup = async (group: CustomGroupRow) => {
    const confirmDelete = window.confirm(
      `Tem certeza que deseja excluir o grupo "${group.name}" e todas as suas opções?`
    );
    if (!confirmDelete) return;

    const client = getSupabaseBrowserClient();
    if (!client) return;

    try {
      const { error } = await client
        .from("customization_groups")
        .delete()
        .eq("id", group.id);
      if (error) throw error;
      await fetchGroups();
    } catch (err: any) {
      alert(`Erro ao excluir grupo: ${err.message}`);
    }
  };

  // Abrir modal de opção
  const handleOpenOptionModal = (groupId: string, opt?: CustomOption) => {
    setSelectedGroupId(groupId);
    if (opt) {
      setEditingOption(opt);
      setOptionName(opt.name);
      setOptionPriceReais((opt.price_cents / 100).toFixed(2).replace(".", ","));
      setOptionDescription(opt.description || "");
      setOptionIsAvailable(opt.is_available);
    } else {
      setEditingOption(null);
      setOptionName("");
      setOptionPriceReais("0,00");
      setOptionDescription("");
      setOptionIsAvailable(true);
    }
    setIsOptionModalOpen(true);
  };

  const handleSaveOption = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroupId) return;

    const client = getSupabaseBrowserClient();
    if (!client) return;

    const priceCents = parseBRLToCents(optionPriceReais);

    try {
      setIsSavingOption(true);
      const payload = {
        group_id: selectedGroupId,
        name: optionName.trim(),
        description: optionDescription.trim() || null,
        price_cents: priceCents,
        is_available: optionIsAvailable,
      };

      if (editingOption?.id) {
        const { error } = await client
          .from("customization_options")
          .update(payload)
          .eq("id", editingOption.id);
        if (error) throw error;
      } else {
        const { error } = await client.from("customization_options").insert(payload);
        if (error) throw error;
      }

      setIsOptionModalOpen(false);
      await fetchGroups();
    } catch (err: any) {
      alert(`Erro ao salvar opção: ${err.message}`);
    } finally {
      setIsSavingOption(false);
    }
  };

  const handleDeleteOption = async (optionId: string) => {
    const confirmDelete = window.confirm("Deseja realmente remover esta opção?");
    if (!confirmDelete) return;

    const client = getSupabaseBrowserClient();
    if (!client) return;

    try {
      const { error } = await client
        .from("customization_options")
        .delete()
        .eq("id", optionId);
      if (error) throw error;
      await fetchGroups();
    } catch (err: any) {
      alert(`Erro ao excluir opção: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-bebas text-3xl tracking-wide text-[#F3E3C7]">
            Grupos de Personalização & Adicionais
          </h1>
          <p className="text-xs text-zinc-400">
            Gerencie grupos de adicionais, remoções de ingredientes e variações de combos.
          </p>
        </div>

        <button
          onClick={() => handleOpenGroupModal()}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-[#FF6A00] hover:bg-[#e05d00] text-black font-semibold text-xs transition shadow-sm shadow-[#FF6A00]/20"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Grupo</span>
        </button>
      </div>

      {/* Lista de Grupos */}
      {isLoading ? (
        <div className="p-12 text-center text-zinc-400 flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-[#FF6A00]" />
          <span className="text-xs">Carregando grupos do PostgreSQL...</span>
        </div>
      ) : groups.length === 0 ? (
        <div className="p-12 text-center text-zinc-500 text-xs rounded-xl border border-zinc-800 bg-[#161616]">
          Nenhum grupo de personalização cadastrado.
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <div
              key={group.id}
              className="rounded-xl border border-zinc-800 bg-[#161616] overflow-hidden"
            >
              {/* Header do Grupo */}
              <div className="p-4 border-b border-zinc-800/80 bg-zinc-950/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#FF6A00]/10 flex items-center justify-center text-[#FF6A00]">
                    <SlidersHorizontal className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-zinc-200">{group.name}</span>
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-400 uppercase tracking-wider font-mono">
                        {group.type === "addition"
                          ? "Adicional"
                          : group.type === "removal"
                          ? "Remoção"
                          : "Escolha Obrigatória"}
                      </span>
                      {group.is_required && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-950/70 text-amber-400 border border-amber-800/60 text-[10px]">
                          Obrigatório
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-zinc-500">
                      Mínimo: {group.min_selections} • Máximo: {group.max_selections} escolhas
                      {group.description && ` • ${group.description}`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleOpenOptionModal(group.id)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs transition"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-[#FF6A00]" />
                    <span>Adicionar Opção</span>
                  </button>
                  <button
                    onClick={() => handleOpenGroupModal(group)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteGroup(group)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Tabela de Opções */}
              <div className="divide-y divide-zinc-800/40 text-xs">
                {(group.customization_options || []).length === 0 ? (
                  <div className="p-4 text-center text-zinc-600 text-xs">
                    Nenhuma opção cadastrada neste grupo.
                  </div>
                ) : (
                  (group.customization_options || []).map((opt) => (
                    <div
                      key={opt.id}
                      className="p-3 px-4 flex items-center justify-between hover:bg-zinc-800/20 transition"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-[#FF6A00]" />
                        <div>
                          <span className="text-zinc-200 font-medium">{opt.name}</span>
                          {opt.description && (
                            <span className="text-zinc-500 ml-2 text-[11px]">
                              ({opt.description})
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="font-mono text-zinc-300 font-medium">
                          {opt.price_cents > 0 ? `+ ${formatCentsToBRL(opt.price_cents)}` : "Grátis"}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenOptionModal(group.id, opt)}
                            className="p-1 text-zinc-400 hover:text-white"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => opt.id && handleDeleteOption(opt.id)}
                            className="p-1 text-zinc-400 hover:text-red-400"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Grupo */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsGroupModalOpen(false)} />

          <div className="relative w-full max-w-md bg-[#141414] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-10 text-xs">
            <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="font-bebas text-2xl tracking-wide text-[#F3E3C7]">
                {editingGroup ? "Editar Grupo" : "Novo Grupo"}
              </h2>
              <button onClick={() => setIsGroupModalOpen(false)} className="p-1 text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGroup} className="p-6 space-y-4">
              <div>
                <label className="block text-zinc-300 font-medium mb-1.5">Nome do Grupo *</label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Ex: Adicionais Especiais"
                  required
                  className="w-full px-3 py-2 rounded-lg bg-[#0C0C0C] border border-zinc-800 text-zinc-200 focus:outline-none focus:border-[#FF6A00]"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1.5">Tipo do Grupo</label>
                <select
                  value={groupType}
                  onChange={(e) => setGroupType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0C0C0C] border border-zinc-800 text-zinc-200 focus:outline-none focus:border-[#FF6A00]"
                >
                  <option value="addition">Adicionais (Cobrança extra)</option>
                  <option value="removal">Remoção de ingredientes (Sem custo)</option>
                  <option value="choice">Escolha de item (Combo / Bebida inclusa)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1.5">Mínimo de Escolhas</label>
                  <input
                    type="number"
                    value={groupMin}
                    onChange={(e) => setGroupMin(e.target.value)}
                    min={0}
                    className="w-full px-3 py-2 rounded-lg bg-[#0C0C0C] border border-zinc-800 text-zinc-200 font-mono focus:outline-none focus:border-[#FF6A00]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1.5">Máximo de Escolhas</label>
                  <input
                    type="number"
                    value={groupMax}
                    onChange={(e) => setGroupMax(e.target.value)}
                    min={1}
                    className="w-full px-3 py-2 rounded-lg bg-[#0C0C0C] border border-zinc-800 text-zinc-200 font-mono focus:outline-none focus:border-[#FF6A00]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="chk-grp-req"
                  checked={groupIsRequired}
                  onChange={(e) => setGroupIsRequired(e.target.checked)}
                  className="w-4 h-4 rounded text-[#FF6A00] focus:ring-0 bg-zinc-900 border-zinc-700"
                />
                <label htmlFor="chk-grp-req" className="text-zinc-300 font-medium cursor-pointer">
                  Seleção obrigatória pelo cliente
                </label>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1.5">Instrução / Descrição</label>
                <input
                  type="text"
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  placeholder="Ex: Escolha até 4 adicionais saborosos"
                  className="w-full px-3 py-2 rounded-lg bg-[#0C0C0C] border border-zinc-800 text-zinc-200 focus:outline-none focus:border-[#FF6A00]"
                />
              </div>

              <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsGroupModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingGroup}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#FF6A00] hover:bg-[#e05d00] text-black font-semibold text-xs transition disabled:opacity-50"
                >
                  {isSavingGroup ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{editingGroup ? "Salvar Alterações" : "Criar Grupo"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Opção */}
      {isOptionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsOptionModalOpen(false)} />

          <div className="relative w-full max-w-sm bg-[#141414] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-10 text-xs">
            <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="font-bebas text-2xl tracking-wide text-[#F3E3C7]">
                {editingOption ? "Editar Opção" : "Nova Opção"}
              </h2>
              <button onClick={() => setIsOptionModalOpen(false)} className="p-1 text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOption} className="p-6 space-y-4">
              <div>
                <label className="block text-zinc-300 font-medium mb-1.5">Nome do Item *</label>
                <input
                  type="text"
                  value={optionName}
                  onChange={(e) => setOptionName(e.target.value)}
                  placeholder="Ex: Bacon Crocante Extra"
                  required
                  className="w-full px-3 py-2 rounded-lg bg-[#0C0C0C] border border-zinc-800 text-zinc-200 focus:outline-none focus:border-[#FF6A00]"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1.5">Preço Adicional (R$)</label>
                <input
                  type="text"
                  value={optionPriceReais}
                  onChange={(e) => setOptionPriceReais(e.target.value)}
                  placeholder="4,00"
                  required
                  className="w-full px-3 py-2 rounded-lg bg-[#0C0C0C] border border-zinc-800 text-zinc-200 font-mono focus:outline-none focus:border-[#FF6A00]"
                />
                <span className="text-[10px] text-zinc-500">Deixe 0,00 para opções sem cobrança extra.</span>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1.5">Descrição Adicional</label>
                <input
                  type="text"
                  value={optionDescription}
                  onChange={(e) => setOptionDescription(e.target.value)}
                  placeholder="Ex: 3 fatias crocantes"
                  className="w-full px-3 py-2 rounded-lg bg-[#0C0C0C] border border-zinc-800 text-zinc-200 focus:outline-none focus:border-[#FF6A00]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="chk-opt-avail"
                  checked={optionIsAvailable}
                  onChange={(e) => setOptionIsAvailable(e.target.checked)}
                  className="w-4 h-4 rounded text-[#FF6A00] focus:ring-0 bg-zinc-900 border-zinc-700"
                />
                <label htmlFor="chk-opt-avail" className="text-zinc-300 font-medium cursor-pointer">
                  Disponível para seleção
                </label>
              </div>

              <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOptionModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingOption}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#FF6A00] hover:bg-[#e05d00] text-black font-semibold text-xs transition disabled:opacity-50"
                >
                  {isSavingOption ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{editingOption ? "Salvar Opção" : "Adicionar Opção"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

