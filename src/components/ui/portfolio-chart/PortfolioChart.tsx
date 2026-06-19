import React, { useState, useMemo } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { formatCurrency } from '@/src/utils/formatCurrency';
import { Colors } from '@/assets/Colors';

interface DataItem {
  value: number;
  frontColor: string;
  label?: string;
}

interface PortfolioChartProps {
  barDataCapital: DataItem[];
  barDataRendimiento: DataItem[];
  title: string;
  value?: string;
  roi: string;
}

export const PortfolioChart = ({
  barDataCapital,
  barDataRendimiento,
  title,
  value = "0",
  roi,
}: PortfolioChartProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  // Visual multiplier for rendimiento to make it more visible
  const RENDIMIENTO_VISUAL_MULTIPLIER = 3;

  // Store original values for tooltip
  const originalData = useMemo(
    () => barDataCapital.map((c, i) => ({
      capital: c.value,
      rendimiento: barDataRendimiento[i]?.value ?? 0,
      label: c.label,
    })),
    [barDataCapital, barDataRendimiento]
  );

  // Prepare stacked data format with visual multiplier for rendimiento
  const stackedData = useMemo(
    () => barDataCapital.map((c, i) => {
      const rendimientoValue = barDataRendimiento[i]?.value ?? 0;
      return {
        stacks: [
          {
            value: c.value,
            color: Colors.bluePrimary,
          },
          {
            value: rendimientoValue * RENDIMIENTO_VISUAL_MULTIPLIER,
            color: Colors.greenPrimary,
          }
        ],
        label: c.label,
      };
    }),
    [barDataCapital, barDataRendimiento]
  );

  const screenWidth = Dimensions.get('window').width - 50;

  const renderTooltip = () => {
    if (selectedIndex === null || !originalData[selectedIndex]) return null;

    const item = originalData[selectedIndex];
    const capital = item.capital;
    const rendimiento = item.rendimiento;

    return (
      <View style={{
        position: 'absolute',
        top: 10,
        left: selectedIndex * 44,
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 8,
        borderColor: '#ccc',
        borderWidth: 1,
        zIndex: 10,
      }}>
        {item.label && <Text style={{ fontSize: 12, marginBottom: 4, fontWeight: 'bold' }}>{item.label}</Text>}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
          <View style={{ width: 8, height: 8, backgroundColor: Colors.bluePrimary, borderRadius: 4, marginRight: 4 }} />
          <Text style={{ fontSize: 12 }}>Capital: {formatCurrency(capital)}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 8, height: 8, backgroundColor: Colors.greenPrimary, borderRadius: 4, marginRight: 4 }} />
          <Text style={{ fontSize: 12 }}>Rendimiento: {formatCurrency(rendimiento)}</Text>
        </View>
      </View>
    );
  };
  return (
    <View className="bg-white w-full rounded-b-2xl mb-4 shadow-md overflow-hidden p-4">
      {/* Header Section */}
      <View className="flex flex-row justify-between items-start mb-4">
        <View>
          <Text className="text-sm text-gray-500">{title}</Text>
          <Text className="text-2xl font-libre-bold text-gray-800">{formatCurrency(parseFloat(value))}</Text>
        </View>
        <View style={{ backgroundColor: Colors.greenPrimary, borderRadius: 4, justifyContent: 'center', alignItems: 'center', width: 100, height: 25 }}>
          <Text style={{ fontSize: 14, fontWeight: 'bold', color: Colors.bluePrimary }}>{parseFloat(roi).toFixed(2)}% E.A.</Text>
        </View>
      </View>

      {/* Chart Legend */}
      <View className="relative" style={{ width: "100%" }}>
        <View className="flex absolute top-0 left-0 z-10">
          <View className="flex flex-row items-center mb-1">
            <View className="w-[10px] h-[10px] rounded-full" style={{ backgroundColor: Colors.bluePrimary }}></View>
            <Text className="text-sm text-blue-primary ml-2">Capital invertido</Text>
          </View>
          <View className="flex flex-row items-center">
            <View className="w-[10px] h-[10px] rounded-full" style={{ backgroundColor: Colors.greenPrimary }}></View>
            <Text className="text-sm text-blue-primary ml-2">Rendimiento</Text>
          </View>
        </View>
      </View>

      {/* Chart area */}
      <View style={{ height: 250, width: '100%', marginTop: 32 }}>
        {renderTooltip()}

        <BarChart
          stackData={stackedData}
          barWidth={20}
          initialSpacing={48}
          spacing={24}
          hideYAxisText
          hideAxesAndRules
          width={screenWidth}
          barBorderRadius={4}
          isAnimated
          onPress={(_: any, index: number) => setSelectedIndex(selectedIndex === index ? null : index)}
        />
      </View>
    </View>
  );
};
