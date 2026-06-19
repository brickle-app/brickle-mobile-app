import { useState, useCallback } from "react";
import { refreshStore } from "@/src/store/refresh.store";
import { Colors } from "@/assets/Colors";

interface UsePullToRefreshProps {
  onRefresh: () => Promise<void> | void;
}

export const usePullToRefresh = ({ onRefresh }: UsePullToRefreshProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { triggerRefresh } = refreshStore();

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
      triggerRefresh();
    } catch (error) {
      console.error("Error during pull to refresh:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh, triggerRefresh]);

  return {
    refreshControlProps: {
      refreshing: isRefreshing,
      onRefresh: handleRefresh,
      tintColor: Colors.bluePrimary,
      colors: [Colors.bluePrimary],
    },
    isRefreshing,
    handleRefresh,
  };
};
