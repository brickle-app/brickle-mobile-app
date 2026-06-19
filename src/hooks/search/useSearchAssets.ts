import { useState, useEffect, useMemo } from "react";
import { Asset } from "@/src/interfaces/investments.interface";
import { getDiscoverAssets } from "@/src/services/brickle.service";
import { authStore } from "@/src/store/auth.store";
import { mockCategories } from "@/src/data/mock-categories";

interface UseSearchAssetsReturn {
  assets: Asset[];
  filteredAssets: Asset[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  searchAssets: (query: string) => Asset[];
}

export const useSearchAssets = (searchTerm?: string): UseSearchAssetsReturn => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const user = authStore((state) => state.user);

  // Extract category names from mock categories
  const categoryNames = useMemo(
    () => mockCategories.map((category) => category.name),
    []
  );

  const fetchAssets = async () => {
    if (!user?.email) {
      setError("User email not available");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const fetchedAssets = await getDiscoverAssets(
        user.email,
        true,
        categoryNames,
        100
      );

      if (fetchedAssets && fetchedAssets.length > 0) {
        setAssets(fetchedAssets);
      } else {
        setAssets([]);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch assets";
      setError(errorMessage);
      setAssets([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  // Filter assets based on search term
  const filteredAssets = useMemo(() => {
    if (!searchTerm || !searchTerm.trim()) {
      return assets;
    }

    const query = searchTerm.toLowerCase();
    return assets.filter(
      (asset) =>
        asset.name?.toLowerCase().includes(query) ||
        asset.description?.toLowerCase().includes(query) ||
        asset.type?.toLowerCase().includes(query) ||
        asset.company?.name?.toLowerCase().includes(query)
    );
  }, [assets, searchTerm]);

  // Function to search assets programmatically
  const searchAssets = (query: string): Asset[] => {
    if (!query || !query.trim()) {
      return assets;
    }

    const searchQuery = query.toLowerCase();
    return assets.filter(
      (asset) =>
        asset.name?.toLowerCase().includes(searchQuery) ||
        asset.description?.toLowerCase().includes(searchQuery) ||
        asset.type?.toLowerCase().includes(searchQuery) ||
        asset.company?.name?.toLowerCase().includes(searchQuery)
    );
  };

  // Refetch function for manual refresh
  const refetch = () => {
    fetchAssets();
  };

  // Fetch assets on mount and when user email changes
  useEffect(() => {
    if (user?.email) {
      fetchAssets();
    }
  }, [user?.email]);

  return {
    assets,
    filteredAssets,
    isLoading,
    error,
    refetch,
    searchAssets,
  };
};
