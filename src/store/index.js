import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cartSlice';
import wishlistReducer from './wishlistSlice';

import authReducer from './authSlice';
import blogReducer from './blogSlice';
import currencyReducer from './currencySlice';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    wishlist: wishlistReducer,
    auth: authReducer,
    blog: blogReducer,
    currency: currencyReducer
  },
});
