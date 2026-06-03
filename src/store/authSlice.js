import { createSlice } from '@reduxjs/toolkit';

const getSafeUser = () => {
  try {
    const user = localStorage.getItem('auth_user');
    return user ? JSON.parse(user) : null;
  } catch (e) {
    console.error("Auth state recovery failed", e);
    return null;
  }
};

const initialState = {
  user: getSafeUser(),
  token: localStorage.getItem('auth_token') || null,
  isAuthenticated: !!localStorage.getItem('auth_user'),
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      localStorage.setItem('auth_user', JSON.stringify(user));
      localStorage.setItem('auth_token', token);
      localStorage.setItem('currentUser', JSON.stringify(user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('shopping_cart'); // Clear cart from device on logout
    },
    setUserRole: (state, action) => {
      if (state.user) {
        state.user.role = action.payload;
        localStorage.setItem('auth_user', JSON.stringify(state.user));
      }
    },
    updateProfile: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('auth_user', JSON.stringify(state.user));
        localStorage.setItem('currentUser', JSON.stringify(state.user));
      }
    }
  },
});

export const { login, logout, setUserRole, updateProfile } = authSlice.actions;
export default authSlice.reducer;
