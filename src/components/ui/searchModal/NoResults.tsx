import React from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/assets/Colors";

interface NoResultsProps {
  searchTerm: string;
  onSelectSuggestion: (suggestion: string) => void;
}

const SUGGESTIONS = [
  "Excavadora",
  "Computador",
  "Camilla",
  "Maquinaria",
];

export const NoResults: React.FC<NoResultsProps> = ({
  searchTerm,
  onSelectSuggestion,
}) => {
  const renderSuggestionItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      onPress={() => onSelectSuggestion(item)}
      className="flex-row items-center px-4 py-4 border-b border-gray-100"
    >
      <Ionicons
        name="search"
        size={18}
        color={Colors.gray}
        style={{ marginRight: 12 }}
      />
      <Text className="text-gray-800 text-base flex-1">
        {item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white">
      {/* No results message */}
      <View className="px-4 py-6 border-b border-gray-200">
        <Text className="text-gray-600 text-base text-center">
          No se encontraron resultados para "{searchTerm}"
        </Text>
      </View>

      {/* Suggestions */}
      <View className="flex-1">
        <View className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <Text className="text-gray-800 text-lg font-libre-bold">
            Prueba con
          </Text>
        </View>

        <FlatList
          data={SUGGESTIONS}
          renderItem={renderSuggestionItem}
          keyExtractor={(item, index) => `${item}-${index}`}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
}; 