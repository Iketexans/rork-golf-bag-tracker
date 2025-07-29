import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Bag, BagLocation, Member } from '@/types/bag';
import { bags as initialBags } from '@/mocks/bags';
import { members as initialMembers } from '@/mocks/members';

interface BagState {
  bags: Record<string, Bag[]>; // userId -> bags
  members: Record<string, Member[]>; // userId -> members
  searchQuery: string;
  starredBags: Record<string, string[]>; // userId -> array of bag IDs
  currentUserId: string | null;
  
  // Actions
  setCurrentUser: (userId: string) => void;
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
  getCurrentUserBags: () => Bag[];
  getCurrentUserMembers: () => Member[];
}

export const useBagStore = create<BagState>()(
  persist(
    (set, get) => ({
      bags: {},
      members: {},
      searchQuery: '',
      starredBags: {},
      currentUserId: null,

      setCurrentUser: (userId) => {
        set({ currentUserId: userId });
        // Initialize data for new user if not exists
        const { bags, members, starredBags } = get();
        if (!bags[userId]) {
          set({
            bags: { ...bags, [userId]: userId === 'owner' ? initialBags : [] },
            members: { ...members, [userId]: userId === 'owner' ? initialMembers : [] },
            starredBags: { ...starredBags, [userId]: [] },
          });
        }
      },

      getCurrentUserBags: () => {
        const { bags, currentUserId } = get();
        return currentUserId ? (bags[currentUserId] || []) : [];
      },

      getCurrentUserMembers: () => {
        const { members, currentUserId } = get();
        return currentUserId ? (members[currentUserId] || []) : [];
      },

      addBag: (bag) => {
        const { bags, currentUserId } = get();
        if (!currentUserId) return;
        
        const userBags = bags[currentUserId] || [];
        set({
          bags: {
            ...bags,
            [currentUserId]: [bag, ...userBags],
          },
        });
      },

      addMember: (member) => {
        const { members, currentUserId } = get();
        if (!currentUserId) return;
        
        const userMembers = members[currentUserId] || [];
        set({
          members: {
            ...members,
            [currentUserId]: [member, ...userMembers],
          },
        });
      },

      deleteBag: (bagId) => {
        const { bags, starredBags, currentUserId } = get();
        if (!currentUserId) return;
        
        const userBags = bags[currentUserId] || [];
        const userStarredBags = starredBags[currentUserId] || [];
        
        set({
          bags: {
            ...bags,
            [currentUserId]: userBags.filter((bag) => bag.id !== bagId),
          },
          starredBags: {
            ...starredBags,
            [currentUserId]: userStarredBags.filter(id => id !== bagId),
          },
        });
      },

      updateBagLocation: (bagId, location) => {
        const { bags, currentUserId } = get();
        if (!currentUserId) return;
        
        const userBags = bags[currentUserId] || [];
        set({
          bags: {
            ...bags,
            [currentUserId]: userBags.map((bag) =>
              bag.id === bagId
                ? { ...bag, location, lastUpdated: new Date().toISOString() }
                : bag
            ),
          },
        });
      },

      updateBagNotes: (bagId, notes) => {
        const { bags, currentUserId } = get();
        if (!currentUserId) return;
        
        const userBags = bags[currentUserId] || [];
        set({
          bags: {
            ...bags,
            [currentUserId]: userBags.map((bag) =>
              bag.id === bagId ? { ...bag, notes } : bag
            ),
          },
        });
      },

      setSearchQuery: (query) => {
        set({ searchQuery: query });
      },

      toggleStarBag: (bagId) => {
        const { starredBags, currentUserId } = get();
        if (!currentUserId) return;
        
        const userStarredBags = starredBags[currentUserId] || [];
        set({
          starredBags: {
            ...starredBags,
            [currentUserId]: userStarredBags.includes(bagId)
              ? userStarredBags.filter(id => id !== bagId)
              : [...userStarredBags, bagId],
          },
        });
      },

      getBagsByLocation: (location) => {
        const { getCurrentUserBags } = get();
        return getCurrentUserBags().filter((bag) => bag.location === location);
      },

      getLocationCounts: () => {
        const { getCurrentUserBags } = get();
        const bags = getCurrentUserBags();
        return {
          bagroom: bags.filter((bag) => bag.location === 'bagroom').length,
          player: bags.filter((bag) => bag.location === 'player').length,
          course: bags.filter((bag) => bag.location === 'course').length,
        };
      },

      getMemberById: (id) => {
        const { getCurrentUserMembers } = get();
        return getCurrentUserMembers().find((member) => member.id === id);
      },

      getBagById: (id) => {
        const { getCurrentUserBags } = get();
        return getCurrentUserBags().find((bag) => bag.id === id);
      },

      getFilteredBags: () => {
        const { getCurrentUserBags, getCurrentUserMembers, searchQuery } = get();
        const bags = getCurrentUserBags();
        const members = getCurrentUserMembers();
        
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
        const { getCurrentUserBags, starredBags, currentUserId } = get();
        if (!currentUserId) return [];
        
        const bags = getCurrentUserBags();
        const userStarredBags = starredBags[currentUserId] || [];
        return bags.filter(bag => userStarredBags.includes(bag.id));
      },

      isBagStarred: (bagId) => {
        const { starredBags, currentUserId } = get();
        if (!currentUserId) return false;
        
        const userStarredBags = starredBags[currentUserId] || [];
        return userStarredBags.includes(bagId);
      },
    }),
    {
      name: 'bag-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);