import React from "react";
import { View } from "react-native";
import { ActionButtonsRow } from "./ActionButtonsRow";

export type WalletTabType =
  | "send"
  | "recharge"
  | "withdraw"
  | "transactions"
  | null;

interface WalletTabsProps {
  activeTab: WalletTabType;
  onTabChange: (tab: WalletTabType) => void;
}

/**
 * Componente que gestiona el sistema de tabs en la sección de wallet
 */
export const WalletTabs = ({ activeTab, onTabChange }: WalletTabsProps) => {
  const handleTabChange = (tab: WalletTabType) => {
    // If the tab active is the same that was selected, we close it
    if (activeTab === tab) {
      onTabChange(null); // Call parent handler
    } else {
      onTabChange(tab); // Call parent handler
    }
  };

  return (
    <View>
      {/* Botones de acción actuando como tabs */}
      <ActionButtonsRow
        activeTab={activeTab}
        onSend={() => handleTabChange("send")}
        onRecharge={() => handleTabChange("recharge")}
        onWithdraw={() => handleTabChange("withdraw")}
        onTransactions={() => handleTabChange("transactions")}
      />
    </View>
  );
};
