
import axios from 'axios';
import { CRMEntry, Task, Meeting, AuthResponse } from '../types';

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

// ============================================================================
// 🔌 API ENDPOINTS
// ============================================================================

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
        const res = await api.post("/crm/create", data);
        return res.data;
    } catch (error) { throw handleApiError(error); }
  },

  update: async (id: number, data: Partial<CRMEntry>): Promise<CRMEntry> => {
     try {
        const res = await api.put(`/crm/update/${id}`, data);
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
        const res = await api.post("/tasks/create", data);
        return res.data;
    } catch (error) { throw handleApiError(error); }
  },

  update: async (id: number, data: Partial<Task>): Promise<Task> => {
     try {
        const res = await api.put(`/tasks/update/${id}`, data);
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
        const res = await api.post("/meetings/create", data);
        return res.data;
    } catch (error) { throw handleApiError(error); }
  },

  update: async (id: number, data: Partial<Meeting>): Promise<Meeting> => {
    try {
        const res = await api.put(`/meetings/update/${id}`, data);
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
