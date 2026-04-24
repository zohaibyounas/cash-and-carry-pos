import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === "production" 
    ? "https://cash-and-carry-pos-backend.onrender.com/api" 
    : "http://localhost:5001/api"),
  headers: {
    "Content-Type": "application/json",
  },
});
//dddd
// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const storeData = localStorage.getItem("selectedStore");
    if (storeData) {
      try {
        const store = JSON.parse(storeData);
        // Avoid attaching store header to authentication routes which don't
        // expect it (e.g. /auth/login). Some servers may error when unexpected
        // headers are present, so only add the header for non-auth routes.
        const url = config.url || "";
        const isAuthRoute = url.includes("/auth");
        if (!isAuthRoute && store && store._id) {
          config.headers["x-store-id"] = store._id;
        }
      } catch (e) {
        console.error("Failed to parse selectedStore from localStorage", e);
        // Optionally clear invalid data
        // localStorage.removeItem("selectedStore");
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
