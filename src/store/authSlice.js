import { createSlice } from '@reduxjs/toolkit';

const getSafeUser = () => {
  try {
    const user = localStorage.getItem('kiks_user');
    return user ? JSON.parse(user) : null;
  } catch (e) {
    console.error("Auth state recovery failed", e);
    return null;
  }
};

const initialState = {
  user: getSafeUser(),
  token: localStorage.getItem('kiks_token') || null,
  isAuthenticated: !!localStorage.getItem('kiks_user'),
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
      localStorage.setItem('kiks_user', JSON.stringify(user));
      localStorage.setItem('kiks_token', token);
      localStorage.setItem('currentUser', JSON.stringify(user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('kiks_user');
      localStorage.removeItem('kiks_token');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('kiks_cart'); // Clear cart from device on logout
    },
    setUserRole: (state, action) => {
      if (state.user) {
        state.user.role = action.payload;
        localStorage.setItem('kiks_user', JSON.stringify(state.user));
      }
    },
    updateProfile: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('kiks_user', JSON.stringify(state.user));
        localStorage.setItem('currentUser', JSON.stringify(state.user));
      }
    }
  },
});

export const { login, logout, setUserRole, updateProfile } = authSlice.actions;
export default authSlice.reducer;
