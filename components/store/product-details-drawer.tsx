"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Product, SelectedOption, CartItem } from "@/types/store";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/lib/store/useCartStore";
import {
  X,
  Plus,
  Minus,
  Check,
  Flame,
  AlertCircle,
  ShoppingBag,
} from "lucide-react";

interface ProductDetailsDrawerProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  initialCartItem?: CartItem | null;
  onSaveEditedItem?: (oldCartItemId: string, updatedItem: CartItem) => void;
}

export function ProductDetailsDrawer({
  product,
  isOpen,
  onClose,
  initialCartItem,
  onSaveEditedItem,
}: ProductDetailsDrawerProps) {
  const addItem = useCartStore((state) => state.addItem);
  const updateItem = useCartStore((state) => state.updateItem);

  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>([]);
  const [removedIngredients, setRemovedIngredients] = useState<string[]>([]);
  const [observation, setObservation] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Inicializa o estado ao abrir um novo produto ou carregar edição existente
  useEffect(() => {
    if (product) {
      if (initialCartItem && initialCartItem.product.slug === product.slug) {
        // Modo Edição: restaura a configuração previamente selecionada
        setQuantity(initialCartItem.quantity);
        setSelectedOptions(initialCartItem.selectedOptions || []);
        setRemovedIngredients(initialCartItem.removedIngredients || []);
        setObservation(initialCartItem.observation || "");
      } else {
        // Modo Novo Item: inicializa padrão
        setQuantity(1);
        setRemovedIngredients([]);
        setObservation("");

        // Pré-seleciona a primeira opção em grupos obrigatórios de escolha única
        const initialOptions: SelectedOption[] = [];
        product.customizationGroups?.forEach((group) => {
          if (group.required && group.max === 1 && group.options.length > 0) {
            const firstOpt = group.options[0];
            initialOptions.push({
              groupId: group.id,
              groupName: group.name,
              optionId: firstOpt.id,
              name: firstOpt.name,
              priceCents: firstOpt.priceCents,
            });
          }
        });
        setSelectedOptions(initialOptions);
      }
      setIsSuccess(false);
    }
  }, [product, isOpen, initialCartItem]);

  // Bloqueia a rolagem do body quando o drawer estiver aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Tecla Escape para fechar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Cálculo de preços em centavos
  const extraTotalCents = useMemo(() => {
    return selectedOptions.reduce((acc, opt) => acc + opt.priceCents, 0);
  }, [selectedOptions]);

  const unitPriceCents = useMemo(() => {
    if (!product) return 0;
    return product.priceCents + extraTotalCents;
  }, [product, extraTotalCents]);

  const totalPriceCents = useMemo(() => {
    return unitPriceCents * quantity;
  }, [unitPriceCents, quantity]);

  // Validação de grupos obrigatórios
  const isValidationPassing = useMemo(() => {
    if (!product || !product.customizationGroups) return true;

    for (const group of product.customizationGroups) {
      if (group.required) {
        const count = selectedOptions.filter((o) => o.groupId === group.id).length;
        if (count < group.min) {
          return false;
        }
      }
    }
    return true;
  }, [product, selectedOptions]);

  if (!isOpen || !product) return null;

  // Gerenciadores de seleção de opções
  const handleToggleOption = (
    groupId: string,
    groupName: string,
    optionId: string,
    optionName: string,
    priceCents: number,
    maxAllowed: number
  ) => {
    const isAlreadySelected = selectedOptions.some(
      (o) => o.groupId === groupId && o.optionId === optionId
    );

    if (isAlreadySelected) {
      setSelectedOptions((prev) =>
        prev.filter((o) => !(o.groupId === groupId && o.optionId === optionId))
      );
    } else {
      if (maxAllowed === 1) {
        setSelectedOptions((prev) => [
          ...prev.filter((o) => o.groupId !== groupId),
          { groupId, groupName, optionId, name: optionName, priceCents },
        ]);
      } else {
        const currentGroupCount = selectedOptions.filter(
          (o) => o.groupId === groupId
        ).length;

        if (currentGroupCount < maxAllowed) {
          setSelectedOptions((prev) => [
            ...prev,
            { groupId, groupName, optionId, name: optionName, priceCents },
          ]);
        }
      }
    }
  };

  const handleToggleRemoval = (ingredientName: string) => {
    setRemovedIngredients((prev) =>
      prev.includes(ingredientName)
        ? prev.filter((item) => item !== ingredientName)
        : [...prev, ingredientName]
    );
  };

  const handleSave = () => {
    if (!isValidationPassing) return;

    const itemPayload: CartItem = {
      cartItemId: "",
      product,
      quantity,
      selectedAddOns: selectedOptions.map((opt) => ({
        name: opt.name,
        priceCents: opt.priceCents,
        quantity: 1,
      })),
      selectedOptions,
      removedIngredients,
      observation: observation.trim() || undefined,
      unitPriceCents,
      totalItemCents: totalPriceCents,
    };

    if (initialCartItem) {
      if (onSaveEditedItem) {
        onSaveEditedItem(initialCartItem.cartItemId, itemPayload);
      } else {
        updateItem(initialCartItem.cartItemId, itemPayload);
      }
    } else {
      addItem(itemPayload);
    }

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end sm:items-center sm:justify-center p-0 sm:p-4">
      {/* Backdrop escuro com desfoque */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Container Principal do Drawer / Modal */}
      <div
        className="relative z-10 flex flex-col w-full max-h-[92vh] sm:max-h-[85vh] sm:max-w-lg rounded-t-3xl sm:rounded-3xl border border-brasa-border bg-brasa-surface shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-drawer-title"
      >
        {/* Puxador visual no topo mobile */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-1">
          <div className="h-1.5 w-12 rounded-full bg-zinc-600/60" />
        </div>

        {/* Botão de Fechar no topo direito */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 border border-white/10 text-brasa-cream hover:bg-black/80 hover:text-white transition-colors"
          aria-label="Fechar detalhes"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Área de Conteúdo com Rolagem Interna Suave */}
        <div className="flex-1 overflow-y-auto no-scrollbar pb-6">
          {/* Fotografia em Destaque Gastronômico */}
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/50">
            <Image
              src={product.image}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 640px) 100vw, 512px"
              className="object-cover object-center"
            />
            {product.badge && (
              <div className="absolute bottom-3 left-4 flex items-center gap-1 rounded-full bg-brasa-red px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-md">
                <Flame className="h-3 w-3" />
                <span>{product.badge}</span>
              </div>
            )}
          </div>

          <div className="px-5 pt-4 space-y-5">
            {/* Título, Preço Base e Descrição */}
            <div className="space-y-2 border-b border-brasa-border/60 pb-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2
                    id="product-drawer-title"
                    className="font-bebas text-2xl xs:text-3xl tracking-wide uppercase text-brasa-cream leading-tight"
                  >
                    {product.name}
                  </h2>
                  {initialCartItem && (
                    <span className="text-[10px] font-mono font-semibold text-brasa-orange uppercase tracking-wider">
                      Editando item do carrinho
                    </span>
                  )}
                </div>
                <span className="font-mono text-xl font-bold text-brasa-orange shrink-0">
                  {formatCurrency(product.priceCents)}
                </span>
              </div>

              <p className="text-xs xs:text-sm text-zinc-300 leading-relaxed">
                {product.description}
              </p>

              {/* Lista de Ingredientes oficiais */}
              {product.ingredients && product.ingredients.length > 0 && (
                <div className="pt-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block mb-1.5">
                    Ingredientes inclusos:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {product.ingredients.map((ing, idx) => (
                      <span
                        key={idx}
                        className="rounded-md bg-brasa-bg border border-brasa-border/80 px-2 py-0.5 text-[11px] text-zinc-300"
                      >
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Grupos de Customização e Adicionais */}
            {product.customizationGroups?.map((group) => {
              const currentGroupCount = selectedOptions.filter(
                (o) => o.groupId === group.id
              ).length;
              const isSatisfied = !group.required || currentGroupCount >= group.min;

              return (
                <div
                  key={group.id}
                  className="rounded-2xl border border-brasa-border/80 bg-brasa-bg/50 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bebas text-lg tracking-wide uppercase text-brasa-cream">
                          {group.name}
                        </h3>
                        {group.required ? (
                          <span
                            className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${
                              isSatisfied
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                : "bg-red-500/10 text-red-400 border-red-500/30 animate-pulse"
                            }`}
                          >
                            {isSatisfied ? "OK" : "Obrigatório"}
                          </span>
                        ) : (
                          <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[9px] font-medium text-zinc-400">
                            Opcional
                          </span>
                        )}
                      </div>
                      {group.description && (
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          {group.description}
                        </p>
                      )}
                    </div>

                    <span className="text-[10px] font-mono text-zinc-400">
                      {currentGroupCount}/{group.max}
                    </span>
                  </div>

                  {/* Opções do Grupo */}
                  <div className="space-y-2 pt-1">
                    {group.options.map((option) => {
                      const isSelected = selectedOptions.some(
                        (o) =>
                          o.groupId === group.id && o.optionId === option.id
                      );
                      const isMaxReached =
                        !isSelected &&
                        group.max > 1 &&
                        currentGroupCount >= group.max;

                      return (
                        <button
                          key={option.id}
                          type="button"
                          disabled={isMaxReached}
                          onClick={() =>
                            handleToggleOption(
                              group.id,
                              group.name,
                              option.id,
                              option.name,
                              option.priceCents,
                              group.max
                            )
                          }
                          className={`flex items-center justify-between w-full p-2.5 rounded-xl border text-left transition-all ${
                            isSelected
                              ? "bg-brasa-orange/10 border-brasa-orange text-brasa-cream shadow-sm"
                              : isMaxReached
                              ? "opacity-40 cursor-not-allowed border-transparent bg-zinc-900/40 text-zinc-500"
                              : "bg-brasa-surface/60 border-brasa-border hover:border-zinc-700 text-zinc-300"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded ${
                                group.max === 1 ? "rounded-full" : "rounded-md"
                              } border ${
                                isSelected
                                  ? "border-brasa-orange bg-brasa-orange text-black"
                                  : "border-zinc-600 bg-transparent"
                              }`}
                            >
                              {isSelected && (
                                <Check className="h-3 w-3 stroke-[3]" />
                              )}
                            </div>
                            <span className="text-xs font-medium">
                              {option.name}
                            </span>
                          </div>

                          <span className="font-mono text-xs font-semibold text-brasa-orange">
                            {option.priceCents > 0
                              ? `+ ${formatCurrency(option.priceCents)}`
                              : "Incluso"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Campo de Observações com Limite de 250 caracteres */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="product-observation"
                  className="font-bebas text-base uppercase tracking-wide text-brasa-cream"
                >
                  Alguma observação especial?
                </label>
                <span className="text-[10px] font-mono text-zinc-400">
                  {observation.length}/250
                </span>
              </div>
              <textarea
                id="product-observation"
                rows={2}
                maxLength={250}
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                placeholder="Ex: Ponto da carne bem passado, retirar maionese..."
                className="w-full rounded-xl border border-brasa-border bg-brasa-bg p-3 text-xs text-brasa-cream placeholder:text-zinc-500 focus:border-brasa-orange focus:outline-none focus:ring-1 focus:ring-brasa-orange resize-none"
              />
            </div>
          </div>
        </div>

        {/* Rodapé Fixo com Quantidade e Botão de Ação */}
        <div className="sticky bottom-0 z-20 border-t border-brasa-border bg-brasa-bg/98 backdrop-blur-md px-5 py-3.5 flex items-center justify-between gap-3 shadow-[0_-8px_30px_rgba(0,0,0,0.8)] pb-safe">
          {/* Seletor de Quantidade (+ / -) */}
          <div className="flex items-center rounded-xl border border-brasa-border bg-brasa-surface p-1">
            <button
              type="button"
              disabled={quantity <= 1}
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-brasa-cream hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              aria-label="Diminuir quantidade"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-8 text-center font-mono text-sm font-bold text-brasa-cream">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-brasa-cream hover:bg-zinc-800 transition-colors"
              aria-label="Aumentar quantidade"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Botão de Adicionar / Atualizar com Total Recalculado */}
          <button
            type="button"
            disabled={!isValidationPassing}
            onClick={handleSave}
            className={`flex-1 flex items-center justify-between h-11 px-4 rounded-xl font-bold text-xs xs:text-sm transition-all active:scale-[0.98] shadow-md ${
              isSuccess
                ? "bg-emerald-500 text-black"
                : !isValidationPassing
                ? "bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed"
                : "bg-brasa-orange hover:bg-brasa-orangeHover text-black"
            }`}
          >
            {isSuccess ? (
              <span className="w-full text-center flex items-center justify-center gap-1.5">
                <Check className="h-4 w-4 stroke-[3]" />
                {initialCartItem ? "Item atualizado!" : "Adicionado ao carrinho!"}
              </span>
            ) : !isValidationPassing ? (
              <span className="w-full text-center flex items-center justify-center gap-1.5 text-zinc-400">
                <AlertCircle className="h-4 w-4 text-red-400" />
                Selecione as opções obrigatórias
              </span>
            ) : (
              <>
                <span className="flex items-center gap-1.5">
                  <ShoppingBag className="h-4 w-4" />
                  {initialCartItem ? "Atualizar item" : "Adicionar"}
                </span>
                <span className="font-mono text-sm">
                  {formatCurrency(totalPriceCents)}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
