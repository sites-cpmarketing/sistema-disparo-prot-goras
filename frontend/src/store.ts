import { create } from 'zustand';
import { Contact, ContactList, WhatsAppTemplate, DispatchJob } from './types';

interface AppState {
  // Auth
  isAuthenticated: boolean;
  ghlApiKey: string;
  ghlLocationId: string;
  setAuth: (apiKey: string, locationId: string) => void;
  logout: () => void;

  // Data
  contacts: Contact[];
  lists: ContactList[];
  templates: WhatsAppTemplate[];
  setContacts: (contacts: Contact[]) => void;
  setLists: (lists: ContactList[]) => void;
  setTemplates: (templates: WhatsAppTemplate[]) => void;

  // Dispatch
  dispatchHistory: DispatchJob[];
  currentJob: DispatchJob | null;
  addJob: (job: DispatchJob) => void;
  updateJob: (job: DispatchJob) => void;
  setHistory: (history: DispatchJob[]) => void;

  // UI State
  selectedTab: 'new' | 'history' | 'settings';
  setSelectedTab: (tab: 'new' | 'history' | 'settings') => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Auth
  isAuthenticated: false,
  ghlApiKey: localStorage.getItem('ghl_api_key') || '',
  ghlLocationId: localStorage.getItem('ghl_location_id') || '',
  setAuth: (apiKey: string, locationId: string) => {
    localStorage.setItem('ghl_api_key', apiKey);
    localStorage.setItem('ghl_location_id', locationId);
    set({ isAuthenticated: true, ghlApiKey: apiKey, ghlLocationId: locationId });
  },
  logout: () => {
    localStorage.removeItem('ghl_api_key');
    localStorage.removeItem('ghl_location_id');
    set({
      isAuthenticated: false,
      ghlApiKey: '',
      ghlLocationId: '',
      contacts: [],
      lists: [],
      templates: [],
      dispatchHistory: [],
    });
  },

  // Data
  contacts: [],
  lists: [],
  templates: [],
  setContacts: (contacts) => set({ contacts }),
  setLists: (lists) => set({ lists }),
  setTemplates: (templates) => set({ templates }),

  // Dispatch
  dispatchHistory: [],
  currentJob: null,
  addJob: (job) => set((state) => ({
    dispatchHistory: [job, ...state.dispatchHistory],
    currentJob: job,
  })),
  updateJob: (job) => set((state) => ({
    dispatchHistory: state.dispatchHistory.map((j) => j.id === job.id ? job : j),
    currentJob: state.currentJob?.id === job.id ? job : state.currentJob,
  })),
  setHistory: (history) => set({ dispatchHistory: history }),

  // UI State
  selectedTab: 'new',
  setSelectedTab: (tab) => set({ selectedTab: tab }),
}));
