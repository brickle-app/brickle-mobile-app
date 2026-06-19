import React, { useEffect, useRef } from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/assets/Colors";
import { searchStore } from "@/src/store/search.store";

interface SearchInputProps {
  onSearch?: (term: string) => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({ onSearch }) => {
  const inputRef = useRef<TextInput>(null);
  const searchTerm = searchStore((state) => state.searchTerm);
  const setSearchTerm = searchStore((state) => state.setSearchTerm);
  const setHasSearched = searchStore((state) => state.setHasSearched);
  const addRecentSearch = searchStore((state) => state.addRecentSearch);

  useEffect(() => {
    // Auto focus when component mounts
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleSearch = () => {
    if (searchTerm.trim()) {
      addRecentSearch(searchTerm.trim());
      setHasSearched(true);
      onSearch?.(searchTerm.trim());
    }
  };

  const handleChangeText = (text: string) => {
    setSearchTerm(text);
    // Show results immediately when user types
    if (text.trim()) {
      setHasSearched(true);
    } else {
      setHasSearched(false);
    }
  };

  const handleClear = () => {
    setSearchTerm("");
    setHasSearched(false);
    inputRef.current?.focus();
  };

  return (
    <View className="flex-row items-center bg-white rounded-xl px-4 py-3 mx-4 shadow-sm">
      <Ionicons
        name="search"
        size={20}
        color={Colors.gray}
        style={{ marginRight: 12 }}
      />
      <TextInput
        ref={inputRef}
        value={searchTerm}
        onChangeText={handleChangeText}
        placeholder="Buscar activos..."
        placeholderTextColor={Colors.gray}
        className="flex-1 text-base text-gray-800"
        returnKeyType="search"
        onSubmitEditing={handleSearch}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {searchTerm.length > 0 && (
        <TouchableOpacity onPress={handleClear} className="ml-2">
          <Ionicons
            name="close-circle"
            size={20}
            color={Colors.gray}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}; 