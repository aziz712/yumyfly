import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_APP_URL + "/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // If using authentication (cookies, JWT)
});

// Request Interceptor: Attach token if needed
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    console.log("Sending request to:", config.url);

    // Get token from localStorage
    try {
      const authState = localStorage.getItem("auth-storage");
      if (authState) {
        const { state } = JSON.parse(authState);
        if (state.token) {
          config.headers.Authorization = `Bearer ${state.token}`;
          console.log("Added token to request");
        }
      }
    } catch (error) {
      console.error("Error accessing auth token:", error);
    }

    return config;
  },
  (error: AxiosError): Promise<never> => Promise.reject(error)
);

api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,
  (error: AxiosError): Promise<never> => {
    console.error("API Error:", error);

    // Handle 401 Unauthorized errors (token expired, invalid, etc.)
    if (error.response?.status === 401) {
      console.log("Unauthorized request - might need to log out user");
      // You could dispatch a logout action here if needed
    }

    return Promise.reject(error);
  }
);

export default api;
