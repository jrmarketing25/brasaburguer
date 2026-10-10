"use client";

import React from "react";
import {
  CustomerInfo,
  DeliveryAddress,
  FulfillmentType,
  NeighborhoodDeliveryFee,
} from "@/types/store";
import { formatCurrency } from "@/lib/utils";
import { maskPhone, maskCep, sanitizeAddressNumber } from "@/lib/utils/masks";
import { Bike, Store, MapPin, Phone, User, AlertCircle, Hash } from "lucide-react";

interface CheckoutFulfillmentProps {
  fulfillmentType: FulfillmentType;
  onFulfillmentTypeChange: (type: FulfillmentType) => void;
  customer: CustomerInfo;
  onCustomerChange: (customer: CustomerInfo) => void;
  address: DeliveryAddress;
  onAddressChange: (address: DeliveryAddress) => void;
  neighborhoodFees?: NeighborhoodDeliveryFee[];
  allowOnlyRegisteredNeighborhoods?: boolean;
  storeAddress: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  errors: Record<string, string>;
}

export function CheckoutFulfillment({
  fulfillmentType,
  onFulfillmentTypeChange,
  customer,
  onCustomerChange,
  address,
  onAddressChange,
  neighborhoodFees = [],
  allowOnlyRegisteredNeighborhoods = false,
  storeAddress,
  errors,
}: CheckoutFulfillmentProps) {
  // Atualiza campo do cliente aplicando máscara ou sanitização
  const handleCustomerPhoneChange = (rawValue: string) => {
    const masked = maskPhone(rawValue);
    onCustomerChange({ ...customer, phone: masked });
  };

  const handleCustomerNameChange = (rawValue: string) => {
    onCustomerChange({ ...customer, name: rawValue });
  };

  const handleAddressCepChange = (rawValue: string) => {
    const masked = maskCep(rawValue);
    onAddressChange({ ...address, cep: masked });
  };

  const handleAddressField = (field: keyof DeliveryAddress, value: string) => {
    if (field === "number") {
      onAddressChange({ ...address, number: sanitizeAddressNumber(value) });
    } else {
      onAddressChange({ ...address, [field]: value });
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-brasa-border bg-brasa-surface p-4 sm:p-5">
      <h3 className="font-bebas text-lg sm:text-xl tracking-wide uppercase text-brasa-cream">
        1. Como deseja receber seu pedido?
      </h3>

      {/* Seletor de Modalidade: Entrega vs Retirada */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => onFulfillmentTypeChange("delivery")}
          className={`flex items-center justify-center gap-2 rounded-xl h-12 px-3 text-xs sm:text-sm font-bold border transition-all active:scale-95 ${
            fulfillmentType === "delivery"
              ? "bg-brasa-orange/15 border-brasa-orange text-brasa-cream shadow-sm"
              : "bg-brasa-bg border-brasa-border text-zinc-400 hover:text-brasa-cream"
          }`}
        >
          <Bike className="h-4 w-4 text-brasa-orange shrink-0" />
          <span>Entrega</span>
        </button>

        <button
          type="button"
          onClick={() => onFulfillmentTypeChange("pickup")}
          className={`flex items-center justify-center gap-2 rounded-xl h-12 px-3 text-xs sm:text-sm font-bold border transition-all active:scale-95 ${
            fulfillmentType === "pickup"
              ? "bg-brasa-orange/15 border-brasa-orange text-brasa-cream shadow-sm"
              : "bg-brasa-bg border-brasa-border text-zinc-400 hover:text-brasa-cream"
          }`}
        >
          <Store className="h-4 w-4 text-brasa-orange shrink-0" />
          <span className="truncate">Retirada (Taxa R$ 0)</span>
        </button>
      </div>

      {/* Dados do Cliente (Comuns para Entrega e Retirada) */}
      <div className="space-y-3 pt-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Campo Nome */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5 mb-1.5">
              <User className="h-3.5 w-3.5 text-brasa-orange shrink-0" />
              <span>Seu Nome *</span>
            </label>
            <input
              type="text"
              name="name"
              autoComplete="name"
              placeholder="Ex.: João Silva"
              value={customer.name}
              onChange={(e) => handleCustomerNameChange(e.target.value)}
              className={`w-full rounded-xl border bg-brasa-bg px-3.5 h-11 text-sm text-brasa-cream placeholder:text-zinc-600 focus:outline-none transition-colors ${
                errors.name
                  ? "border-red-500 focus:ring-1 focus:ring-red-500"
                  : "border-brasa-border focus:border-brasa-orange focus:ring-1 focus:ring-brasa-orange"
              }`}
            />
            {errors.name && (
              <p className="text-[11px] text-red-400 mt-1.5 flex items-center gap-1">
                <AlertCircle className="h-3 w-3 shrink-0" />
                <span>{errors.name}</span>
              </p>
            )}
          </div>

          {/* Campo Telefone / WhatsApp com máscara */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5 mb-1.5">
              <Phone className="h-3.5 w-3.5 text-brasa-orange shrink-0" />
              <span>Telefone / WhatsApp *</span>
            </label>
            <input
              type="tel"
              name="phone"
              inputMode="tel"
              autoComplete="tel"
              placeholder="(00) 00000-0000"
              value={customer.phone}
              onChange={(e) => handleCustomerPhoneChange(e.target.value)}
              className={`w-full rounded-xl border bg-brasa-bg px-3.5 h-11 text-sm text-brasa-cream placeholder:text-zinc-600 focus:outline-none font-mono transition-colors ${
                errors.phone
                  ? "border-red-500 focus:ring-1 focus:ring-red-500"
                  : "border-brasa-border focus:border-brasa-orange focus:ring-1 focus:ring-brasa-orange"
              }`}
            />
            {errors.phone && (
              <p className="text-[11px] text-red-400 mt-1.5 flex items-center gap-1">
                <AlertCircle className="h-3 w-3 shrink-0" />
                <span>{errors.phone}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Endereço de Entrega (Apenas se modalidade for Entrega) */}
      {fulfillmentType === "delivery" ? (
        <div className="space-y-3 pt-3 border-t border-brasa-border/60">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300">
            <MapPin className="h-3.5 w-3.5 text-brasa-orange shrink-0" />
            <span>Endereço para entrega</span>
          </div>

          {/* CEP e Bairro */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Campo CEP */}
            <div>
              <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                CEP (Opcional)
              </label>
              <input
                type="text"
                name="postal-code"
                inputMode="numeric"
                autoComplete="postal-code"
                placeholder="00000-000"
                maxLength={9}
                value={address.cep || ""}
                onChange={(e) => handleAddressCepChange(e.target.value)}
                className={`w-full rounded-xl border bg-brasa-bg px-3.5 h-11 text-sm text-brasa-cream font-mono placeholder:text-zinc-600 focus:outline-none transition-colors ${
                  errors.cep
                    ? "border-red-500 focus:ring-1 focus:ring-red-500"
                    : "border-brasa-border focus:border-brasa-orange focus:ring-1 focus:ring-brasa-orange"
                }`}
              />
              {errors.cep && (
                <p className="text-[11px] text-red-400 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  <span>{errors.cep}</span>
                </p>
              )}
            </div>

            {/* Bairro com seletor ou input */}
            <div>
              <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                Bairro *
              </label>
              {neighborhoodFees.length > 0 ? (
                <select
                  value={address.neighborhood}
                  onChange={(e) => handleAddressField("neighborhood", e.target.value)}
                  className={`w-full rounded-xl border bg-brasa-bg px-3.5 h-11 text-sm text-brasa-cream focus:outline-none transition-colors ${
                    errors.neighborhood
                      ? "border-red-500 focus:ring-1 focus:ring-red-500"
                      : "border-brasa-border focus:border-brasa-orange focus:ring-1 focus:ring-brasa-orange"
                  }`}
                >
                  <option value="">Selecione o seu bairro...</option>
                  {neighborhoodFees.map((n) => (
                    <option key={n.name} value={n.name}>
                      {n.name} — Taxa: {formatCurrency(n.feeCents)}
                    </option>
                  ))}
                  {!allowOnlyRegisteredNeighborhoods && (
                    <option value="Outro">Outro bairro da região</option>
                  )}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="Nome do seu bairro"
                  value={address.neighborhood}
                  onChange={(e) => handleAddressField("neighborhood", e.target.value)}
                  className={`w-full rounded-xl border bg-brasa-bg px-3.5 h-11 text-sm text-brasa-cream placeholder:text-zinc-600 focus:outline-none transition-colors ${
                    errors.neighborhood
                      ? "border-red-500 focus:ring-1 focus:ring-red-500"
                      : "border-brasa-border focus:border-brasa-orange focus:ring-1 focus:ring-brasa-orange"
                  }`}
                />
              )}
              {errors.neighborhood && (
                <p className="text-[11px] text-red-400 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  <span>{errors.neighborhood}</span>
                </p>
              )}
            </div>
          </div>

          {/* Rua / Avenida e Número (Layout responsivo com coluna única no celular para evitar esmagamento) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                Rua / Avenida *
              </label>
              <input
                type="text"
                name="street"
                autoComplete="address-line1"
                placeholder="Ex: Rua das Flores"
                value={address.street}
                onChange={(e) => handleAddressField("street", e.target.value)}
                className={`w-full rounded-xl border bg-brasa-bg px-3.5 h-11 text-sm text-brasa-cream placeholder:text-zinc-600 focus:outline-none transition-colors ${
                  errors.street
                    ? "border-red-500 focus:ring-1 focus:ring-red-500"
                    : "border-brasa-border focus:border-brasa-orange focus:ring-1 focus:ring-brasa-orange"
                }`}
              />
              {errors.street && (
                <p className="text-[11px] text-red-400 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  <span>{errors.street}</span>
                </p>
              )}
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-400 block mb-1 flex items-center gap-1">
                <Hash className="h-3 w-3 text-brasa-orange shrink-0" />
                <span>Número *</span>
              </label>
              <input
                type="text"
                name="number"
                autoComplete="address-line2"
                placeholder="123 ou S/N"
                value={address.number}
                onChange={(e) => handleAddressField("number", e.target.value)}
                className={`w-full rounded-xl border bg-brasa-bg px-3.5 h-11 text-sm text-brasa-cream placeholder:text-zinc-600 focus:outline-none transition-colors ${
                  errors.number
                    ? "border-red-500 focus:ring-1 focus:ring-red-500"
                    : "border-brasa-border focus:border-brasa-orange focus:ring-1 focus:ring-brasa-orange"
                }`}
              />
              {errors.number && (
                <p className="text-[11px] text-red-400 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  <span>{errors.number}</span>
                </p>
              )}
            </div>
          </div>

          {/* Complemento e Ponto de Referência */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                Complemento (Opcional)
              </label>
              <input
                type="text"
                placeholder="Apto 42, Bloco B..."
                value={address.complement || ""}
                onChange={(e) => handleAddressField("complement", e.target.value)}
                className="w-full rounded-xl border border-brasa-border bg-brasa-bg px-3.5 h-11 text-sm text-brasa-cream placeholder:text-zinc-600 focus:border-brasa-orange focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                Ponto de Referência (Opcional)
              </label>
              <input
                type="text"
                placeholder="Próximo à padaria..."
                value={address.reference || ""}
                onChange={(e) => handleAddressField("reference", e.target.value)}
                className="w-full rounded-xl border border-brasa-border bg-brasa-bg px-3.5 h-11 text-sm text-brasa-cream placeholder:text-zinc-600 focus:border-brasa-orange focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>
      ) : (
        /* Informações para Retirada no Restaurante */
        <div className="rounded-xl border border-brasa-border/80 bg-brasa-bg/70 p-4 space-y-1.5 text-xs">
          <div className="flex items-center gap-2 text-brasa-orange font-semibold">
            <Store className="h-4 w-4 shrink-0" />
            <span>Local de Retirada:</span>
          </div>
          <p className="text-zinc-300 font-medium">
            {storeAddress.street}, {storeAddress.number} — {storeAddress.neighborhood}
          </p>
          <p className="text-zinc-400 text-[11px]">
            {storeAddress.city} - {storeAddress.state} • Tempo estimado: 20-30 min
          </p>
        </div>
      )}
    </div>
  );
}
