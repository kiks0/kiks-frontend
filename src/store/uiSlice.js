import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isAuthModalOpen: false,
  isWishlistAuthPopupOpen: false,
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
  },
});

export const { 
  openAuthModal, 
  closeAuthModal, 
  openWishlistAuthPopup, 
  closeWishlistAuthPopup 
} = uiSlice.actions;
export default uiSlice.reducer;
