import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const getInitialWishlist = () => {
    try {
        const stored = localStorage.getItem('kiks_wishlist');
        return stored ? JSON.parse(stored) : [];
    } catch { return []; }
};

export const fetchWishlist = createAsyncThunk('wishlist/fetchWishlist', async (_, { getState }) => {
    const token = getState().auth.token || localStorage.getItem('kiks_token');
    if (!token) throw new Error("No token");
    const res = await fetch('http://localhost:5000/api/auth/wishlist', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Fetch failed");
    return res.json();
});

export const updateWishlistInDB = createAsyncThunk('wishlist/updateWishlistInDB', async (wishlist, { getState }) => {
    const token = getState().auth.token || localStorage.getItem('kiks_token');
    if (!token) return wishlist;
    await fetch('http://localhost:5000/api/auth/wishlist', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ wishlist })
    });
    return wishlist;
});

export const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: getInitialWishlist(),
  },
  reducers: {
    toggleWishlist: (state, action) => {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index >= 0) {
        state.items.splice(index, 1);
      } else {
        state.items.push(action.payload);
      }
      localStorage.setItem('kiks_wishlist', JSON.stringify(state.items));
    },
    clearWishlist: (state) => {
      state.items = [];
      localStorage.removeItem('kiks_wishlist');
    }
  },
  extraReducers: (builder) => {
      builder.addCase(fetchWishlist.fulfilled, (state, action) => {
          state.items = action.payload;
          localStorage.setItem('kiks_wishlist', JSON.stringify(action.payload));
      });
  }
});

export const { toggleWishlist, clearWishlist } = wishlistSlice.actions;

export const toggleWishlistAndSync = (item) => (dispatch, getState) => {
    dispatch(toggleWishlist(item));
    const items = getState().wishlist.items;
    const token = getState().auth.token || localStorage.getItem('kiks_token');
    if (token) {
        dispatch(updateWishlistInDB(items));
    }
};

export default wishlistSlice.reducer;
