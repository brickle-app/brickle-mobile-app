import React from 'react';
import { View, Text } from 'react-native';
import { Skeleton } from './Skeleton';
import { Card } from '../card/Card';

interface BalanceCardSkeletonProps {
  showWallet?: boolean;
}

export const BalanceCardSkeleton = ({ showWallet = false }: BalanceCardSkeletonProps) => {
  return (
    <Card variant="dark" className="mb-4 bg-blue-primary h-32">
      <Skeleton width={120} height={14} className="mb-1" />
      <Skeleton width={200} height={24} className="mb-2" />
      
      {showWallet && (
        <View className="flex-row items-center justify-between mt-4">
          <Skeleton width="70%" height={12} />
          <Skeleton width={16} height={16} borderRadius={2} />
        </View>
      )}
    </Card>
  );
};