import React from "react";
import { View } from "react-native";
import { Skeleton } from "./Skeleton";

/** Placeholder rows with the same footprint as a movement row, so nothing jumps when data arrives. */
export const TransactionRowSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <View style={{ paddingHorizontal: 16, gap: 12 }}>
    {Array.from({ length: rows }, (_, index) => (
      <View
        key={index}
        className="flex-row items-center px-4"
        style={{ height: 67, borderRadius: 16, backgroundColor: "#F6F6F6" }}
      >
        <Skeleton width={40} height={40} borderRadius={20} />
        <View className="flex-1 ml-3 gap-2">
          <Skeleton width="70%" height={13} />
          <Skeleton width="30%" height={11} />
        </View>
        <Skeleton width={72} height={14} />
      </View>
    ))}
  </View>
);
