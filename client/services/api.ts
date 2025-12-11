
import axios from 'axios';
import { CRMEntry, Task, Meeting, AuthResponse, User } from '../types';

// ============================================================================
// ⚙️ API CONFIGURATION
// ============================================================================

const API_URL = 'http://localhost:8080/api/v1'; 

const api = axios.create({
  baseURL: API_URL,
});

// Attach JWT token to every request if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response Interceptor to handle Token Expiration (401/403)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check for Unauthorized (401) or Forbidden (403) which usually means token expired/invalid
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        // Dispatch a custom event that AuthContext will listen to
        window.dispatchEvent(new Event('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

// Helper to extract error message from backend response
const handleApiError = (error: any) => {
    if (error.response) {
        // Backend returned an error response (4xx, 5xx)
        console.error("API Error:", error.response.status, error.response.data);
        const message = error.response.data?.message || error.response.data?.error || "Request failed";
        throw new Error(message);
    } else if (error.request) {
        // Network error (Backend not reachable)
        console.error("Network Error:", error.request);
        throw new Error("Cannot connect to server. Please check if the backend is running.");
    } else {
        console.error("Request Setup Error:", error.message);
        throw new Error(error.message);
    }
};

// Helper to clean payload
// 1. Removes id, createdAt, lastUpdatedAt (backend handled)
// 2. Removes keys with empty string values (prevents unique constraint/validation errors)
// 3. Preserves empty objects/arrays (Backend converters often prefer {}/[] over null)
const cleanPayload = (data: any): any => {
    if (Array.isArray(data)) {
        return data.map(cleanPayload);
    }
    
    if (data !== null && typeof data === 'object') {
        const cleaned: any = {};
        
        // Fields to explicitly exclude
        const excludeFields = ['id', 'createdAt', 'lastUpdatedAt'];

        Object.keys(data).forEach(key => {
            if (excludeFields.includes(key)) return;

            const value = data[key];

            // Recursively clean objects
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                const cleanedObj = cleanPayload(value);
                // Keep the object even if empty (e.g. socials: {}) to avoid NPE in backend converters
                cleaned[key] = cleanedObj;
            } 
            // Keep non-empty values (0 is valid for numbers, false is valid for booleans)
            else if (value !== "" && value !== null && value !== undefined) {
                cleaned[key] = value;
            }
        });
        return cleaned;
    }
    
    return data;
};

// ============================================================================
// 🔌 API ENDPOINTS
// ============================================================================

// --- USERS API ---
export const usersApi = {
  getAll: async (): Promise<User[]> => {
    try {
        const res = await api.get("/users/all");
        return res.data;
    } catch (error) { throw handleApiError(error); }
  }
};

// --- CRM API ---
export const crmApi = {
  getAll: async (): Promise<{crmList: CRMEntry[]}> => {
    try {
        const res = await api.get("/crm/all");
        return res.data;
    } catch (error) { throw handleApiError(error); }
  },

  create: async (data: Omit<CRMEntry, 'id'>): Promise<CRMEntry> => {
    try {
        const payload = cleanPayload(data);
        const res = await api.post("/crm/create", payload);
        return res.data;
    } catch (error) { throw handleApiError(error); }
  },

  update: async (id: number, data: Partial<CRMEntry>): Promise<CRMEntry> => {
     try {
        const payload = cleanPayload(data);
        const res = await api.put(`/crm/update/${id}`, payload);
        return res.data;
     } catch (error) { throw handleApiError(error); }
  },

  delete: async (id: number): Promise<void> => {
    try {
        await api.delete(`/crm/delete/${id}`);
    } catch (error) { throw handleApiError(error); }
  }
};

// --- TASKS API ---
export const tasksApi = {
  getAll: async (): Promise<Task[]> => {
    try {
        const res = await api.get("/tasks/all");
        return res.data;
    } catch (error) { throw handleApiError(error); }
  },

  create: async (data: Omit<Task, 'id' | 'createdAt'>): Promise<Task> => {
    try {
        const payload = cleanPayload(data);
        const res = await api.post("/tasks/create", payload);
        return res.data;
    } catch (error) { throw handleApiError(error); }
  },

  update: async (id: number, data: Partial<Task>): Promise<Task> => {
     try {
        const payload = cleanPayload(data);
        const res = await api.put(`/tasks/update/${id}`, payload);
        return res.data;
     } catch (error) { throw handleApiError(error); }
  },

  delete: async (id: number): Promise<void> => {
    try {
        await api.delete(`/tasks/delete/${id}`);
    } catch (error) { throw handleApiError(error); }
  }
};

// --- MEETINGS API ---
export const meetingsApi = {
  getAll: async (): Promise<Meeting[]> => {
    try {
        const res = await api.get("/meetings/all");
        return res.data;
    } catch (error) { throw handleApiError(error); }
  },

  create: async (data: Omit<Meeting, 'id' | 'createdAt'>): Promise<Meeting> => {
    try {
        const payload = cleanPayload(data);
        const res = await api.post("/meetings/create", payload);
        return res.data;
    } catch (error) { throw handleApiError(error); }
  },

  update: async (id: number, data: Partial<Meeting>): Promise<Meeting> => {
    try {
        const payload = cleanPayload(data);
        const res = await api.put(`/meetings/update/${id}`, payload);
        return res.data;
    } catch (error) { throw handleApiError(error); }
  },

  delete: async (id: number): Promise<void> => {
    try {
        await api.delete(`/meetings/delete/${id}`);
    } catch (error) { throw handleApiError(error); }
  }
};

// --- AUTH API ---
export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
        const res = await api.post("/auth/login", { email, password });
        return res.data;
    } catch (error) { throw handleApiError(error); }
  }
};
