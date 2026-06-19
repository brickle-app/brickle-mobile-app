import React from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/assets/Colors";
import { Asset } from "@/src/interfaces/investments.interface";
import {
  getCategoryIcon,
  getCategoryIconCircleBackground,
  getCategoryIconGlyphColor,
} from "@/src/utils/categories";

interface SearchResultsProps {
  searchTerm: string;
  assets: Asset[];
  onSelectResult: (result: Asset) => void;
  isLoading?: boolean;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  searchTerm,
  assets,
  onSelectResult,
  isLoading = false,
}) => {
  const renderResultItem = ({ item }: { item: Asset }) => {
    const type = item.type || "Maquinaria";
    const circleBg = getCategoryIconCircleBackground(type);
    const glyph = getCategoryIconGlyphColor(type);
    const categoryIcon = getCategoryIcon(type);

    return (
      <TouchableOpacity
        onPress={() => onSelectResult(item)}
        className="flex-row items-center px-4 py-4 border-b border-gray-100 bg-white"
      >
        <View
          style={{ backgroundColor: circleBg }}
          className="w-16 h-16 rounded-xl items-center justify-center mr-4"
        >
          {categoryIcon
            ? React.cloneElement(
                categoryIcon as React.ReactElement<{ width?: number; height?: number; color?: string }>,
                { width: 32, height: 32, color: glyph }
              )
            : null}
        </View>

        <View className="flex-1">
          <Text className="text-gray-800 text-base font-libre-regular" numberOfLines={2}>
            {item.name}
          </Text>
          <View className="flex-row items-center mt-1">
            <Text className="text-gray-600 text-sm mr-3">
              ${item.pricePerToken?.toLocaleString() || 'N/A'}
            </Text>
            {item.tir && (
              <View className="flex-row items-center">
                <Ionicons name="trending-up" size={14} color={Colors.greenPrimary} />
                <Text className="text-green-600 text-sm ml-1">
                  {item.tir}% TIR
                </Text>
              </View>
            )}
          </View>
          {item.company?.name && (
            <Text className="text-gray-500 text-xs mt-1" numberOfLines={1}>
              🏢 {item.company.name}
            </Text>
          )}
        </View>

        <Ionicons name="chevron-forward" size={20} color={Colors.gray} />
      </TouchableOpacity>
    );
  };

  if (assets.length === 0 && !isLoading) {
    return null; // Let the parent component handle the empty state
  }

  return (
    <View className="flex-1">
      <View className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <Text className="text-gray-600 text-sm">
          {isLoading ?
            `Buscando "${searchTerm}"...` :
            `${assets.length} resultado${assets.length !== 1 ? 's' : ''} para "${searchTerm}"`
          }
        </Text>
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center py-8">
          <ActivityIndicator size="large" color={Colors.bluePrimary} />
          <Text className="text-gray-500 text-sm mt-2">
            Buscando activos...
          </Text>
        </View>
      ) : (
        <FlatList
          data={assets}
          renderItem={renderResultItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          className="bg-white"
        />
      )}
    </View>
  );
}; 