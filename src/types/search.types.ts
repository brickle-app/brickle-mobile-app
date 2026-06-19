import { Asset } from '../interfaces/investments.interface';

export interface SearchState {
  isModalVisible: boolean;
  searchTerm: string;
  recentSearches: string[];
  isLoading: boolean;
  hasSearched: boolean;
  assets: Asset[];
  assetsLoading: boolean;
  assetsError: string | null;
}

export interface SearchActions {
  openModal: () => void;
  closeModal: () => void;
  setSearchTerm: (term: string) => void;
  addRecentSearch: (term: string) => void;
  clearRecentSearches: () => void;
  removeRecentSearch: (term: string) => void;
  setIsLoading: (loading: boolean) => void;
  setHasSearched: (hasSearched: boolean) => void;
  setAssets: (assets: Asset[]) => void;
  setAssetsLoading: (loading: boolean) => void;
  setAssetsError: (error: string | null) => void;
  refreshAssets: () => void;
  clearAllData: () => void;
}

export interface RecentSearch {
  id: string;
  term: string;
  timestamp: number;
}
