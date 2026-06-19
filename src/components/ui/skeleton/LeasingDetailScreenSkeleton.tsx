import React from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Skeleton } from './Skeleton';

export const LeasingDetailScreenSkeleton = () => {
  return (
    <SafeAreaProvider>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Hero Section Skeleton */}
        <View className="relative h-80 overflow-hidden">
          <Skeleton width="100%" height="100%" borderRadius={0} />
          
          {/* ROI Badge Skeleton */}
          <View className="absolute top-4 left-4 z-10">
            <Skeleton width={80} height={32} borderRadius={4} />
          </View>
          
          {/* Content at bottom */}
          <View className="absolute bottom-4 left-4 right-4">
            <Skeleton width="80%" height={24} className="mb-2" />
            <Skeleton width="60%" height={18} />
          </View>
        </View>

        {/* Purchase Slider Section Skeleton */}
        <View className="px-4 py-6 my-6 mx-3 bg-primary-white rounded-[10px]">
          <Skeleton width={150} height={18} className="mb-4" />
          
          <View className="flex flex-row justify-between mb-2">
            <Skeleton width={100} height={12} />
            <Skeleton width={80} height={12} />
          </View>
          
          <View className="flex flex-row justify-between mb-4">
            <Skeleton width={60} height={16} />
            <Skeleton width={80} height={16} />
          </View>
          
          {/* Progress Bar Skeleton */}
          <View className="mb-4">
            <Skeleton width="100%" height={8} borderRadius={4} />
          </View>
          
          <View className="flex flex-row justify-between">
            <Skeleton width={80} height={12} />
            <Skeleton width={60} height={12} />
          </View>
        </View>

        {/* Tabs Section Skeleton */}
        <View className="mx-4 mb-4">
          <View className="flex flex-row bg-gray-100 rounded-lg p-1 mb-6">
            <Skeleton width="50%" height={40} borderRadius={6} />
            <View className="w-2" />
            <Skeleton width="50%" height={40} borderRadius={6} />
          </View>
          
          {/* Tab Content Skeleton */}
          <View className="space-y-4">
            <Skeleton width="100%" height={120} borderRadius={8} />
            <Skeleton width="100%" height={80} borderRadius={8} />
            <Skeleton width="100%" height={100} borderRadius={8} />
          </View>
        </View>

        {/* Resume Section Skeleton */}
        <View className="mx-4 mb-8">
          <View className="bg-white rounded-2xl p-6">
            <Skeleton width={120} height={20} className="mb-4" />
            
            <View className="space-y-3">
              <View className="flex flex-row justify-between items-center">
                <Skeleton width={100} height={14} />
                <Skeleton width={80} height={14} />
              </View>
              <View className="flex flex-row justify-between items-center">
                <Skeleton width={120} height={14} />
                <Skeleton width={60} height={14} />
              </View>
              <View className="flex flex-row justify-between items-center">
                <Skeleton width={90} height={14} />
                <Skeleton width={70} height={14} />
              </View>
            </View>
            
            <View className="mt-6">
              <Skeleton width="100%" height={48} borderRadius={24} />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaProvider>
  );
};