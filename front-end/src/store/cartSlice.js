import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    total: 0,
  },
  reducers: {
    setCartItems: (state, action) => {
      state.items = action.payload;
      state.total = state.items.reduce(
        (sum, item) =>
          sum + item.price * item.quantity,
        0
      );
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

      state.total = state.items.reduce(
        (sum, item) =>
          sum +item.price * item.quantity,
        0
      );
      console.log("Total after adding item:", state.total);  
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

      state.total = state.items.reduce(
        (sum, item) =>
          sum + item.price * item.quantity,
        0
      );
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(
        (item) => item.product_id !== action.payload
      );

      state.total = state.items.reduce(
        (sum, item) =>
          sum + item.price * item.quantity,
        0
      );
    },
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
    },
    resetCart: (state) => {
      state.items = [];
      state.total = 0;
    },
  },
});

export const {
  setCartItems,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  resetCart,
} = cartSlice.actions;

export default cartSlice.reducer;
