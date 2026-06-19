import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SearchState, SearchActions } from "../types/search.types";

const RECENT_SEARCHES_KEY = "@recent_searches";
const MAX_RECENT_SEARCHES = 5;

interface SearchStore extends SearchState, SearchActions {}

const initialState: SearchState = {
  isModalVisible: false,
  searchTerm: "",
  recentSearches: [],
  isLoading: false,
  hasSearched: false,
  assets: [],
  assetsLoading: false,
  assetsError: null,
};

export const searchStore = create<SearchStore>((set, get) => ({
  ...initialState,

  openModal: () => set({ isModalVisible: true }),

  closeModal: () =>
    set({
      isModalVisible: false,
      searchTerm: "",
      hasSearched: false,
    }),

  setSearchTerm: (term: string) =>
    set({ searchTerm: term, hasSearched: false }),

  setIsLoading: (loading: boolean) => set({ isLoading: loading }),

  setHasSearched: (hasSearched: boolean) => set({ hasSearched }),

  addRecentSearch: async (term: string) => {
    if (!term.trim()) return;

    const currentSearches = get().recentSearches;
    const filteredSearches = currentSearches.filter(
      (search) => search !== term
    );
    const newSearches = [term, ...filteredSearches].slice(
      0,
      MAX_RECENT_SEARCHES
    );

    set({ recentSearches: newSearches });

    try {
      await AsyncStorage.setItem(
        RECENT_SEARCHES_KEY,
        JSON.stringify(newSearches)
      );
    } catch (error) {
      console.error("Error saving recent searches:", error);
    }
  },

  clearRecentSearches: async () => {
    set({ recentSearches: [] });
    try {
      await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch (error) {
      console.error("Error clearing recent searches:", error);
    }
  },

  removeRecentSearch: async (term: string) => {
    const currentSearches = get().recentSearches;
    const filteredSearches = currentSearches.filter(
      (search) => search !== term
    );

    set({ recentSearches: filteredSearches });

    try {
      await AsyncStorage.setItem(
        RECENT_SEARCHES_KEY,
        JSON.stringify(filteredSearches)
      );
    } catch (error) {
      console.error("Error removing recent search:", error);
    }
  },

  // Asset management actions
  setAssets: (assets) => set({ assets, assetsError: null }),

  setAssetsLoading: (assetsLoading) => set({ assetsLoading }),

  setAssetsError: (assetsError) => set({ assetsError }),

  refreshAssets: () => {
    // This will be used to trigger asset refresh from components
    // The actual fetching logic is in the useSearchAssets hook
    set({ assetsLoading: true, assetsError: null });
  },

  // Clear all search data during logout
  clearAllData: async () => {
    set(initialState);
    try {
      await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch (error) {
      console.error("Error clearing search data:", error);
    }
  },
}));

// Load recent searches from AsyncStorage on app start
export const loadRecentSearches = async () => {
  try {
    const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
    if (stored) {
      const searches = JSON.parse(stored);
      searchStore.setState({ recentSearches: searches });
    }
  } catch (error) {
    console.error("Error loading recent searches:", error);
  }
};
