import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CartItem, SelectedOption } from "@/types/store";

export function generateCartItemConfigId(
  productSlug: string,
  selectedOptions: SelectedOption[] = [],
  removedIngredients: string[] = [],
  observation: string = ""
): string {
  const sortedOptions = [...selectedOptions]
    .sort((a, b) => a.optionId.localeCompare(b.optionId))
    .map((o) => `${o.groupId}:${o.optionId}:${o.priceCents}`)
    .join("|");

  const sortedRemovals = [...removedIngredients].sort().join("|");
  const cleanObs = observation.trim().toLowerCase();

  return `${productSlug}__opt[${sortedOptions}]__rem[${sortedRemovals}]__obs[${cleanObs}]`;
}

interface CartState {
  items: CartItem[];
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  addItem: (item: CartItem) => void;
  updateItem: (oldCartItemId: string, updatedItem: CartItem) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalCents: () => number;
  getSubtotalProductsCents: () => number;
  getTotalAddOnsCents: () => number;
  getTotalItemsCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      _hasHydrated: false,

      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state });
      },

      addItem: (newItem) => {
        set((state) => {
          const configId =
            newItem.cartItemId ||
            generateCartItemConfigId(
              newItem.product.slug,
              newItem.selectedOptions,
              newItem.removedIngredients,
              newItem.observation
            );

          const existingIndex = state.items.findIndex(
            (i) => i.cartItemId === configId
          );

          if (existingIndex > -1) {
            const updated = [...state.items];
            const existing = updated[existingIndex];
            const newQuantity = existing.quantity + newItem.quantity;
            updated[existingIndex] = {
              ...existing,
              quantity: newQuantity,
              totalItemCents: existing.unitPriceCents * newQuantity,
            };
            return { items: updated };
          }

          const unitPriceCents =
            newItem.unitPriceCents ||
            newItem.product.priceCents +
              (newItem.selectedOptions || []).reduce(
                (sum, opt) => sum + opt.priceCents,
                0
              );

          const itemWithConfig: CartItem = {
            ...newItem,
            cartItemId: configId,
            unitPriceCents,
            totalItemCents: unitPriceCents * newItem.quantity,
          };

          return { items: [...state.items, itemWithConfig] };
        });
      },

      updateItem: (oldCartItemId, updatedItem) => {
        set((state) => {
          const newConfigId =
            updatedItem.cartItemId ||
            generateCartItemConfigId(
              updatedItem.product.slug,
              updatedItem.selectedOptions,
              updatedItem.removedIngredients,
              updatedItem.observation
            );

          const unitPriceCents =
            updatedItem.unitPriceCents ||
            updatedItem.product.priceCents +
              (updatedItem.selectedOptions || []).reduce(
                (sum, opt) => sum + opt.priceCents,
                0
              );

          const normalizedItem: CartItem = {
            ...updatedItem,
            cartItemId: newConfigId,
            unitPriceCents,
            totalItemCents: unitPriceCents * updatedItem.quantity,
          };

          // Se a nova configuração for idêntica à antiga, apenas substitui
          if (oldCartItemId === newConfigId) {
            return {
              items: state.items.map((item) =>
                item.cartItemId === oldCartItemId ? normalizedItem : item
              ),
            };
          }

          // Se a nova configuração colidir com outro item já existente no carrinho, une as quantidades
          const existingTargetIndex = state.items.findIndex(
            (item) => item.cartItemId === newConfigId
          );

          const filtered = state.items.filter(
            (item) => item.cartItemId !== oldCartItemId
          );

          if (existingTargetIndex > -1 && state.items[existingTargetIndex].cartItemId !== oldCartItemId) {
            return {
              items: filtered.map((item) => {
                if (item.cartItemId === newConfigId) {
                  const combinedQty = item.quantity + normalizedItem.quantity;
                  return {
                    ...item,
                    quantity: combinedQty,
                    totalItemCents: item.unitPriceCents * combinedQty,
                  };
                }
                return item;
              }),
            };
          }

          return { items: [...filtered, normalizedItem] };
        });
      },

      removeItem: (cartItemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.cartItemId !== cartItemId),
        }));
      },

      updateQuantity: (cartItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(cartItemId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.cartItemId === cartItemId
              ? {
                  ...item,
                  quantity,
                  totalItemCents: item.unitPriceCents * quantity,
                }
              : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotalCents: () => {
        return get().items.reduce((total, item) => {
          return total + item.unitPriceCents * item.quantity;
        }, 0);
      },

      getSubtotalProductsCents: () => {
        return get().items.reduce((total, item) => {
          return total + item.product.priceCents * item.quantity;
        }, 0);
      },

      getTotalAddOnsCents: () => {
        return get().items.reduce((total, item) => {
          const addOnsUnit = (item.selectedOptions || []).reduce(
            (sum, opt) => sum + opt.priceCents,
            0
          );
          return total + addOnsUnit * item.quantity;
        }, 0);
      },

      getTotalItemsCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: "brasa-burgers-cart-v1",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({ items: state.items }),
    }
  )
);
