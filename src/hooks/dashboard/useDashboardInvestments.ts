import { Asset, Investment } from "@/src/interfaces/investments.interface";
import { getInvestmentsByUserId } from "@/src/services/brickle.service";
import { authStore } from "@/src/store/auth.store";
import { useEffect, useState, useCallback } from "react";

export const useDashboardInvestments = () => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const user = authStore((state) => state.user);

  const fetchInvestments = useCallback(async () => {
    if (user?.email && user?.id) {
      setIsLoading(true);
      try {
        const data = await getInvestmentsByUserId(
          user.email,
          user.id
        );
        if (data) {
          setInvestments(data);
        }
      } catch (error) {
        // Service already handles session errors, just log here
        console.error("Error fetching investments:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, [user?.email, user?.id]);

  useEffect(() => {
    fetchInvestments();
  }, [fetchInvestments]);

  return {
    investments,
    isLoading,
    setInvestments,
    refetch: fetchInvestments,
  };
};
