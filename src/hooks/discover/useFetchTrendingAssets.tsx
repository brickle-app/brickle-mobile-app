import { Asset } from "@/src/interfaces/investments.interface";
import { getInvestmentsGroupedByCategory } from "@/src/services/brickle.service";
import { authStore } from "@/src/store/auth.store";
import { useCallback, useEffect, useState } from "react";
import { usePullToRefresh } from "../usePullToRefresh";

/** Last successful result per user, so reopening the tab shows content instantly while it refreshes. */
const trendingCache = new Map<string, Asset[]>();

export const useFetchTrendingAssets = () => {
  const userEmail = authStore((state) => state.user?.email);
  const cached = userEmail ? trendingCache.get(userEmail) : undefined;
  const [trendingAssets, setTrendingAssets] = useState<Asset[] | null>(cached ?? null);
  const [isLoadingTrending, setIsLoadingTrending] = useState(cached === undefined);
  const [trendingErrorMessage, setTrendingErrorMessage] = useState<string | null>(null);

  const fetchTrendingAssets = useCallback(async () => {
    if (!userEmail) {
      setTrendingAssets([]);
      setIsLoadingTrending(false);
      return;
    }

    // Keep showing the cached list while refreshing; only show skeletons on a cold start.
    setIsLoadingTrending(!trendingCache.has(userEmail));
    setTrendingErrorMessage(null);
    try {
      const data = await getInvestmentsGroupedByCategory(userEmail);
      const sorted = [...data].sort(
        (a, b) => (b.tokensAvailable ?? 0) - (a.tokensAvailable ?? 0)
      );
      trendingCache.set(userEmail, sorted);
      setTrendingAssets(sorted);
    } catch (error) {
      console.warn('Error fetching trending assets:', error);
      // A failed refresh must not wipe a list the user is already looking at.
      if (!trendingCache.has(userEmail)) {
        setTrendingAssets([]);
        setTrendingErrorMessage("No pudimos cargar los activos en tendencia. Intenta nuevamente.");
      }
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
