import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cartSlice';
import wishlistReducer from './wishlistSlice';

import authReducer from './authSlice';
import blogReducer from './blogSlice';
import currencyReducer from './currencySlice';
import uiReducer from './uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    blog: blogReducer,
    currency: currencyReducer,
    ui: uiReducer
  },
});
