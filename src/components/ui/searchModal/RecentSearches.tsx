import React from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/assets/Colors";
import { searchStore } from "@/src/store/search.store";

interface RecentSearchesProps {
  onSelectSearch: (term: string) => void;
}

export const RecentSearches: React.FC<RecentSearchesProps> = ({ onSelectSearch }) => {
  const recentSearches = searchStore((state) => state.recentSearches);
  const removeRecentSearch = searchStore((state) => state.removeRecentSearch);
  const clearRecentSearches = searchStore((state) => state.clearRecentSearches);

  if (recentSearches.length === 0) {
    return (
      <View className="px-4 py-8">
        <Text className="text-center text-gray-500">
          Aún no tienes búsquedas recientes
        </Text>
      </View>
    );
  }

  const renderSearchItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      onPress={() => onSelectSearch(item)}
      className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100"
    >
      <View className="flex-row items-center flex-1">
        <Ionicons
          name="time-outline"
          size={18}
          color={Colors.gray}
          style={{ marginRight: 12 }}
        />
        <Text className="text-gray-800 text-base flex-1">
          {item}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => removeRecentSearch(item)}
        className="p-2"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons
          name="close"
          size={16}
          color={Colors.gray}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1">
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
        <Text className="text-lg font-libre-bold text-gray-800">
          Recientes
        </Text>
        <TouchableOpacity
          onPress={clearRecentSearches}
          className="px-3 py-1 rounded-lg bg-gray-100"
        >
          <Text className="text-gray-600 text-sm">
            Limpiar
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={recentSearches}
        renderItem={renderSearchItem}
        keyExtractor={(item, index) => `${item}-${index}`}
        showsVerticalScrollIndicator={false}
        className="bg-white"
      />
    </View>
  );
}; 