import { configureStore } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer, { initializeStore } from "./authSlice";
import cartReducer from "./cartSlice";

// Persist configuration for cart state
const cartPersistConfig = {
  key: "cart",
  storage,
  whitelist: ["items"], // Only persist items array
};

const authPersistConfig = {
  key: "auth",
  storage,
  whitelist: ["token", "refreshToken", "user"], // Only persist necessary auth data
};

// Create persisted reducers
const persistedCartReducer = persistReducer(cartPersistConfig, cartReducer);
const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

// Store configuration
export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    cart: persistedCartReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        // You can also ignore paths if needed
        ignoredPaths: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
  devTools: process.env.NODE_ENV !== "production",
});

// Initialize store reference in authSlice
initializeStore(store);

// Create persistor
export const persistor = persistStore(store);

// Function to purge persisted state if it gets too large
export const checkAndPurgeStorage = async () => {
  try {
    const storageSize = await storage.length;
    // If storage is larger than 8MB, purge it
    if (storageSize > 8 * 1024 * 1024) {
      await persistor.purge();
      window.location.reload();
    }
  } catch (error) {
    console.error("Storage check failed:", error);
  }
};
