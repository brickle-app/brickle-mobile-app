import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  FlatList,
  StatusBar,
  Animated,
  Dimensions,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/assets/Colors";
import { SelectOption } from "./SelectField";

interface BottomSheetModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  options: SelectOption[];
  selectedValue: string | number;
  onSelect: (option: SelectOption) => void;
  searchable?: boolean;
  /** Cuando `options` está vacío: CTA (p. ej. abrir modal de crear cuenta). */
  emptyListAction?: {
    label: string;
    onPress: () => void;
  };
}

export const BottomSheetModal: React.FC<BottomSheetModalProps> = ({
  visible,
  onClose,
  title,
  options,
  selectedValue,
  onSelect,
  searchable = true,
  emptyListAction,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // Animation values
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(Dimensions.get('window').height)).current;

  // Animation functions
  const showModal = () => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideModal = () => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: Dimensions.get('window').height,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      backdropOpacity.setValue(0);
      slideAnim.setValue(Dimensions.get('window').height);
      onClose();
    });
  };

  useEffect(() => {
    if (!visible) {
      backdropOpacity.setValue(0);
      slideAnim.setValue(Dimensions.get('window').height);
    }
  }, [visible, backdropOpacity, slideAnim]);

  // Keyboard detection callbacks - wrapped in useCallback to prevent unnecessary re-renders
  const handleKeyboardShow = useCallback((e: any) => {
    setKeyboardHeight(e.endCoordinates.height);
    setIsKeyboardVisible(true);
  }, []);

  const handleKeyboardHide = useCallback(() => {
    setKeyboardHeight(0);
    setIsKeyboardVisible(false);
  }, []);

  // Keyboard detection
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', handleKeyboardShow);
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', handleKeyboardHide);

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [handleKeyboardShow, handleKeyboardHide]);

  useEffect(() => {
    if (visible) {
      showModal();
    }
  }, [visible]);

  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;

    return options.filter((option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  // Calculate dynamic modal height based on keyboard visibility
  const modalHeight = useMemo(() => {
    const screenHeight = Dimensions.get('window').height;
    const baseMaxHeight = screenHeight * 0.8;

    if (isKeyboardVisible) {
      const safeAreaBuffer = 20;
      const availableHeight = screenHeight - keyboardHeight - safeAreaBuffer;
      const dynamicHeight = Math.max(availableHeight * 0.95, 250);
      return Math.min(dynamicHeight, baseMaxHeight);
    }

    return baseMaxHeight;
  }, [isKeyboardVisible, keyboardHeight]);

  const handleSelect = useCallback((option: SelectOption) => {
    onSelect(option);
    setSearchTerm("");
    hideModal();
  }, [onSelect]);

  const handleClose = useCallback(() => {
    setSearchTerm("");
    hideModal();
  }, []);

  const handleBackdropPress = () => {
    if (isKeyboardVisible) {
      Keyboard.dismiss();
    } else {
      handleClose();
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const renderOption = ({ item }: { item: SelectOption }) => {
    const isSelected = item.value === selectedValue;

    return (
      <TouchableOpacity
        onPress={() => handleSelect(item)}
        className={`
          flex-row items-center justify-between
          px-4 py-4 border-b border-gray-100
          ${isSelected ? 'bg-blue-50' : 'bg-white'}
        `}
      >
        <Text
          className={`
            flex-1 text-base font-libre-medium
            ${isSelected ? 'text-blue-primary' : 'text-text-primary'}
          `}
          numberOfLines={2}
        >
          {item.label}
        </Text>

        {isSelected && (
          <Ionicons
            name="checkmark-circle"
            size={24}
            color={Colors.bluePrimary}
          />
        )}
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center py-12">
      <Ionicons
        name="search-outline"
        size={48}
        color={Colors.gray}
      />
      <Text className="text-gray-500 font-libre-medium text-base mt-4">
        No se encontraron resultados
      </Text>
      <Text className="text-gray-400 text-sm mt-1">
        Intenta con otros términos de búsqueda
      </Text>
    </View>
  );

  const renderNoOptionsState = () => (
    <View className="flex-1 justify-center items-center px-6 py-10">
      <Ionicons name="wallet-outline" size={52} color={Colors.gray} />
      <Text className="text-gray-600 font-libre-medium text-base mt-5 text-center">
        No tienes cuentas registradas
      </Text>
      <Text className="text-gray-400 text-sm mt-2 text-center leading-5">
        Agrega una cuenta bancaria para poder solicitar retiros a tu nombre.
      </Text>
      {emptyListAction ? (
        <TouchableOpacity
          className="mt-8 bg-orange-primary py-3.5 px-10 rounded-full"
          activeOpacity={0.85}
          onPress={() => {
            emptyListAction.onPress();
            handleClose();
          }}
        >
          <Text className="text-white font-libre-bold text-base text-center">
            {emptyListAction.label}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );

  const listEmptyComponent =
    options.length === 0 ? renderNoOptionsState : renderEmptyState;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
    >
      <View className="flex-1">
        <StatusBar backgroundColor="rgba(0,0,0,0.5)" barStyle="light-content" />

        {/* Animated Backdrop */}
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            opacity: backdropOpacity,
          }}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={handleBackdropPress}
            activeOpacity={1}
          />
        </Animated.View>

        {/* Animated Bottom Sheet */}
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'white',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: modalHeight,
            transform: [{ translateY: slideAnim }],
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.25,
            shadowRadius: 10,
            elevation: 10,
          }}
        >
          <SafeAreaView className="flex-1">
            {/* Drag Handle */}
            <View className="items-center py-3">
              <View
                style={{
                  width: 40,
                  height: 4,
                  backgroundColor: '#E5E5E5',
                  borderRadius: 2,
                }}
              />
            </View>

            {/* Header */}
            <View className="flex-row items-center justify-between px-4 pb-3 border-b border-gray-200">
              <TouchableOpacity
                onPress={handleClose}
                className="p-2"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={Colors.bluePrimary}
                />
              </TouchableOpacity>

              <Text className="text-lg font-libre-bold text-text-primary">
                {title}
              </Text>

              {/* Done button when keyboard is visible, otherwise empty spacer */}
              {isKeyboardVisible ? (
                <TouchableOpacity
                  onPress={() => Keyboard.dismiss()}
                  className="p-2"
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text className="text-blue-primary font-libre-bold text-base">
                    Listo
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={{ width: 40 }} />
              )}
            </View>

            {/* Search: solo si hay opciones que filtrar */}
            {searchable && options.length > 0 && (
              <View className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                <View className="flex-row items-center bg-white rounded-full px-3 border border-secondary">
                  <Ionicons
                    name="search"
                    size={20}
                    color={Colors.gray}
                    style={{ marginRight: 8 }}
                  />
                  <TextInput
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                    placeholder="Buscar..."
                    placeholderTextColor={Colors.gray}
                    className="flex-1 text-base font-libre-regular text-text-primary h-12"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="done"
                    onSubmitEditing={dismissKeyboard}
                  />
                  {searchTerm.length > 0 && (
                    <TouchableOpacity
                      onPress={() => setSearchTerm("")}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons
                        name="close-circle"
                        size={20}
                        color={Colors.gray}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {/* Options List */}
            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => item.value.toString()}
              renderItem={renderOption}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={listEmptyComponent}
              keyboardShouldPersistTaps="handled"
              style={{ flexGrow: 1 }}
            />
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
};