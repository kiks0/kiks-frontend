import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Fetch exchange rates based on INR (Base Currency)
export const fetchExchangeRates = createAsyncThunk(
  'currency/fetchRates',
  async () => {
    // Using a free API for real-time rates
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/INR');
    const data = await response.json();
    return data.rates;
  }
);

const currencySlice = createSlice({
  name: 'currency',
  initialState: {
    baseCurrency: 'INR',
    activeCurrency: localStorage.getItem('kiks_currency') || 'INR',
    rates: { INR: 1 },
    symbols: {
      INR: '₹',
      USD: '$',
      EUR: '€',
      GBP: '£',
      MXN: '$',
      CAD: '$',
      JPY: '¥',
      CNY: '¥',
      AED: 'AED '
    },
    status: 'idle'
  },
  reducers: {
    setCurrency: (state, action) => {
      state.activeCurrency = action.payload;
      localStorage.setItem('kiks_currency', action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExchangeRates.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchExchangeRates.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.rates = action.payload;
      })
      .addCase(fetchExchangeRates.rejected, (state) => {
        state.status = 'failed';
        // Fallback rates if API fails
        state.rates = { INR: 1, USD: 0.012, EUR: 0.011, GBP: 0.0094 };
      });
  }
});

export const { setCurrency } = currencySlice.actions;
export default currencySlice.reducer;
