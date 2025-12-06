import axios from 'axios';
import { CRMEntry } from '../types';
import { MOCK_CRM_DATA } from './mockData';

// In a real app, this comes from env
const API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:8080/api'; 

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Mock delay to simulate network
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const crmApi = {
  // Mocking the get call for demonstration purposes since we don't have a real backend
  getAll: async (): Promise<{crmList: CRMEntry[]}> => {
    // REAL CALL: return api.get("/crm/all");
    await delay(600);
    const stored = localStorage.getItem('mock_crm_data');
    if (stored) return { crmList: JSON.parse(stored) };
    return { crmList: MOCK_CRM_DATA };
  },

  create: async (data: Omit<CRMEntry, 'id'>): Promise<CRMEntry> => {
    // REAL CALL: return api.post("/crm/create", data);
    await delay(400);
    const newEntry = { ...data, id: Date.now() };
    return newEntry;
  },

  update: async (id: number, data: Partial<CRMEntry>): Promise<CRMEntry> => {
     // REAL CALL: return api.put(`/crm/update/${id}`, data);
     await delay(300);
     return { id, ...data } as CRMEntry;
  },

  delete: async (id: number): Promise<void> => {
    // REAL CALL: return api.delete(`/crm/delete/${id}`);
    await delay(300);
  }
};

export const authApi = {
  login: async (email: string, password: string) => {
    // REAL CALL: return api.post("/auth/login", { email, password });
    await delay(800);
    if (email === 'demo@workhub.com' && password === 'demo') {
      return {
        statusCode: 200,
        token: "mock-jwt-token-xyz-123",
        role: "ROLE_ADMIN",
        user: { id: 1, name: "Demo User", email, role: "ROLE_ADMIN" },
        message: "Login successful"
      };
    }
    throw new Error("Invalid credentials (try demo@workhub.com / demo)");
  }
};