import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Bag, BagLocation, Member } from '@/types/bag';
import { bags as initialBags } from '@/mocks/bags';
import { members as initialMembers } from '@/mocks/members';

interface BagState {
  bags: Bag[];
  members: Member[];
  searchQuery: string;
  starredBags: string[]; // Array of bag IDs that are starred for today
  
  // Actions
  addBag: (bag: Bag) => void;
  addMember: (member: Member) => void;
  deleteBag: (bagId: string) => void;
  updateBagLocation: (bagId: string, location: BagLocation) => void;
  updateBagNotes: (bagId: string, notes: string) => void;
  setSearchQuery: (query: string) => void;
  toggleStarBag: (bagId: string) => void;
  getBagsByLocation: (location: BagLocation) => Bag[];
  getLocationCounts: () => Record<BagLocation, number>;
  getMemberById: (id: string) => Member | undefined;
  getBagById: (id: string) => Bag | undefined;
  getFilteredBags: () => Bag[];
  getStarredBags: () => Bag[];
  isBagStarred: (bagId: string) => boolean;
}

export const useBagStore = create<BagState>()(
  persist(
    (set, get) => ({
      bags: initialBags,
      members: initialMembers,
      searchQuery: '',
      starredBags: [],

      addBag: (bag) => {
        set((state) => ({
          bags: [bag, ...state.bags],
        }));
      },

      addMember: (member) => {
        set((state) => ({
          members: [member, ...state.members],
        }));
      },

      deleteBag: (bagId) => {
        set((state) => ({
          bags: state.bags.filter((bag) => bag.id !== bagId),
          starredBags: state.starredBags.filter(id => id !== bagId),
        }));
      },

      updateBagLocation: (bagId, location) => {
        set((state) => ({
          bags: state.bags.map((bag) =>
            bag.id === bagId
              ? { ...bag, location, lastUpdated: new Date().toISOString() }
              : bag
          ),
        }));
      },

      updateBagNotes: (bagId, notes) => {
        set((state) => ({
          bags: state.bags.map((bag) =>
            bag.id === bagId ? { ...bag, notes } : bag
          ),
        }));
      },

      setSearchQuery: (query) => {
        set({ searchQuery: query });
      },

      toggleStarBag: (bagId) => {
        set((state) => ({
          starredBags: state.starredBags.includes(bagId)
            ? state.starredBags.filter(id => id !== bagId)
            : [...state.starredBags, bagId],
        }));
      },

      getBagsByLocation: (location) => {
        return get().bags.filter((bag) => bag.location === location);
      },

      getLocationCounts: () => {
        const bags = get().bags;
        return {
          bagroom: bags.filter((bag) => bag.location === 'bagroom').length,
          player: bags.filter((bag) => bag.location === 'player').length,
          course: bags.filter((bag) => bag.location === 'course').length,
        };
      },

      getMemberById: (id) => {
        return get().members.find((member) => member.id === id);
      },

      getBagById: (id) => {
        return get().bags.find((bag) => bag.id === id);
      },

      getFilteredBags: () => {
        const { bags, members, searchQuery } = get();
        if (!searchQuery) return bags;

        const lowerQuery = searchQuery.toLowerCase();
        return bags.filter((bag) => {
          const member = members.find((m) => m.id === bag.memberId);
          return (
            bag.bagNumber.toLowerCase().includes(lowerQuery) ||
            member?.name.toLowerCase().includes(lowerQuery) ||
            member?.membershipId.toLowerCase().includes(lowerQuery)
          );
        });
      },

      getStarredBags: () => {
        const { bags, starredBags } = get();
        return bags.filter(bag => starredBags.includes(bag.id));
      },

      isBagStarred: (bagId) => {
        return get().starredBags.includes(bagId);
      },
    }),
    {
      name: 'bag-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);