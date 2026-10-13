"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useCartStore } from "@/lib/store/useCartStore";
import { defaultStoreConfig } from "@/lib/config/store.config";
import { useStoreConfigStore } from "@/lib/store/useStoreConfigStore";
import {
  CartItem,
  CustomerInfo,
  DeliveryAddress,
  FulfillmentType,
  PaymentInfo,
} from "@/types/store";
import {
  CartItemCard,
  CartEmpty,
  CheckoutFulfillment,
  CheckoutPayment,
  OrderSummary,
} from "@/components/cart";
import { ProductDetailsDrawer } from "@/components/store/product-details-drawer";
import {
  formatWhatsAppOrderMessage,
  generateWhatsAppOrderUrl,
} from "@/lib/services/whatsapp";
import {
  validateCustomerName,
  validatePhone,
  validateCep,
  validateChangeAmount,
  validateStoreWhatsApp,
} from "@/lib/utils/validators";
import {
  ArrowLeft,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const getSubtotalProductsCents = useCartStore(
    (state) => state.getSubtotalProductsCents
  );
  const getTotalAddOnsCents = useCartStore(
    (state) => state.getTotalAddOnsCents
  );
  const getTotalItemsCount = useCartStore(
    (state) => state.getTotalItemsCount
  );

  // Estados do Checkout
  const [fulfillmentType, setFulfillmentType] =
    useState<FulfillmentType>("delivery");
  const [customer, setCustomer] = useState<CustomerInfo>({
    name: "",
    phone: "",
  });
  const [address, setAddress] = useState<DeliveryAddress>({
    cep: "",
    neighborhood: "",
    street: "",
    number: "",
    complement: "",
    reference: "",
  });
  const [payment, setPayment] = useState<PaymentInfo>({
    method: "pix",
    needsChange: false,
    changeForCents: undefined,
  });

  // Modais de Edição e Confirmação
  const [editingItem, setEditingItem] = useState<CartItem | null>(null);
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [orderSentUrl, setOrderSentUrl] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const subtotalProductsCents = mounted ? getSubtotalProductsCents() : 0;
  const totalAddOnsCents = mounted ? getTotalAddOnsCents() : 0;
  const storeConfig = useStoreConfigStore((state) => state.config);
  const itemsSubtotalCents = subtotalProductsCents + totalAddOnsCents;
  const itemsCount = mounted ? getTotalItemsCount() : 0;
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auditoria do WhatsApp de destino configurado na loja
  const whatsAppAudit = useMemo(() => {
    return validateStoreWhatsApp(storeConfig.whatsappNumber || defaultStoreConfig.whatsappNumber);
  }, [storeConfig.whatsappNumber]);

  // Cálculo da Taxa de Entrega
  const deliveryFeeCents = useMemo(() => {
    if (fulfillmentType === "pickup") {
      return 0;
    }

    // Regra de Frete Grátis acima do limite
    if (
      storeConfig.delivery.freeDeliveryThresholdCents &&
      itemsSubtotalCents >= storeConfig.delivery.freeDeliveryThresholdCents
    ) {
      return 0;
    }

    // Busca taxa do bairro
    const neighborhoodFees = storeConfig.delivery.neighborhoodFees || [];
    const matchedNeighborhood = neighborhoodFees.find(
      (n) => n.name.toLowerCase() === address.neighborhood.toLowerCase()
    );

    if (matchedNeighborhood) {
      return matchedNeighborhood.feeCents;
    }

    return storeConfig.delivery.feeCents;
  }, [fulfillmentType, address.neighborhood, itemsSubtotalCents, storeConfig.delivery]);

  const totalCents = itemsSubtotalCents + deliveryFeeCents;

  // Validação do Formulário com validadores inteligentes
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    const nameVal = validateCustomerName(customer.name);
    if (!nameVal.isValid) {
      errors.name = nameVal.error || "Informe seu nome.";
    }

    const phoneVal = validatePhone(customer.phone);
    if (!phoneVal.isValid) {
      errors.phone = phoneVal.error || "Informe um telefone válido.";
    }

    if (fulfillmentType === "delivery") {
      if (address.cep && address.cep.trim().length > 0) {
        const cepVal = validateCep(address.cep);
        if (!cepVal.isValid) {
          errors.cep = cepVal.error || "CEP inválido.";
        }
      }

      if (!address.neighborhood.trim()) {
        errors.neighborhood = "Selecione ou informe seu bairro.";
      }
      if (!address.street.trim()) {
        errors.street = "Informe o nome da rua ou avenida.";
      }
      if (!address.number.trim()) {
        errors.number = "Informe o número.";
      }
    }

    if (payment.method === "dinheiro") {
      const changeVal = validateChangeAmount(
        payment.changeForCents,
        totalCents,
        Boolean(payment.needsChange)
      );
      if (!changeVal.isValid) {
        errors.payment = changeVal.error || "Valor para troco inválido.";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFinishOrder = async () => {
    if (!validateForm()) return;

    // Se WhatsApp da loja não estiver configurado, bloqueia
    if (!whatsAppAudit.isConfigured) {
      alert("WhatsApp da loja não configurado.");
      return;
    }

    setIsSubmitting(true);
    let orderRef = `#BB-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    try {
      // 1. Chamar endpoint do servidor para validação transacional e persistência
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            name: customer.name.trim(),
            phone: customer.phone,
          },
          fulfillmentType,
          deliveryAddress: fulfillmentType === "delivery" ? address : undefined,
          payment,
          items,
          notes: "",
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        alert(resData.error || "Erro ao processar o pedido.");
        setIsSubmitting(false);
        return;
      }

      if (resData.orderNumber) {
        orderRef = resData.orderNumber;
      }
    } catch (err: any) {
      console.warn("Aviso ao sincronizar pedido com servidor:", err);
    } finally {
      setIsSubmitting(false);
    }

    // 2. Formatar e abrir WhatsApp com o número oficial do pedido
    const message = formatWhatsAppOrderMessage({
      orderRef,
      storeName: storeConfig.name || defaultStoreConfig.name,
      customer: {
        name: customer.name.trim(),
        phone: customer.phone,
      },
      fulfillmentType,
      deliveryAddress: fulfillmentType === "delivery" ? address : undefined,
      payment,
      items,
      subtotalCents: itemsSubtotalCents,
      deliveryFeeCents,
      totalCents,
    });

    const targetWhatsapp = storeConfig.whatsappNumber || defaultStoreConfig.whatsappNumber;
    const whatsappUrl = generateWhatsAppOrderUrl(targetWhatsapp, message);

    setOrderSentUrl(whatsappUrl);
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  if (!mounted) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brasa-orange border-t-transparent" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto w-full max-w-md sm:max-w-2xl px-4 py-8">
        <CartEmpty />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md sm:max-w-3xl lg:max-w-6xl px-4 sm:px-6 py-6 pb-28">
      {/* Cabeçalho da Página do Carrinho */}
      <div className="flex items-center justify-between border-b border-brasa-border pb-4 mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-zinc-400 hover:text-brasa-orange transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Continuar comprando</span>
        </Link>

        <button
          type="button"
          onClick={() => setIsConfirmClearOpen(true)}
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-red-400 transition-colors"
          aria-label="Esvaziar carrinho"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Esvaziar carrinho</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Coluna Principal: Itens e Formulário de Checkout */}
        <div className="lg:col-span-7 space-y-6">
          {/* Seção de Itens */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bebas text-xl sm:text-2xl tracking-wide uppercase text-brasa-cream">
                Seus Itens ({itemsCount})
              </h2>
            </div>

            <div className="space-y-3">
              {items.map((item) => (
                <CartItemCard
                  key={item.cartItemId}
                  item={item}
                  onUpdateQuantity={(newQty) =>
                    updateQuantity(item.cartItemId, newQty)
                  }
                  onRemove={() => removeItem(item.cartItemId)}
                  onEdit={() => setEditingItem(item)}
                />
              ))}
            </div>
          </div>

          {/* Seção 1: Modalidade de Entrega / Retirada */}
          <CheckoutFulfillment
            fulfillmentType={fulfillmentType}
            onFulfillmentTypeChange={setFulfillmentType}
            customer={customer}
            onCustomerChange={setCustomer}
            address={address}
            onAddressChange={setAddress}
            neighborhoodFees={defaultStoreConfig.delivery.neighborhoodFees}
            allowOnlyRegisteredNeighborhoods={
              defaultStoreConfig.delivery.allowOnlyRegisteredNeighborhoods
            }
            storeAddress={defaultStoreConfig.address}
            errors={formErrors}
          />

          {/* Seção 2: Forma de Pagamento */}
          <CheckoutPayment
            payment={payment}
            onPaymentChange={setPayment}
            totalCents={totalCents}
            acceptedMethods={defaultStoreConfig.acceptedPaymentMethods}
            error={formErrors.payment}
          />
        </div>

        {/* Coluna Lateral: Resumo Financeiro e Finalização */}
        <div className="lg:col-span-5 lg:sticky lg:top-20 space-y-4">
          <OrderSummary
            itemsCount={itemsCount}
            subtotalProductsCents={subtotalProductsCents}
            totalAddOnsCents={totalAddOnsCents}
            deliveryFeeCents={deliveryFeeCents}
            totalCents={totalCents}
            isDelivery={fulfillmentType === "delivery"}
            minimumOrderCents={defaultStoreConfig.delivery.minimumOrderCents}
            isStoreOpen={defaultStoreConfig.isOpen}
            allowAdvanceOrders={defaultStoreConfig.allowAdvanceOrders}
            isFormValid={true}
            isWhatsAppConfigured={whatsAppAudit.isConfigured}
            isWhatsAppDemo={whatsAppAudit.isDemo}
            onFinishOrder={handleFinishOrder}
          />

          {/* Alerta pós-clique para reabrir link se bloqueado pelo navegador */}
          {orderSentUrl && (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-2 text-xs text-emerald-300">
              <div className="flex items-center gap-2 font-bold text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>Pedido preparado com sucesso!</span>
              </div>
              <p className="text-[11px] text-zinc-300">
                Se a janela do WhatsApp não tiver aberto automaticamente, toque no link abaixo:
              </p>
              <a
                href={orderSentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-bold text-brasa-orange hover:underline pt-1"
              >
                <span>Abrir conversa no WhatsApp</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Edição de Item do Carrinho */}
      {editingItem && (
        <ProductDetailsDrawer
          product={editingItem.product}
          isOpen={Boolean(editingItem)}
          onClose={() => setEditingItem(null)}
          initialCartItem={editingItem}
        />
      )}

      {/* Diálogo de Confirmação para Esvaziar Carrinho */}
      {isConfirmClearOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsConfirmClearOpen(false)}
          />
          <div className="relative z-10 w-full max-w-sm rounded-2xl border border-brasa-border bg-brasa-surface p-6 text-center space-y-4 shadow-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bebas text-xl uppercase tracking-wide text-brasa-cream">
                Esvaziar carrinho?
              </h3>
              <p className="text-xs text-zinc-400">
                Tem certeza de que deseja remover todos os itens do seu pedido?
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmClearOpen(false)}
                className="rounded-xl border border-brasa-border bg-brasa-bg py-2.5 text-xs font-semibold text-brasa-cream hover:bg-zinc-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  clearCart();
                  setIsConfirmClearOpen(false);
                }}
                className="rounded-xl bg-red-600 py-2.5 text-xs font-bold text-white hover:bg-red-700 transition-colors"
              >
                Sim, esvaziar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
