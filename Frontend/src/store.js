import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  isLoading: false,
  error: null,
  
  setUser: (user) => set({ user }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  logout: () => set({ user: null, isLoading: false, error: null }),
}));

export const useThemeStore = create((set) => ({
  isDark: localStorage.getItem('theme') === 'dark',
  toggleTheme: () => set((state) => {
    const newDark = !state.isDark;
    localStorage.setItem('theme', newDark ? 'dark' : 'light');
    return { isDark: newDark };
  }),
}));


export const useCartStore = create((set) => ({
  items: [],
  addItem: (product) => set((state) => {
    const existing = state.items.find(i => i.product_id === product.id);
    if (existing) {
      return { items: state.items.map(i => i.product_id === product.id ? { ...i, qty: i.qty + 1 } : i) };
    }
    return { items: [...state.items, { product_id: product.id, name: product.name, price: product.price, qty: 1 }] };
  }),
  removeItem: (product_id) => set((state) => ({ items: state.items.filter(i => i.product_id !== product_id) })),
  clear: () => set({ items: [] }),
}));
