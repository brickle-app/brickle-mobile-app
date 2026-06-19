import React, { useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Investment } from "@/src/interfaces/investments.interface";
import { Colors } from "@/assets/Colors";
import { DashboardInvestmentListRow } from "@/src/components/dashboard/DashboardInvestmentListRow";
import { computeInvestmentOnChainPosition } from "@/src/utils/investmentOnChainPosition";
import type { InvestorOnChainSnapshot } from "@/src/utils/leasingInvestorReads";

interface DashboardTopInvestmentsListProps {
  investments: Investment[];
  isLoading: boolean;
  onPressInvestment: (investment: Investment) => void;
  snapshotsByInvestmentId?: Record<string, InvestorOnChainSnapshot>;
}

export function DashboardTopInvestmentsList({
  investments,
  isLoading,
  onPressInvestment,
  snapshotsByInvestmentId,
}: DashboardTopInvestmentsListProps) {
  const topThree = useMemo(() => {
    if (!investments?.length) return [];
    return [...investments]
      .map((inv) => {
        const snap = snapshotsByInvestmentId?.[inv.id];
        const pos = computeInvestmentOnChainPosition(inv, snap);
        return { inv, sortKey: pos.bricksSortKey };
      })
      .sort((a, b) => b.sortKey - a.sortKey)
      .slice(0, 3)
      .map(({ inv }) => inv);
  }, [investments, snapshotsByInvestmentId]);

  if (isLoading) {
    return (
      <View className="w-full overflow-hidden rounded-2xl bg-white shadow-sm">
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            className={`flex-row items-center px-3 py-3 ${i < 2 ? "border-b border-green-secondary/35" : ""}`}
          >
            <View className="mr-3 size-11 rounded-full bg-gray-200" />
            <View className="min-w-0 flex-1 justify-center gap-2 pl-1">
              <View className="h-4 w-[68%] rounded bg-gray-200" />
              <View className="h-5 w-[42%] rounded bg-gray-200" />
              <View className="h-3 w-[28%] rounded bg-gray-200" />
            </View>
            <View className="h-7 w-16 rounded-full bg-gray-200" />
          </View>
        ))}
      </View>
    );
  }

  if (topThree.length === 0) {
    return null;
  }

  return (
    <View className="w-full overflow-hidden rounded-2xl bg-white shadow-sm">
      {topThree.map((inv, index) => (
        <DashboardInvestmentListRow
          key={inv.id}
          investment={inv}
          onChainSnapshot={snapshotsByInvestmentId?.[inv.id]}
          showBottomBorder={index < topThree.length - 1}
          onPress={() => onPressInvestment(inv)}
        />
      ))}

      <View className="h-px w-full bg-green-secondary/40" />

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => router.push("/(stack)/(tabs)/portfolio")}
        className="w-full flex-row items-center justify-center gap-1 py-3"
      >
        <Text className="font-libre-bold text-sm text-blue-primary">
          Ver tu portafolio completo
        </Text>
        <Ionicons name="chevron-forward" size={18} color={Colors.bluePrimary} />
      </TouchableOpacity>
    </View>
  );
}
