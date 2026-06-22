import { View } from "react-native";
import React from "react";
import DiscoverIcon from "@/assets/icons/SVG/Buscar.svg";
import { Colors } from "@/assets/Colors";
import { FormField } from "../ui/input";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFilterPress?: () => void;
  onInputPress?: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = "Buscar activos...",
  onInputPress,
}) => {
  return (
    <View className="flex-row mx-4 mb-6">
      <FormField
        width="w-full"
        icon={<DiscoverIcon width={32} height={32} color={Colors.secondary} />}
        iconPosition="left"
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
        autoCorrect={false}
        onPress={onInputPress}
        containerClassName="flex-1"
      />

      {/*<TouchableOpacity
        className="rounded-full p-1 border border-secondary"
        onPress={onFilterPress}
        activeOpacity={0.8}
      >
        <FilterIcon width={42} height={42} color={Colors.textPrimary} />
      </TouchableOpacity>*/}
    </View>
  );
};

export default SearchBar;
