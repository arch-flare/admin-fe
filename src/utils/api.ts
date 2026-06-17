import axios, {
  AxiosInstance,
  AxiosResponse,
  AxiosError,
  AxiosRequestConfig,
} from "axios";
import Cookies from "js-cookie";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://archflaire.com/api/";
const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || "https://archflaire.com/storage/";

interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: any;
}

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

api.interceptors.request.use(
  (config: AxiosRequestConfig): any => {
    const token = Cookies.get("auth_token");
    config.headers = config.headers || {};

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const isFormData = config.data instanceof FormData;
    if (!isFormData) {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error: AxiosError) => {
    console.error("Request Error:", error);
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response: AxiosResponse): any => {
    return response.data;
  },
  (error: AxiosError) => {
    if (process.env.NODE_ENV !== "production") {
      console.error("API Error:", error?.message);
    }

    // On an expired/invalid session, clear the token and bounce to sign-in.
    if (error.response?.status === 401 && typeof window !== "undefined") {
      Cookies.remove("auth_token");
      if (!window.location.pathname.startsWith("/auth/")) {
        window.location.href = "/auth/signin";
      }
    }

    return Promise.reject(error);
  },
);

const createFormDataConfig = (
  onUploadProgress?: (progressEvent: any) => void,
): AxiosRequestConfig => ({
  headers: {},
  onUploadProgress,
});

export const get = <T = any>(
  url: string,
  params: object = {},
): Promise<ApiResponse<T>> => api.get<T, ApiResponse<T>>(url, { params });

export const post = <T = any>(
  url: string,
  data?: object | FormData,
  config: AxiosRequestConfig = {},
  onUploadProgress?: (progressEvent: any) => void,
): Promise<ApiResponse<T>> => {
  if (!data) return api.post<T, ApiResponse<T>>(url);

  const isFormData = data instanceof FormData;
  const finalConfig = isFormData
    ? { ...createFormDataConfig(onUploadProgress), ...config }
    : config;

  return api.post<T, ApiResponse<T>>(url, data, finalConfig);
};

export const put = <T = any>(
  url: string,
  data?: object | FormData,
  config: AxiosRequestConfig = {},
  onUploadProgress?: (progressEvent: any) => void,
): Promise<ApiResponse<T>> => {
  if (!data) return api.put<T, ApiResponse<T>>(url);

  const isFormData = data instanceof FormData;
  const finalConfig = isFormData
    ? { ...createFormDataConfig(onUploadProgress), ...config }
    : config;

  return api.put<T, ApiResponse<T>>(url, data, finalConfig);
};

export const remove = <T = any>(
  url: string,
  params: object = {},
): Promise<ApiResponse<T>> => api.delete<T, ApiResponse<T>>(url, { params });

// Helper function to format image URLs
export const getFullImageUrl = (imagePath: string): string => {
  // Check if the path already includes the storage URL
  if (imagePath.startsWith('http')) {
      return imagePath;
  }
  
  // Remove any leading slash to avoid double slashes
  const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
  
  return `${STORAGE_URL}${cleanPath}`;
};

export default api;
