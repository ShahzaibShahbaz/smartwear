// src/store/store.js
import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // This will use localStorage
import authReducer from "./authSlice";
import cartReducer from "./cartSlice";

// Persist configuration for cart state
const cartPersistConfig = {
  key: "cart",
  storage, // Use localStorage
  blacklist: [], // No blacklist of reducers
  whitelist: ["items", "total"], // Only persist items and total
};

// Create persisted reducer for cart
const persistedCartReducer = persistReducer(cartPersistConfig, cartReducer);

// Store configuration
export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: persistedCartReducer,
  },
});

// Create persistor
export const persistor = persistStore(store);
