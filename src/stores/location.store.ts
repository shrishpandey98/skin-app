import { create } from 'zustand';

interface LocationState {
  selectedCity: string;
  selectedArea: string | null;
  setCity: (city: string) => void;
  setArea: (area: string | null) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  selectedCity: 'Chandigarh',
  selectedArea: null,
  setCity: (city: string) => set({ selectedCity: city }),
  setArea: (area: string | null) => set({ selectedArea: area }),
}));
