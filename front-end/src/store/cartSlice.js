import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { getState, rejectWithValue }) => {
    try {
      const {
        auth: { token },
      } = getState();
      if (!token) return rejectWithValue("No auth token");

      const response = await axios.get("http://localhost:8000/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.items || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || "Failed to fetch cart"
      );
    }
  }
);

export const syncCartWithServer = createAsyncThunk(
  "cart/syncWithServer",
  async (_, { getState, rejectWithValue }) => {
    try {
      const {
        auth: { token },
        cart: { items },
      } = getState();

      if (!token) return rejectWithValue("No auth token");

      // Ensure each item has all required properties
      const formattedItems = items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        size: item.size,
        name: item.name,
        price: item.price,
        image_url: item.image_url,
      }));

      await axios.post(
        "http://localhost:8000/cart/sync",
        { items: formattedItems },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return formattedItems;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || "Failed to sync cart"
      );
    }
  }
);

const calculateTotal = (items) =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0);

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    total: 0,
    status: "idle",
    error: null,
    lastSynced: null,
  },
  reducers: {
    setCartItems: (state, action) => {
      state.items = action.payload;
      state.total = calculateTotal(action.payload);
      state.lastSynced = new Date().toISOString();
    },
    addToCart: (state, action) => {
      const existingItem = state.items.find(
        (item) => item.product_id === action.payload.product_id
      );

      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }

      state.total = calculateTotal(state.items);
      state.lastSynced = null;
    },
    updateQuantity: (state, action) => {
      const { product_id, quantity } = action.payload;
      const item = state.items.find((item) => item.product_id === product_id);

      if (item) {
        item.quantity = quantity;
        if (quantity <= 0) {
          state.items = state.items.filter(
            (item) => item.product_id !== product_id
          );
        }
      }

      state.total = calculateTotal(state.items);
      state.lastSynced = null;
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(
        (item) => item.product_id !== action.payload
      );
      state.total = calculateTotal(state.items);
      state.lastSynced = null;
    },
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
      state.lastSynced = new Date().toISOString();
    },
    resetCart: (state) => {
      state.items = [];
      state.total = 0;
      state.lastSynced = new Date().toISOString();
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
        state.total = calculateTotal(action.payload);
        state.lastSynced = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(syncCartWithServer.fulfilled, (state) => {
        state.lastSynced = new Date().toISOString();
        state.error = null;
      })
      .addCase(syncCartWithServer.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

// Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartTotal = (state) => state.cart.total;
export const selectCartStatus = (state) => state.cart.status;
export const selectCartError = (state) => state.cart.error;
export const selectNeedsSyncing = (state) => !state.cart.lastSynced;

export const {
  setCartItems,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  resetCart,
} = cartSlice.actions;

export default cartSlice.reducer;
