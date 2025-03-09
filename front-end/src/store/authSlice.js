import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const token = localStorage.getItem("token");
const refreshToken = localStorage.getItem("refreshToken");
const user = JSON.parse(localStorage.getItem("user"));

let refreshTimeout;
let storeRef = null;

// Function to initialize store reference
export const initializeStore = (store) => {
  storeRef = store;
};

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: user || null,
    token: token || null,
    refreshToken: refreshToken || null,
    isAuthenticated: !!token,
    isRefreshing: false,
  },
  reducers: {
    setCredentials: (state, action) => {
      const { token, refresh_token, token_type, user } = action.payload;
      state.token = token;
      state.refreshToken = refresh_token;
      state.token_type = token_type;
      state.user = user;
      state.isAuthenticated = true;
      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", refresh_token);
      localStorage.setItem("token_type", token_type);
      localStorage.setItem("user", JSON.stringify(user));

      // Schedule token refresh
      if (refreshTimeout) clearTimeout(refreshTimeout);
      refreshTimeout = setTimeout(() => {
        refreshAccessToken(refresh_token);
      }, 23 * 60 * 60 * 1000); // Refresh 1 hour before expiration
    },
    setRefreshing: (state, action) => {
      state.isRefreshing = action.payload;
    },
    logout: (state) => {
      state.token = null;
      state.refreshToken = null;
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      if (refreshTimeout) clearTimeout(refreshTimeout);
    },
  },
});

// Axios interceptor for handling token refresh
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is not 401 or request already retried, reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    const state = storeRef.getState().auth;

    if (state.refreshToken && !state.isRefreshing) {
      try {
        const response = await refreshAccessToken(state.refreshToken);
        const { access_token } = response.data;

        // Update authorization header for the original request
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // If refresh fails, logout user
        storeRef.dispatch(authSlice.actions.logout());
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Token refresh function
export const refreshAccessToken = async (refreshToken) => {
  try {
    storeRef.dispatch(authSlice.actions.setRefreshing(true));
    const response = await axios.post("/users/refresh", {
      refresh_token: refreshToken,
    });

    if (response.data.access_token) {
      storeRef.dispatch(
        authSlice.actions.setCredentials({
          token: response.data.access_token,
          refresh_token: refreshToken, // Keep existing refresh token
          token_type: "bearer",
          user: storeRef.getState().auth.user,
        })
      );
    }

    return response;
  } catch (error) {
    storeRef.dispatch(authSlice.actions.logout());
    throw error;
  } finally {
    storeRef.dispatch(authSlice.actions.setRefreshing(false));
  }
};

export const { setCredentials, setRefreshing, logout } = authSlice.actions;
export default authSlice.reducer;
