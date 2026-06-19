import React, { useMemo } from "react";
import { View, Text, useWindowDimensions } from "react-native";
import { PieChart } from "react-native-gifted-charts";
import { useDashboardInvestments } from "@/src/hooks/dashboard/useDashboardInvestments";
import CATEGORIES, { getCategory, getCategoryBgColor } from "@/src/utils/categories";

function normalizeCategoryKey(type: string): string {
  const key = type?.trim() || "";
  if (!key) return "";
  const byKey = getCategory(key);
  if (byKey) return key;
  const entry = Array.from(CATEGORIES.entries()).find(
    ([, c]) => c.name.toLowerCase() === key.toLowerCase()
  );
  return entry ? entry[0] : key;
}

export function PortfolioCompositionChart() {
  const { investments, isLoading } = useDashboardInvestments();
  const { width } = useWindowDimensions();

  const { pieData, legendItems, dominantShare } = useMemo(() => {
    const byCategory = investments.reduce(
      (acc, inv) => {
        const type = inv.leasing?.type;
        const key = normalizeCategoryKey(type || "Otros");
        if (!acc[key]) acc[key] = { amount: 0, key };
        acc[key].amount += inv.amount ?? 0;
        return acc;
      },
      {} as Record<string, { amount: number; key: string }>
    );

    const total = Object.values(byCategory).reduce((s, x) => s + x.amount, 0);
    if (total === 0) {
      return {
        pieData: [] as { value: number; color: string; text: string }[],
        legendItems: [] as { label: string; color: string }[],
        dominantShare: null as {
          percent: number;
          color: string;
          label: string;
        } | null,
      };
    }

    const pieData = Object.entries(byCategory)
      .filter(([, v]) => v.amount > 0)
      .map(([key, v]) => {
        const category = getCategory(key);
        const label = category?.name ?? key;
        const color = getCategoryBgColor(key);
        return {
          value: v.amount,
          color,
          text: label,
        };
      });

    const legendItems = pieData.map((item) => ({
      label: item.text,
      color: item.color,
    }));

    let top = pieData[0];
    for (const slice of pieData) {
      if (slice.value > top.value) top = slice;
    }
    const percentRounded = Math.round((top.value / total) * 100);
    const dominantShare = {
      percent: Math.min(100, Math.max(0, percentRounded)),
      color: top.color,
      label: top.text,
    };

    return { pieData, legendItems, dominantShare };
  }, [investments]);

  const chartSize = Math.min(width - 48, 200);
  const radius = chartSize / 2 - 8;
  const innerRadius = radius * 0.5;
  const holeDiameter = innerRadius * 2;
  const centerLabelFontSize = Math.min(20, Math.max(13, innerRadius * 0.42));

  return (
    <View className="mb-6">
      <Text className="text-text-primary text-lg font-libre-bold mb-4">
        Composición de Portafolio
      </Text>
      {isLoading ? (
        <View className="py-8 items-center">
          <Text className="text-text-primary text-sm font-libre-regular">Cargando composición...</Text>
        </View>
      ) : pieData.length === 0 ? (
        <View className="py-8 px-4 rounded-xl bg-white border border-green-secondary items-center justify-center min-h-[160px]">
          <Text className="text-text-primary text-sm font-libre-regular text-center">
            Aún no tienes inversiones. Tu composición aparecerá aquí cuando inviertas.
          </Text>
        </View>
      ) : (
        <View className="flex-row flex-wrap items-center">
          <View className="items-center justify-center" style={{ width: chartSize, height: chartSize }}>
            <PieChart
              data={pieData}
              donut
              innerRadius={innerRadius}
              radius={radius}
              showText={false}
              centerLabelComponent={() =>
                dominantShare ? (
                  <View
                    className="items-center justify-center"
                    style={{
                      width: holeDiameter * 0.92,
                      maxWidth: holeDiameter * 0.92,
                    }}
                  >
                    <Text
                      className="font-libre-bold"
                      style={{
                        fontSize: centerLabelFontSize,
                        color: dominantShare.color,
                        textAlign: "center",
                        lineHeight: centerLabelFontSize * 1.15,
                      }}
                      adjustsFontSizeToFit
                      minimumFontScale={0.65}
                      numberOfLines={1}
                      accessibilityLabel={`Mayor categoría ${dominantShare.label}, ${dominantShare.percent} por ciento`}
                    >
                      {`${dominantShare.percent}%`}
                    </Text>
                  </View>
                ) : null
              }
            />
          </View>
          <View className="flex-1 pl-4 gap-2 min-w-[140px]">
            {legendItems.map((item, index) => (
              <View key={index} className="flex-row items-center gap-2">
                <View
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <Text className="text-text-primary text-sm font-libre-medium" numberOfLines={1}>
                  {item.label}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}
