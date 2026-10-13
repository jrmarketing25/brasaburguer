"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Settings,
  Store,
  Phone,
  MapPin,
  Clock,
  CreditCard,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { uploadStorageFile } from "@/lib/supabase/storage";

interface StoreData {
  name: string;
  slug: string;
  whatsapp: string;
  phone: string | null;
  email: string | null;
  cnpj: string | null;
  is_active: boolean;
}

interface StoreSettingsData {
  slogan: string | null;
  description: string | null;
  address_street: string | null;
  address_number: string | null;
  address_neighborhood: string | null;
  address_city: string | null;
  address_state: string | null;
  address_zip: string | null;
  accepted_payment_methods: string[];
  opening_hours: {
    dayOfWeek: string;
    open: string;
    close: string;
    isOpenToday: boolean;
  }[];
}

const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID || "a0000000-0000-0000-0000-000000000001";

const DAYS_OF_WEEK = [
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
  "Domingo",
];

export default function AdminConfiguracoesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Store data
  const [storeName, setStoreName] = useState("BRASA BURGERS");
  const [storeWhatsapp, setStoreWhatsapp] = useState("5511999999999");
  const [storePhone, setStorePhone] = useState("(11) 99999-9999");
  const [storeEmail, setStoreEmail] = useState("contato@brasaburgers.com.br");
  const [storeCnpj, setStoreCnpj] = useState("00.000.000/0001-99");
  const [storeIsOpen, setStoreIsOpen] = useState(true);

  // Settings data
  const [slogan, setSlogan] = useState("Sabor que une pessoas.");
  const [description, setDescription] = useState(
    "Hambúrgueres artesanais na brasa viva, ingredientes selecionados e molhos especiais."
  );
  const [logoUrl, setLogoUrl] = useState("/images/brand/logo-brasa-vetorial.svg");
  const [faviconUrl, setFaviconUrl] = useState("/images/brand/favicon.svg");
  const [bannerUrl, setBannerUrl] = useState("/images/banner/hero-churrasqueira.webp");
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [street, setStreet] = useState("Av. Principal dos Burgers");
  const [number, setNumber] = useState("1234");
  const [neighborhood, setNeighborhood] = useState("Centro Gastronômico");
  const [city, setCity] = useState("São Paulo");
  const [state, setState] = useState("SP");
  const [zip, setZip] = useState("01000-000");

  // Payment methods
  const [paymentPix, setPaymentPix] = useState(true);
  const [paymentCash, setPaymentCash] = useState(true);
  const [paymentCardDelivery, setPaymentCardDelivery] = useState(true);

  // Opening hours
  const [openingHours, setOpeningHours] = useState<
    { dayOfWeek: string; open: string; close: string; isOpenToday: boolean }[]
  >(
    DAYS_OF_WEEK.map((day) => ({
      dayOfWeek: day,
      open: "18:00",
      close: "23:00",
      isOpenToday: true,
    }))
  );

  const fetchStoreConfig = async () => {
    setIsLoading(true);
    const client = getSupabaseBrowserClient();
    if (!client) return;

    try {
      const { data: store, error: sErr } = await client
        .from("stores")
        .select("name, slug, whatsapp, phone, email, cnpj, is_active, store_settings(*)")
        .eq("id", STORE_ID)
        .single();

      if (sErr) throw sErr;

      if (store) {
        setStoreName(store.name);
        setStoreWhatsapp(store.whatsapp);
        setStorePhone(store.phone || "");
        setStoreEmail(store.email || "");
        setStoreCnpj(store.cnpj || "");
        setStoreIsOpen(store.is_active ?? true);

        const setts = Array.isArray(store.store_settings)
          ? store.store_settings[0]
          : store.store_settings;

        if (setts) {
          setSlogan(setts.slogan || "");
          setDescription(setts.description || "");
          if (setts.logo_url) setLogoUrl(setts.logo_url);
          if (setts.favicon_url) setFaviconUrl(setts.favicon_url);
          if (setts.banner_url) setBannerUrl(setts.banner_url);
          setStreet(setts.address_street || "");
          setNumber(setts.address_number || "");
          setNeighborhood(setts.address_neighborhood || "");
          setCity(setts.address_city || "");
          setState(setts.address_state || "");
          setZip(setts.address_zip || "");

          const methods = setts.accepted_payment_methods || [];
          setPaymentPix(methods.includes("pix"));
          setPaymentCash(methods.includes("dinheiro"));
          setPaymentCardDelivery(methods.includes("cartao_entrega"));

          if (Array.isArray(setts.opening_hours) && setts.opening_hours.length > 0) {
            setOpeningHours(setts.opening_hours);
          }
        }
      }
    } catch (err: any) {
      console.error("Erro ao carregar configurações da loja:", err);
      alert(`Falha ao buscar configurações: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStoreConfig();
  }, []);

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    const client = getSupabaseBrowserClient();
    if (!client) return;

    // Validação WhatsApp
    const cleanWhatsapp = storeWhatsapp.replace(/\D/g, "");
    if (cleanWhatsapp.length < 10 || cleanWhatsapp.length > 13) {
      alert("Por favor, insira um número de WhatsApp válido (incluindo DDD, ex: 5511999999999).");
      return;
    }

    const acceptedMethods: string[] = [];
    if (paymentPix) acceptedMethods.push("pix");
    if (paymentCash) acceptedMethods.push("dinheiro");
    if (paymentCardDelivery) acceptedMethods.push("cartao_entrega");

    if (acceptedMethods.length === 0) {
      alert("Selecione pelo menos uma forma de pagamento aceita.");
      return;
    }

    try {
      setIsSaving(true);
      setSaveSuccess(false);

      // 1. Atualizar stores
      const { error: storeErr } = await client
        .from("stores")
        .update({
          name: storeName.trim(),
          whatsapp: cleanWhatsapp,
          phone: storePhone.trim() || null,
          email: storeEmail.trim() || null,
          cnpj: storeCnpj.trim() || null,
          is_active: storeIsOpen,
        })
        .eq("id", STORE_ID);

      if (storeErr) throw storeErr;

      // 2. Atualizar store_settings
      const { error: settsErr } = await client
        .from("store_settings")
        .update({
          slogan: slogan.trim() || null,
          description: description.trim() || null,
          logo_url: logoUrl.trim() || null,
          favicon_url: faviconUrl.trim() || null,
          banner_url: bannerUrl.trim() || null,
          address_street: street.trim() || null,
          address_number: number.trim() || null,
          address_neighborhood: neighborhood.trim() || null,
          address_city: city.trim() || null,
          address_state: state.trim() || null,
          address_zip: zip.trim() || null,
          accepted_payment_methods: acceptedMethods,
          opening_hours: openingHours,
        })
        .eq("store_id", STORE_ID);

      if (settsErr) throw settsErr;

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      alert(`Erro ao salvar configurações: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleHourChange = (
    index: number,
    field: "open" | "close" | "isOpenToday",
    value: any
  ) => {
    setOpeningHours((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-bebas text-3xl tracking-wide text-[#F3E3C7]">
            Configurações da Loja
          </h1>
          <p className="text-xs text-zinc-400">
            Identidade White Label, dados de contato, WhatsApp para pedidos, endereço e horários.
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Configurações salvas e aplicadas ao cardápio!</span>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-zinc-400 flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-[#FF6A00]" />
          <span className="text-xs">Carregando configurações do PostgreSQL...</span>
        </div>
      ) : (
        <form onSubmit={handleSaveAll} className="space-y-6 text-xs">
          {/* Seção 1: Identidade da Loja */}
          <div className="rounded-xl border border-zinc-800 bg-[#161616] p-6 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-200 flex items-center gap-2 border-b border-zinc-800/80 pb-3">
              <Store className="w-4 h-4 text-[#FF6A00]" />
              <span>Identidade Comercial & Status</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-zinc-300 font-medium mb-1.5">Nome Comercial *</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-[#0C0C0C] border border-zinc-800 text-zinc-200 focus:outline-none focus:border-[#FF6A00]"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1.5">Slogan da Marca</label>
                <input
                  type="text"
                  value={slogan}
                  onChange={(e) => setSlogan(e.target.value)}
                  placeholder="Sabor que une pessoas."
                  className="w-full px-3 py-2 rounded-lg bg-[#0C0C0C] border border-zinc-800 text-zinc-200 focus:outline-none focus:border-[#FF6A00]"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-300 font-medium mb-1.5">Descrição Institucional</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#0C0C0C] border border-zinc-800 text-zinc-200 focus:outline-none focus:border-[#FF6A00]"
              />
            </div>

            <div className="pt-2 flex items-center gap-3">
              <input
                type="checkbox"
                id="chk-store-open"
                checked={storeIsOpen}
                onChange={(e) => setStoreIsOpen(e.target.checked)}
                className="w-4 h-4 rounded text-[#FF6A00] focus:ring-0 bg-zinc-900 border-zinc-700"
              />
              <label htmlFor="chk-store-open" className="text-zinc-200 font-medium cursor-pointer">
                Loja aberta e aceitando pedidos (Status Global da Loja)
              </label>
            </div>
          </div>

          {/* Seção 2: Identidade Visual & Branding White Label */}
          <div className="rounded-xl border border-zinc-800 bg-[#161616] p-6 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-200 flex items-center gap-2 border-b border-zinc-800/80 pb-3">
              <ImageIcon className="w-4 h-4 text-[#FF6A00]" />
              <span>Identidade Visual & Fotografias (White Label)</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Logo da Loja */}
              <div className="space-y-3">
                <label className="block text-zinc-300 font-medium">Logotipo da Marca</label>
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-28 rounded-lg border border-zinc-800 bg-[#0C0C0C] flex items-center justify-center overflow-hidden p-2">
                    <Image
                      src={logoUrl || "/images/brand/logo-brasa-vetorial.svg"}
                      alt="Logo da Loja"
                      fill
                      className="object-contain p-1"
                    />
                  </div>

                  <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 cursor-pointer font-medium transition text-xs">
                    {isUploadingLogo ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#FF6A00]" />
                    ) : (
                      <Upload className="w-4 h-4 text-[#FF6A00]" />
                    )}
                    <span>{isUploadingLogo ? "Enviando..." : "Alterar Logo"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploadingLogo}
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          setIsUploadingLogo(true);
                          const fileExt = file.name.split(".").pop();
                          const fileName = `${STORE_ID}/logo_${Date.now()}.${fileExt}`;
                          const { url, error } = await uploadStorageFile("logos", fileName, file);
                          if (error) throw error;
                          if (url) setLogoUrl(url);
                        } catch (err: any) {
                          alert(`Erro ao fazer upload da logo: ${err.message}`);
                        } finally {
                          setIsUploadingLogo(false);
                        }
                      }}
                    />
                  </label>
                </div>
                <input
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="URL pública da Logo"
                  className="w-full px-3 py-1.5 rounded-lg bg-[#0C0C0C] border border-zinc-800 text-zinc-300 text-[11px] focus:outline-none focus:border-[#FF6A00]"
                />
              </div>

              {/* Banner de Destaque */}
              <div className="space-y-3">
                <label className="block text-zinc-300 font-medium">Banner de Destaque (Hero)</label>
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-32 rounded-lg border border-zinc-800 bg-[#0C0C0C] flex items-center justify-center overflow-hidden">
                    <Image
                      src={bannerUrl || "/images/banner/hero-churrasqueira.webp"}
                      alt="Banner de Destaque"
                      fill
                      className="object-cover"
                    />
                  </div>

                  <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 cursor-pointer font-medium transition text-xs">
                    {isUploadingBanner ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#FF6A00]" />
                    ) : (
                      <Upload className="w-4 h-4 text-[#FF6A00]" />
                    )}
                    <span>{isUploadingBanner ? "Enviando..." : "Alterar Banner"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploadingBanner}
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          setIsUploadingBanner(true);
                          const fileExt = file.name.split(".").pop();
                          const fileName = `${STORE_ID}/banner_${Date.now()}.${fileExt}`;
                          const { url, error } = await uploadStorageFile("banners", fileName, file);
                          if (error) throw error;
                          if (url) setBannerUrl(url);
                        } catch (err: any) {
                          alert(`Erro ao fazer upload do banner: ${err.message}`);
                        } finally {
                          setIsUploadingBanner(false);
                        }
                      }}
                    />
                  </label>
                </div>
                <input
                  type="text"
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  placeholder="URL pública do Banner"
                  className="w-full px-3 py-1.5 rounded-lg bg-[#0C0C0C] border border-zinc-800 text-zinc-300 text-[11px] focus:outline-none focus:border-[#FF6A00]"
                />
              </div>
            </div>
          </div>

          {/* Seção 2: Contatos e WhatsApp de Checkout */}
          <div className="rounded-xl border border-zinc-800 bg-[#161616] p-6 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-200 flex items-center gap-2 border-b border-zinc-800/80 pb-3">
              <Phone className="w-4 h-4 text-[#FF6A00]" />
              <span>Canais de Atendimento & WhatsApp de Pedidos</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-zinc-300 font-medium mb-1.5">
                  WhatsApp para Pedidos (com DDI e DDD) *
                </label>
                <input
                  type="text"
                  value={storeWhatsapp}
                  onChange={(e) => setStoreWhatsapp(e.target.value)}
                  placeholder="5511999999999"
                  required
                  className="w-full px-3 py-2 rounded-lg bg-[#0C0C0C] border border-zinc-800 text-zinc-200 font-mono focus:outline-none focus:border-[#FF6A00]"
                />
                <span className="text-[10px] text-zinc-500">
                  Os pedidos finalizados no checkout serão encaminhados para este número.
                </span>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1.5">Telefone Comercial</label>
                <input
                  type="text"
                  value={storePhone}
                  onChange={(e) => setStorePhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="w-full px-3 py-2 rounded-lg bg-[#0C0C0C] border border-zinc-800 text-zinc-200 focus:outline-none focus:border-[#FF6A00]"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1.5">E-mail de Contato</label>
                <input
                  type="email"
                  value={storeEmail}
                  onChange={(e) => setStoreEmail(e.target.value)}
                  placeholder="contato@brasaburgers.com.br"
                  className="w-full px-3 py-2 rounded-lg bg-[#0C0C0C] border border-zinc-800 text-zinc-200 focus:outline-none focus:border-[#FF6A00]"
                />
              </div>
            </div>
          </div>

          {/* Seção 3: Endereço Físico */}
          <div className="rounded-xl border border-zinc-800 bg-[#161616] p-6 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-200 flex items-center gap-2 border-b border-zinc-800/80 pb-3">
              <MapPin className="w-4 h-4 text-[#FF6A00]" />
              <span>Endereço da Hamburgueria</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-3">
                <label className="block text-zinc-300 font-medium mb-1.5">Logradouro / Rua</label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Av. Principal dos Burgers"
                  className="w-full px-3 py-2 rounded-lg bg-[#0C0C0C] border border-zinc-800 text-zinc-200 focus:outline-none focus:border-[#FF6A00]"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1.5">Número</label>
                <input
                  type="text"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  placeholder="1234"
                  className="w-full px-3 py-2 rounded-lg bg-[#0C0C0C] border border-zinc-800 text-zinc-200 focus:outline-none focus:border-[#FF6A00]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-zinc-300 font-medium mb-1.5">Bairro</label>
                <input
                  type="text"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  placeholder="Centro Gastronômico"
                  className="w-full px-3 py-2 rounded-lg bg-[#0C0C0C] border border-zinc-800 text-zinc-200 focus:outline-none focus:border-[#FF6A00]"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1.5">Cidade</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="São Paulo"
                  className="w-full px-3 py-2 rounded-lg bg-[#0C0C0C] border border-zinc-800 text-zinc-200 focus:outline-none focus:border-[#FF6A00]"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1.5">CEP</label>
                <input
                  type="text"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  placeholder="01000-000"
                  className="w-full px-3 py-2 rounded-lg bg-[#0C0C0C] border border-zinc-800 text-zinc-200 font-mono focus:outline-none focus:border-[#FF6A00]"
                />
              </div>
            </div>
          </div>

          {/* Seção 4: Formas de Pagamento */}
          <div className="rounded-xl border border-zinc-800 bg-[#161616] p-6 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-200 flex items-center gap-2 border-b border-zinc-800/80 pb-3">
              <CreditCard className="w-4 h-4 text-[#FF6A00]" />
              <span>Modalidades de Pagamento Habilitadas</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="p-3.5 rounded-lg border border-zinc-800 bg-[#0C0C0C] flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={paymentPix}
                  onChange={(e) => setPaymentPix(e.target.checked)}
                  className="w-4 h-4 rounded text-[#FF6A00] focus:ring-0 bg-zinc-900 border-zinc-700"
                />
                <div>
                  <span className="font-semibold text-zinc-200 block">PIX</span>
                  <span className="text-[11px] text-zinc-500">Chave e QR Code no checkout</span>
                </div>
              </label>

              <label className="p-3.5 rounded-lg border border-zinc-800 bg-[#0C0C0C] flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={paymentCash}
                  onChange={(e) => setPaymentCash(e.target.checked)}
                  className="w-4 h-4 rounded text-[#FF6A00] focus:ring-0 bg-zinc-900 border-zinc-700"
                />
                <div>
                  <span className="font-semibold text-zinc-200 block">Dinheiro</span>
                  <span className="text-[11px] text-zinc-500">Com opção de troco</span>
                </div>
              </label>

              <label className="p-3.5 rounded-lg border border-zinc-800 bg-[#0C0C0C] flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={paymentCardDelivery}
                  onChange={(e) => setPaymentCardDelivery(e.target.checked)}
                  className="w-4 h-4 rounded text-[#FF6A00] focus:ring-0 bg-zinc-900 border-zinc-700"
                />
                <div>
                  <span className="font-semibold text-zinc-200 block">Cartão na Entrega</span>
                  <span className="text-[11px] text-zinc-500">Maquininha com o entregador</span>
                </div>
              </label>
            </div>
          </div>

          {/* Seção 5: Horários de Funcionamento */}
          <div className="rounded-xl border border-zinc-800 bg-[#161616] p-6 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-200 flex items-center gap-2 border-b border-zinc-800/80 pb-3">
              <Clock className="w-4 h-4 text-[#FF6A00]" />
              <span>Horários de Funcionamento Semanais</span>
            </h2>

            <div className="space-y-2">
              {openingHours.map((hour, idx) => (
                <div
                  key={hour.dayOfWeek}
                  className="p-3 rounded-lg border border-zinc-800/70 bg-[#0C0C0C] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 w-40">
                    <input
                      type="checkbox"
                      id={`day-${idx}`}
                      checked={hour.isOpenToday}
                      onChange={(e) => handleHourChange(idx, "isOpenToday", e.target.checked)}
                      className="w-4 h-4 rounded text-[#FF6A00] focus:ring-0 bg-zinc-900 border-zinc-700"
                    />
                    <label htmlFor={`day-${idx}`} className="font-medium text-zinc-200 cursor-pointer">
                      {hour.dayOfWeek}
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-zinc-500">Abre:</span>
                      <input
                        type="time"
                        value={hour.open}
                        disabled={!hour.isOpenToday}
                        onChange={(e) => handleHourChange(idx, "open", e.target.value)}
                        className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-200 font-mono disabled:opacity-40"
                      />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-zinc-500">Fecha:</span>
                      <input
                        type="time"
                        value={hour.close}
                        disabled={!hour.isOpenToday}
                        onChange={(e) => handleHourChange(idx, "close", e.target.value)}
                        className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-200 font-mono disabled:opacity-40"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Botão de Gravação */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#FF6A00] hover:bg-[#e05d00] text-black font-semibold text-xs transition shadow-md shadow-[#FF6A00]/20 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Salvar Todas as Configurações</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

