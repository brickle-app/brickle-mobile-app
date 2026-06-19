import { useEffect, useState } from "react";
import { Investment } from "@/src/interfaces/investments.interface";
import { readClaimableMicro } from "@/src/utils/leasingInvestorReads";

export interface ClaimableInvestmentRow {
  investment: Investment;
  claimableMicro: bigint;
}

/**
 * Inversiones con renta reclamable on-chain (> 0) para listados tipo “Rentas por reclamar”.
 */
export function useClaimableRentInvestments(
  investments: Investment[],
  walletAddress: string | undefined | null
) {
  const [rows, setRows] = useState<ClaimableInvestmentRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!walletAddress || investments.length === 0) {
      setRows([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    (async () => {
      const results = await Promise.all(
        investments.map(async (investment) => {
          const addr = investment.leasing.contractAddress;
          if (!addr) return null;
          try {
            const micro = await readClaimableMicro(addr, walletAddress);
            if (micro > 0n) {
              const row: ClaimableInvestmentRow = { investment, claimableMicro: micro };
              return row;
            }
          } catch {
            /* ignorar fallos de lectura por activo */
          }
          return null;
        })
      );

      if (!cancelled) {
        setRows(results.filter((r): r is ClaimableInvestmentRow => r !== null));
        setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [investments, walletAddress]);

  return { claimableInvestments: rows, isLoading };
}
