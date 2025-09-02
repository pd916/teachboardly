import { create } from 'zustand';
// import { persist } from 'zustand/middleware';

type Guest = {
  name?: string;
  id?: string;
  boardId?: string;
};

type GuestStore = {
  guests: Guest[];
  currentGuest?: Guest; 
  addGuest: (guest: Guest) => void;
  removeGuest: (id:string) => void;
  setCurrentGuest: (guest: Guest) => void;
  clearGuests: () => void;
};

export const useGuestStore = create<GuestStore>((set) => ({
  guests: [],
  currentGuest: undefined,
  // kickedGuest: undefined
  addGuest: (guest) =>
    set((state) => ({
      
     guests: state.guests.some(g => g.id === guest.id) 
      ? state.guests 
      : [...state.guests, guest]
    })),
    removeGuest: (id:string) =>
    set((state) => ({
      guests: state.guests.filter((guest) => guest.id !== id),
    })),
  setCurrentGuest: (guest) => set({ currentGuest: guest }),
  // setKickedGuest: (id) => set({id})
  clearGuests: () => set({ guests: [], currentGuest: undefined }),
}));