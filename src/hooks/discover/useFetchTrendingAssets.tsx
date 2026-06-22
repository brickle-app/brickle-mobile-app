import { Asset } from "@/src/interfaces/investments.interface";
import { getInvestmentsGroupedByCategory } from "@/src/services/brickle.service";
import { authStore } from "@/src/store/auth.store";
import { useCallback, useEffect, useState } from "react";
import { usePullToRefresh } from "../usePullToRefresh";

export const useFetchTrendingAssets = () => {
  const [trendingAssets, setTrendingAssets] = useState<Asset[] | null>(null);
  const [isLoadingTrending, setIsLoadingTrending] = useState(true);
  const [trendingErrorMessage, setTrendingErrorMessage] = useState<string | null>(null);
  const userEmail = authStore((state) => state.user?.email);

  const fetchTrendingAssets = useCallback(async () => {
    if (!userEmail) {
      setTrendingAssets([]);
      setIsLoadingTrending(false);
      return;
    }

    setIsLoadingTrending(true);
    setTrendingErrorMessage(null);
    try {
      const data = await getInvestmentsGroupedByCategory(userEmail);
      const sorted = [...data].sort(
        (a, b) => (b.tokensAvailable ?? 0) - (a.tokensAvailable ?? 0)
      );
      setTrendingAssets(sorted);
    } catch (error) {
      console.error('Error fetching trending assets:', error);
      setTrendingAssets([]);
      setTrendingErrorMessage("No pudimos cargar los activos en tendencia. Intenta nuevamente.");
    } finally {
      setIsLoadingTrending(false);
    }
  }, [userEmail]);

  const { refreshControlProps } = usePullToRefresh({
    onRefresh: fetchTrendingAssets,
  });

  useEffect(() => {
    fetchTrendingAssets();
  }, [fetchTrendingAssets]);

  return {
    refreshControlProps,
    trendingAssets,
    isLoadingTrending,
    trendingErrorMessage,
  }
}
