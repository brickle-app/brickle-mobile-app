import { useCallback, useEffect } from "react";
import { useWallet } from "../components/wallet/hooks/useWallet";
import { authStore } from "../store/auth.store";

export const useUserBalance = () => {
  const { getBalance } = useWallet();
  const balance = authStore((state) => state.balance);
  const setBalance = authStore((state) => state.setBalance);

  const fetchBalance = useCallback(async () => {
    const balanceValue = await getBalance();
    setBalance(balanceValue.toString());
  }, [getBalance, setBalance]);

  useEffect(() => {
    if (!balance) {
      fetchBalance();
    }
  }, [balance, fetchBalance]);

  return { balance: balance || "0", refreshBalance: fetchBalance };
};
