import React, { useEffect, useRef } from "react";
import { Modal, View, Text, TouchableOpacity, SafeAreaView, StatusBar, ActivityIndicator, Animated, Easing } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/assets/Colors";
import { searchStore } from "@/src/store/search.store";
import { SearchInput } from "./SearchInput";
import { RecentSearches } from "./RecentSearches";
import { SearchResults } from "./SearchResults";
import { NoResults } from "./NoResults";
import { useSearchAssets } from "@/src/hooks/search/useSearchAssets";
import { Asset } from "@/src/interfaces/investments.interface";
import { useRouter } from "expo-router";

export const SearchModal: React.FC = () => {
  const router = useRouter();
  const isModalVisible = searchStore((state) => state.isModalVisible);
  const closeModal = searchStore((state) => state.closeModal);
  const setSearchTerm = searchStore((state) => state.setSearchTerm);
  const setHasSearched = searchStore((state) => state.setHasSearched);
  const addRecentSearch = searchStore((state) => state.addRecentSearch);
  const searchTerm = searchStore((state) => state.searchTerm);
  const hasSearched = searchStore((state) => state.hasSearched);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const { assets, filteredAssets, isLoading, error, refetch } = useSearchAssets(searchTerm, isModalVisible);

  useEffect(() => {
    if (isModalVisible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 350,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      slideAnim.setValue(0);
      opacityAnim.setValue(0);
    }
  }, [isModalVisible, opacityAnim, slideAnim]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 280,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 220,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => {
      closeModal();
    });
  };

  const handleSearch = (term: string) => {
    if (term.trim()) {
      addRecentSearch(term.trim());
      setHasSearched(true);
      console.log("Searching for:", term);
    }
  };

  const handleSelectRecentSearch = (term: string) => {
    setSearchTerm(term);
    setHasSearched(true);
  };

  const handleSelectResult = (result: Asset) => {
    addRecentSearch(result.name);
    closeModal();
    router.push(`/(stack)/asset-detail/${result.id}?source=discover-page` as import("expo-router").Href);
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setSearchTerm(suggestion);
    setHasSearched(true);
  };

  const hasResults = React.useMemo(() => {
    if (!searchTerm.trim() || isLoading) return false;
    return filteredAssets.length > 0;
  }, [searchTerm, filteredAssets, isLoading]);

  const renderContent = () => {
    if (isLoading && assets.length === 0) {
      return (
        <View className="flex-1 justify-center items-center p-8">
          <ActivityIndicator size="large" color={Colors.bluePrimary} />
          <Text className="text-gray-500 text-base mt-4 text-center">
            Cargando activos...
          </Text>
        </View>
      );
    }

    // Show error state
    if (error && assets.length === 0) {
      return (
        <View className="flex-1 justify-center items-center p-8">
          <Ionicons name="alert-circle-outline" size={48} color={Colors.red} />
          <Text className="text-gray-800 text-lg font-libre-bold mt-4 text-center">
            Error al cargar activos
          </Text>
          <Text className="text-gray-500 text-base mt-2 text-center">
            {error}
          </Text>
          <TouchableOpacity
            onPress={refetch}
            className="mt-4 px-6 py-2 bg-blue-primary rounded-full"
          >
            <Text className="text-white font-libre-bold">Reintentar</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!hasSearched) {
      return <RecentSearches onSelectSearch={handleSelectRecentSearch} />;
    }

    if (searchTerm.trim() && hasResults) {
      return (
        <SearchResults
          searchTerm={searchTerm}
          assets={filteredAssets}
          onSelectResult={handleSelectResult}
          isLoading={isLoading}
        />
      );
    }

    if (searchTerm.trim() && !hasResults) {
      return (
        <NoResults
          searchTerm={searchTerm}
          onSelectSuggestion={handleSelectSuggestion}
        />
      );
    }

    return <RecentSearches onSelectSearch={handleSelectRecentSearch} />;
  };

  const slideStyle = {
    transform: [{
      translateY: slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [300, 0],
      })
    }],
    opacity: opacityAnim,
  };

  const backdropStyle = {
    opacity: opacityAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 0.5],
    }),
  };

  return (
    <Modal
      visible={isModalVisible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
    >
      <View className="flex-1">
        <Animated.View style={backdropStyle}>
          <TouchableOpacity
            style={{ flex: 1, backgroundColor: 'black' }}
            className="absolute inset-0"
            activeOpacity={1}
            onPress={handleClose}
          />
        </Animated.View>
        <Animated.View style={[slideStyle, { flex: 1 }]}>
          <SafeAreaView className="flex-1 bg-gray-50">
            <StatusBar backgroundColor="#F9FAFB" barStyle="dark-content" />

            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
              <TouchableOpacity
                onPress={handleClose}
                className="p-2"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name="arrow-back"
                  size={24}
                  color={Colors.bluePrimary}
                />
              </TouchableOpacity>

              <Text className="text-lg font-libre-bold text-gray-800">
                Búsqueda
              </Text>

              <View style={{ width: 40 }} />
            </View>

            {/* Search Input */}
            <View className="py-4 bg-white">
              <SearchInput onSearch={handleSearch} />
            </View>

            {/* Dynamic Content */}
            {renderContent()}
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}; 
