import { Asset } from "@/src/interfaces/investments.interface";
import { getInvestmentsGroupedByCategory } from "@/src/services/brickle.service";
import { authStore } from "@/src/store/auth.store";
import { useEffect, useState } from "react";
import { usePullToRefresh } from "../usePullToRefresh";

export const useFetchTrendingAssets = () => {
  const [trendingAssets, setTrendingAssets] = useState<Asset[] | null>(null);
  const [isLoadingTrending, setIsLoadingTrending] = useState(true);
  const user = authStore((state) => state.user);

  const fetchTrendingAssets = async () => {
    if (user?.email) {
      setIsLoadingTrending(true);
      try {
        const data = await getInvestmentsGroupedByCategory(user?.email || "");
        const sorted = [...data].sort(
          (a, b) => (b.tokensAvailable ?? 0) - (a.tokensAvailable ?? 0)
        );
        setTrendingAssets(sorted);
      } catch (error) {
        console.error('Error fetching trending assets:', error);
      } finally {
        setIsLoadingTrending(false);
      }
    } else {
      setIsLoadingTrending(false);
    }
  };

  const { refreshControlProps } = usePullToRefresh({
    onRefresh: fetchTrendingAssets,
  });

  useEffect(() => {
    if (!user?.email) return;
    fetchTrendingAssets();
  }, [user]);

  return {
    refreshControlProps,
    trendingAssets,
    isLoadingTrending
  }
}