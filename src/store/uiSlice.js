import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isAuthModalOpen: false,
  isWishlistAuthPopupOpen: false,
  isCartOpen: false,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openAuthModal: (state) => {
      state.isAuthModalOpen = true;
    },
    closeAuthModal: (state) => {
      state.isAuthModalOpen = false;
    },
    openWishlistAuthPopup: (state) => {
      state.isWishlistAuthPopupOpen = true;
    },
    closeWishlistAuthPopup: (state) => {
      state.isWishlistAuthPopupOpen = false;
    },
    openCart: (state) => {
      state.isCartOpen = true;
    },
    closeCart: (state) => {
      state.isCartOpen = false;
    },
    toggleCart: (state) => {
      state.isCartOpen = !state.isCartOpen;
    },
  },
});

export const { 
  openAuthModal, 
  closeAuthModal, 
  openWishlistAuthPopup, 
  closeWishlistAuthPopup,
  openCart,
  closeCart,
  toggleCart
} = uiSlice.actions;
export default uiSlice.reducer;
