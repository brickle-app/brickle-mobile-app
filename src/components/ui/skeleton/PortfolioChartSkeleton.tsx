import React from 'react';
import { View } from 'react-native';
import { Skeleton } from './Skeleton';

export const PortfolioChartSkeleton = () => {
  return (
    <View className="flex flex-col gap-4 justify-center items-center w-full py-4 bg-primary-white rounded-b-lg">
      {/* Title Skeleton */}
      <Skeleton width={200} height={16} />
      
      {/* Chart Area Skeleton */}
      <View className="flex flex-col gap-2 w-full px-4">
        {/* Chart bars skeleton */}
        <View className="flex flex-row justify-center items-end gap-1 h-[120px]">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton 
              key={index}
              width={30} 
              height={Math.random() * 80 + 20} 
              borderRadius={2}
            />
          ))}
        </View>
        
        {/* Chart labels skeleton */}
        <View className="flex flex-row justify-between items-center px-2">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} width={20} height={10} />
          ))}
        </View>
      </View>

      {/* Value and ROI Skeleton */}
      <View className="flex flex-row justify-between items-center w-full px-4">
        <Skeleton width={80} height={20} />
        <Skeleton width={60} height={16} />
      </View>
    </View>
  );
};