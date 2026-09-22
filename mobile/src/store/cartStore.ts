import { create } from 'zustand';
import { CartLine, Product, Variant } from '../types';

interface CartState {
  lines: CartLine[];
  addItem: (product: Product, variant: Variant) => void;
  removeItem: (productId: string, variantId: string) => void;
  incrementItem: (productId: string, variantId: string) => void;
  decrementItem: (productId: string, variantId: string) => void;
  clearCart: () => void;
  itemsTotal: () => number;
  totalCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  lines: [],

  addItem: (product, variant) => set((state) => {
    const existing = state.lines.find(
      (l) => l.product._id === product._id && l.variant._id === variant._id
    );
    if (existing) {
      return {
        lines: state.lines.map((l) =>
          l === existing ? { ...l, count: l.count + 1 } : l
        )
      };
    }
    return { lines: [...state.lines, { product, variant, count: 1 }] };
  }),

  incrementItem: (productId, variantId) => set((state) => ({
    lines: state.lines.map((l) =>
      l.product._id === productId && l.variant._id === variantId
        ? { ...l, count: l.count + 1 }
        : l
    )
  })),

  decrementItem: (productId, variantId) => set((state) => ({
    lines: state.lines
      .map((l) =>
        l.product._id === productId && l.variant._id === variantId
          ? { ...l, count: l.count - 1 }
          : l
      )
      .filter((l) => l.count > 0)
  })),

  removeItem: (productId, variantId) => set((state) => ({
    lines: state.lines.filter(
      (l) => !(l.product._id === productId && l.variant._id === variantId)
    )
  })),

  clearCart: () => set({ lines: [] }),

  itemsTotal: () => get().lines.reduce((sum, l) => sum + l.variant.price * l.count, 0),

  totalCount: () => get().lines.reduce((sum, l) => sum + l.count, 0)
}));
