import React from 'react';
import { View } from 'react-native';
import { Skeleton } from './Skeleton';
import { Card } from '../card/Card';
import { HeaderAssetsCardSkeleton } from './HeaderAssetsCardSkeleton';

export const DashboardHeaderSkeleton = () => {
  return (
    <View className="flex flex-col w-full rounded-lg">
      <Card variant="dark" className="flex justify-center h-[140px] p-5 rounded-lg">
        <View className="flex-row justify-between items-start p-3">
          {/* Balance Section Skeleton */}
          <View className="flex flex-col gap-4 justify-center items-start">
            <View className="flex flex-col">
              <Skeleton width={60} height={14} className="mb-1" />
              <Skeleton width={120} height={20} />
            </View>
            <Skeleton width={200} height={30} borderRadius={15} />
          </View>

          {/* Switch Section Skeleton */}
          <View className="flex flex-col gap-4 justify-center items-end">
            <Skeleton width={80} height={40} borderRadius={20} />
          </View>
        </View>
      </Card>

      {/* Assets Section Skeleton */}
      <View className="flex flex-col gap-6 justify-center items-center w-full py-4 bg-primary-white rounded-b-lg">
        <HeaderAssetsCardSkeleton />
        <HeaderAssetsCardSkeleton />
        <HeaderAssetsCardSkeleton />
        <Skeleton width={100} height={20} />
      </View>
    </View>
  );
};