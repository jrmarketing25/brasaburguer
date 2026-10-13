"use client";

import React, { useState, useEffect } from "react";
import {
  Truck,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  ShieldCheck,
  Building,
} from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatCentsToBRL, parseBRLToCents } from "@/lib/utils/formatters";

interface DeliveryZoneRow {
  id: string;
  name: string;
  fee_cents: number;
  estimated_minutes: number | null;
  is_active: boolean;
}

interface DeliveryGeneralSettings {
  allow_delivery: boolean;
  allow_pickup: boolean;
  min_order_cents: number;
  free_delivery_threshold_cents: number | null;
  delivery_fee_cents: number;
  estimated_delivery_time_min: number;
  estimated_delivery_time_max: number;
}

const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID || "a0000000-0000-0000-0000-000000000001";

export default function AdminEntregasPage() {
  const [zones, setZones] = useState<DeliveryZoneRow[]>([]);
  const [settings, setSettings] = useState<DeliveryGeneralSettings>({
    allow_delivery: true,
    allow_pickup: true,
    min_order_cents: 2000,
    free_delivery_threshold_cents: 10000,
    delivery_fee_cents: 690,
    estimated_delivery_time_min: 35,
    estimated_delivery_time_max: 50,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Form states para configurações gerais
  const [minOrderReais, setMinOrderReais] = useState("20,00");
  const [freeThresholdReais, setFreeThresholdReais] = useState("100,00");
  const [defaultFeeReais, setDefaultFeeReais] = useState("6,90");
  const [timeMin, setTimeMin] = useState("35");
  const [timeMax, setTimeMax] = useState("50");

  // Modal Bairro / Zona
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<DeliveryZoneRow | null>(null);
  const [zoneName, setZoneName] = useState("");
  const [zoneFeeReais, setZoneFeeReais] = useState("7,00");
  const [zoneTime, setZoneTime] = useState("35");
  const [zoneIsActive, setZoneIsActive] = useState(true);
  const [isSavingZone, setIsSavingZone] = useState(false);

  const fetchDeliveryData = async () => {
    setIsLoading(true);
    const client = getSupabaseBrowserClient();
    if (!client) return;

    try {
      // 1. Configurações gerais
      const { data: settsData } = await client
        .from("store_settings")
        .select(`
          allow_delivery,
          allow_pickup,
          min_order_cents,
          free_delivery_threshold_cents,
          delivery_fee_cents,
          estimated_delivery_time_min,
          estimated_delivery_time_max
        `)
        .eq("store_id", STORE_ID)
        .single();

      if (settsData) {
        setSettings(settsData);
        setMinOrderReais((settsData.min_order_cents / 100).toFixed(2).replace(".", ","));
        setFreeThresholdReais(
          settsData.free_delivery_threshold_cents
            ? (settsData.free_delivery_threshold_cents / 100).toFixed(2).replace(".", ",")
            : ""
        );
        setDefaultFeeReais((settsData.delivery_fee_cents / 100).toFixed(2).replace(".", ","));
        setTimeMin(String(settsData.estimated_delivery_time_min || 35));
        setTimeMax(String(settsData.estimated_delivery_time_max || 50));
      }

      // 2. Zonas de entrega
      const { data: zonesData, error: zonesErr } = await client
        .from("delivery_zones")
        .select("id, name, fee_cents, estimated_minutes, is_active")
        .eq("store_id", STORE_ID)
        .order("name", { ascending: true });

      if (zonesErr) throw zonesErr;
      setZones(zonesData || []);
    } catch (err: any) {
      console.error("Erro ao carregar configurações de entrega:", err);
      alert(`Falha ao carregar entregas: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryData();
  }, []);

  // Salvar configurações gerais
  const handleSaveGeneralSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const client = getSupabaseBrowserClient();
    if (!client) return;

    const minCents = parseBRLToCents(minOrderReais);
    const freeCents = freeThresholdReais ? parseBRLToCents(freeThresholdReais) : null;
    const feeCents = parseBRLToCents(defaultFeeReais);

    try {
      setIsSavingSettings(true);
      const { error } = await client
        .from("store_settings")
        .update({
          allow_delivery: settings.allow_delivery,
          allow_pickup: settings.allow_pickup,
          min_order_cents: minCents,
          free_delivery_threshold_cents: freeCents,
          delivery_fee_cents: feeCents,
          estimated_delivery_time_min: parseInt(timeMin, 10) || 30,
          estimated_delivery_time_max: parseInt(timeMax, 10) || 50,
        })
        .eq("store_id", STORE_ID);

      if (error) throw error;
      alert("Configurações logísticas atualizadas com sucesso!");
    } catch (err: any) {
      alert(`Erro ao salvar configurações: ${err.message}`);
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Abrir modal de zona
  const handleOpenZoneModal = (zone?: DeliveryZoneRow) => {
    if (zone) {
      setEditingZone(zone);
      setZoneName(zone.name);
      setZoneFeeReais((zone.fee_cents / 100).toFixed(2).replace(".", ","));
      setZoneTime(String(zone.estimated_minutes || 35));
      setZoneIsActive(zone.is_active);
    } else {
      setEditingZone(null);
      setZoneName("");
      setZoneFeeReais("7,00");
      setZoneTime("35");
      setZoneIsActive(true);
    }
    setIsZoneModalOpen(true);
  };

  // Salvar zona
  const handleSaveZone = async (e: React.FormEvent) => {
    e.preventDefault();
    const client = getSupabaseBrowserClient();
    if (!client) return;

    if (!zoneName.trim()) {
      alert("O nome da região/bairro é obrigatório.");
      return;
    }

    const feeCents = parseBRLToCents(zoneFeeReais);

    try {
      setIsSavingZone(true);
      const payload = {
        store_id: STORE_ID,
        name: zoneName.trim(),
        fee_cents: feeCents,
        estimated_minutes: parseInt(zoneTime, 10) || 35,
        is_active: zoneIsActive,
      };

      if (editingZone) {
        const { error } = await client
          .from("delivery_zones")
          .update(payload)
          .eq("id", editingZone.id);
        if (error) throw error;
      } else {
        const { error } = await client.from("delivery_zones").insert(payload);
        if (error) throw error;
      }

      setIsZoneModalOpen(false);
      await fetchDeliveryData();
    } catch (err: any) {
      alert(`Erro ao salvar zona: ${err.message}`);
    } finally {
      setIsSavingZone(false);
    }
  };

  // Toggle rápido de ativação de bairro
  const handleToggleZone = async (zone: DeliveryZoneRow) => {
    const client = getSupabaseBrowserClient();
    if (!client) return;

    const newStatus = !zone.is_active;
    setZones((prev) =>
      prev.map((z) => (z.id === zone.id ? { ...z, is_active: newStatus } : z))
    );

    try {
      const { error } = await client
        .from("delivery_zones")
        .update({ is_active: newStatus })
        .eq("id", zone.id);
      if (error) throw error;
    } catch (err: any) {
      alert(`Erro ao alterar status da região: ${err.message}`);
      fetchDeliveryData();
    }
  };

  // Excluir bairro
  const handleDeleteZone = async (zone: DeliveryZoneRow) => {
    const confirmDelete = window.confirm(`Deseja remover a região "${zone.name}"?`);
    if (!confirmDelete) return;

    const client = getSupabaseBrowserClient();
    if (!client) return;

    try {
      const { error } = await client.from("delivery_zones").delete().eq("id", zone.id);
      if (error) throw error;
      await fetchDeliveryData();
    } catch (err: any) {
      alert(`Erro ao excluir região: ${err.message}`);
    }
  };

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div>
        <h1 className="font-bebas text-3xl tracking-wide text-[#F3E3C7]">
          Logística, Entregas & Taxas
        </h1>
        <p className="text-xs text-zinc-400">
          Configure as modalidades de atendimento, taxas por bairro e limites de frete grátis.
        </p>
      </div>

      {/* Seção 1: Configurações Gerais */}
      <div className="rounded-xl border border-zinc-800 bg-[#161616] p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FF6A00]/10 flex items-center justify-center text-[#FF6A00]">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
                Parâmetros Gerais de Operação
              </h2>
              <span className="text-[11px] text-zinc-500">
                Aplicados automaticamente no carrinho e no cálculo de entrega do checkout.
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveGeneralSettings} className="space-y-5 text-xs">
          {/* Switches de Modalidade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-lg border border-zinc-800 bg-[#0C0C0C] flex items-center justify-between">
              <div>
                <span className="font-medium text-zinc-200 block">Modalidade Delivery</span>
                <span className="text-[11px] text-zinc-500">
                  Permite entregas no endereço do cliente
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.allow_delivery}
                onChange={(e) =>
                  setSettings({ ...settings, allow_delivery: e.target.checked })
                }
                className="w-4 h-4 rounded text-[#FF6A00] focus:ring-0 bg-zinc-900 border-zinc-700"
              />
            </div>

            <div className="p-3.5 rounded-lg border border-zinc-800 bg-[#0C0C0C] flex items-center justify-between">
              <div>
                <span className="font-medium text-zinc-200 block">Retirada no Balcão</span>
                <span className="text-[11px] text-zinc-500">
                  Cliente retira o pedido no endereço da loja
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.allow_pickup}
                onChange={(e) =>
                  setSettings({ ...settings, allow_pickup: e.target.checked })
                }
                className="w-4 h-4 rounded text-[#FF6A00] focus:ring-0 bg-zinc-900 border-zinc-700"
              />
            </div>
          </div>

          {/* Campos Financeiros */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-zinc-300 font-medium mb-1.5">
                Taxa de Entrega Padrão (R$)
              </label>
              <input
                type="text"
                value={defaultFeeReais}
                onChange={(e) => setDefaultFeeReais(e.target.value)}
                placeholder="6,90"
                required
                className="w-full px-3 py-2 rounded-lg bg-[#0C0C0C] border border-zinc-800 text-zinc-200 font-mono focus:outline-none focus:border-[#FF6A00]"
              />
              <span className="text-[10px] text-zinc-500">Usada quando o bairro não tiver taxa cadastrada.</span>
            </div>

            <div>
              <label className="block text-zinc-300 font-medium mb-1.5">
                Pedido Mínimo (R$)
              </label>
              <input
                type="text"
                value={minOrderReais}
                onChange={(e) => setMinOrderReais(e.target.value)}
                placeholder="20,00"
                required
                className="w-full px-3 py-2 rounded-lg bg-[#0C0C0C] border border-zinc-800 text-zinc-200 font-mono focus:outline-none focus:border-[#FF6A00]"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-medium mb-1.5">
                Frete Grátis Acima de (R$)
              </label>
              <input
                type="text"
                value={freeThresholdReais}
                onChange={(e) => setFreeThresholdReais(e.target.value)}
                placeholder="100,00 (ou deixe vazio)"
                className="w-full px-3 py-2 rounded-lg bg-[#0C0C0C] border border-zinc-800 text-zinc-200 font-mono focus:outline-none focus:border-[#FF6A00]"
              />
            </div>
          </div>

          {/* Tempos Estimados */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-300 font-medium mb-1.5">
                Tempo Estimado Mínimo (minutos)
              </label>
              <input
                type="number"
                value={timeMin}
                onChange={(e) => setTimeMin(e.target.value)}
                min={10}
                max={180}
                required
                className="w-full px-3 py-2 rounded-lg bg-[#0C0C0C] border border-zinc-800 text-zinc-200 font-mono focus:outline-none focus:border-[#FF6A00]"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-medium mb-1.5">
                Tempo Estimado Máximo (minutos)
              </label>
              <input
                type="number"
                value={timeMax}
                onChange={(e) => setTimeMax(e.target.value)}
                min={15}
                max={240}
                required
                className="w-full px-3 py-2 rounded-lg bg-[#0C0C0C] border border-zinc-800 text-zinc-200 font-mono focus:outline-none focus:border-[#FF6A00]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSavingSettings}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#FF6A00] hover:bg-[#e05d00] text-black font-semibold text-xs transition disabled:opacity-50"
            >
              {isSavingSettings ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Salvar Parâmetros Logísticos</span>
            </button>
          </div>
        </form>
      </div>

      {/* Seção 2: Bairros e Taxas Personalizadas */}
      <div className="rounded-xl border border-zinc-800 bg-[#161616] overflow-hidden">
        <div className="p-5 border-b border-zinc-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-200 flex items-center gap-2">
              <Building className="w-4 h-4 text-[#FF6A00]" />
              <span>Bairros e Taxas Específicas ({zones.length})</span>
            </h2>
            <span className="text-[11px] text-zinc-500">
              Taxas calculadas automaticamente no checkout quando o cliente escolhe o bairro.
            </span>
          </div>

          <button
            onClick={() => handleOpenZoneModal()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs transition self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5 text-[#FF6A00]" />
            <span>Cadastrar Região / Bairro</span>
          </button>
        </div>

        {/* Tabela de Bairros */}
        {isLoading ? (
          <div className="p-12 text-center text-zinc-400 flex flex-col items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-[#FF6A00]" />
            <span className="text-xs">Carregando zonas de entrega...</span>
          </div>
        ) : zones.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 text-xs">
            Nenhuma região específica cadastrada. O sistema aplicará a taxa padrão para todos os bairros.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-800/80 bg-zinc-950/40 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  <th className="py-3 px-4">Bairro / Região</th>
                  <th className="py-3 px-4">Taxa de Entrega</th>
                  <th className="py-3 px-4">Tempo Médio</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {zones.map((zone) => (
                  <tr key={zone.id} className="hover:bg-zinc-800/20 transition">
                    <td className="py-3 px-4 font-medium text-zinc-200">{zone.name}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-[#F3E3C7]">
                      {formatCentsToBRL(zone.fee_cents)}
                    </td>
                    <td className="py-3 px-4 text-zinc-400 font-mono">
                      {zone.estimated_minutes ? `${zone.estimated_minutes} min` : "Padrão"}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggleZone(zone)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition ${
                          zone.is_active
                            ? "bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/60"
                            : "bg-zinc-800 border border-zinc-700 text-zinc-400 hover:bg-zinc-700"
                        }`}
                      >
                        {zone.is_active ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>Ativa</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-zinc-500" />
                            <span>Pausada</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenZoneModal(zone)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteZone(zone)}
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

      {/* Modal Bairro */}
      {isZoneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsZoneModalOpen(false)} />

          <div className="relative w-full max-w-sm bg-[#141414] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-10 text-xs">
            <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="font-bebas text-2xl tracking-wide text-[#F3E3C7]">
                {editingZone ? "Editar Região" : "Cadastrar Região / Bairro"}
              </h2>
              <button onClick={() => setIsZoneModalOpen(false)} className="p-1 text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveZone} className="p-6 space-y-4">
              <div>
                <label className="block text-zinc-300 font-medium mb-1.5">Nome do Bairro *</label>
                <input
                  type="text"
                  value={zoneName}
                  onChange={(e) => setZoneName(e.target.value)}
                  placeholder="Ex: Pinheiros"
                  required
                  className="w-full px-3 py-2 rounded-lg bg-[#0C0C0C] border border-zinc-800 text-zinc-200 focus:outline-none focus:border-[#FF6A00]"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1.5">Taxa de Entrega (R$) *</label>
                <input
                  type="text"
                  value={zoneFeeReais}
                  onChange={(e) => setZoneFeeReais(e.target.value)}
                  placeholder="8,00"
                  required
                  className="w-full px-3 py-2 rounded-lg bg-[#0C0C0C] border border-zinc-800 text-zinc-200 font-mono focus:outline-none focus:border-[#FF6A00]"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1.5">Tempo Médio Estimado (min)</label>
                <input
                  type="number"
                  value={zoneTime}
                  onChange={(e) => setZoneTime(e.target.value)}
                  min={10}
                  max={120}
                  className="w-full px-3 py-2 rounded-lg bg-[#0C0C0C] border border-zinc-800 text-zinc-200 font-mono focus:outline-none focus:border-[#FF6A00]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="chk-zone-active"
                  checked={zoneIsActive}
                  onChange={(e) => setZoneIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-[#FF6A00] focus:ring-0 bg-zinc-900 border-zinc-700"
                />
                <label htmlFor="chk-zone-active" className="text-zinc-300 font-medium cursor-pointer">
                  Região ativa para entregas
                </label>
              </div>

              <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsZoneModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingZone}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#FF6A00] hover:bg-[#e05d00] text-black font-semibold text-xs transition disabled:opacity-50"
                >
                  {isSavingZone ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{editingZone ? "Salvar" : "Cadastrar"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

