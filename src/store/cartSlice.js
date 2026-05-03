import { createSlice } from '@reduxjs/toolkit';

const parsePrice = (price) => {
  if (typeof price === 'number') return price;
  if (!price) return 0;
  return parseInt(price.toString().replace(/[^0-9]/g, '')) || 0;
};

const getInitialCart = () => {
    try {
        const stored = localStorage.getItem('kiks_cart');
        return stored ? JSON.parse(stored) : { items: [], total: 0 };
    } catch { return { items: [], total: 0 }; }
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState: getInitialCart(),
  reducers: {
    addToCart: (state, action) => {
      const qty = Number(action.payload.quantity || 1);
      const existing = state.items.find(item => String(item.id) === String(action.payload.id) && String(item.size) === String(action.payload.size));
      
      if (existing) {
        existing.quantity = Number(existing.quantity || 0) + qty;
      } else {
        state.items.push({ ...action.payload, quantity: qty });
      }
      state.total = state.items.reduce((acc, item) => acc + (parsePrice(item.sale_price || item.price) * Number(item.quantity || 1)), 0);
      localStorage.setItem('kiks_cart', JSON.stringify({ items: state.items, total: state.total }));
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(item => !(item.id === action.payload.id && item.size === action.payload.size));
      state.total = state.items.reduce((acc, item) => acc + (parsePrice(item.sale_price || item.price) * item.quantity), 0);
      localStorage.setItem('kiks_cart', JSON.stringify({ items: state.items, total: state.total }));
    },
    updateQuantity: (state, action) => {
      const item = state.items.find(item => item.id === action.payload.id && item.size === action.payload.size);
      if (item) {
        item.quantity = action.payload.quantity;
      }
      state.total = state.items.reduce((acc, item) => acc + (parsePrice(item.sale_price || item.price) * item.quantity), 0);
      localStorage.setItem('kiks_cart', JSON.stringify({ items: state.items, total: state.total }));
    },
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
      localStorage.removeItem('kiks_cart');
    },
    setCart: (state, action) => {
      state.items = (action.payload.items || []).map(item => ({
        ...item,
        id: String(item.id),
        quantity: Number(item.quantity || 1)
      }));
      state.total = state.items.reduce((acc, item) => acc + (parsePrice(item.sale_price || item.price) * Number(item.quantity || 1)), 0);
      localStorage.setItem('kiks_cart', JSON.stringify({ items: state.items, total: state.total }));
    }
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, setCart } = cartSlice.actions;
export default cartSlice.reducer;
