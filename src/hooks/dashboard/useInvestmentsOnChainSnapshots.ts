import { useCallback, useEffect, useState } from "react";
import { Investment } from "@/src/interfaces/investments.interface";
import { PartialBrickleUser } from "@/src/types/user.types";
import {
  InvestorOnChainSnapshot,
  loadInvestorOnChainSnapshot,
} from "@/src/utils/leasingInvestorReads";

export function useInvestmentsOnChainSnapshots(
  investments: Investment[],
  user: PartialBrickleUser | null | undefined
) {
  const [snapshotsByInvestmentId, setSnapshotsByInvestmentId] = useState<
    Record<string, InvestorOnChainSnapshot>
  >({});
  const [isLoadingSnapshots, setIsLoadingSnapshots] = useState(false);

  const loadSnapshots = useCallback(async () => {
    if (!user || investments.length === 0) {
      setSnapshotsByInvestmentId({});
      setIsLoadingSnapshots(false);
      return;
    }
    setIsLoadingSnapshots(true);
    try {
      const pairs = await Promise.all(
        investments.map(async (inv) => {
          if (!inv.leasing?.contractAddress) {
            return [inv.id, undefined] as const;
          }
          const snap = await loadInvestorOnChainSnapshot(inv, user);
          return [inv.id, snap] as const;
        })
      );
      const next: Record<string, InvestorOnChainSnapshot> = {};
      for (const [id, snap] of pairs) {
        if (snap) next[id] = snap;
      }
      setSnapshotsByInvestmentId(next);
    } catch (e) {
      console.warn("useInvestmentsOnChainSnapshots", e);
      setSnapshotsByInvestmentId({});
    } finally {
      setIsLoadingSnapshots(false);
    }
  }, [user, investments]);

  useEffect(() => {
    void loadSnapshots();
  }, [loadSnapshots]);

  return {
    snapshotsByInvestmentId,
    isLoadingSnapshots,
    refetchSnapshots: loadSnapshots,
  };
}
