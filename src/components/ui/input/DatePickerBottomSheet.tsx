import React, { useCallback, useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  Text,
  View,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import {
  DatePart,
  getDaysInMonth,
  updateDatePart,
} from "@/src/utils/datePicker";

interface DatePickerBottomSheetProps {
  visible: boolean;
  title?: string;
  value: Date;
  minimumDate: Date;
  maximumDate: Date;
  onChange: (date: Date) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export function DatePickerBottomSheet({
  visible,
  title = "Fecha de nacimiento",
  value,
  minimumDate,
  maximumDate,
  onChange,
  onConfirm,
  onCancel,
}: DatePickerBottomSheetProps) {
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const slideOffset = useRef(
    new Animated.Value(Dimensions.get("window").height)
  ).current;
  const isClosing = useRef(false);
  const animationToken = useRef(0);
  const isVisible = useRef(visible);
  isVisible.current = visible;

  const showDrawer = useCallback(() => {
    animationToken.current += 1;
    backdropOpacity.stopAnimation();
    slideOffset.stopAnimation();
    isClosing.current = false;
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(slideOffset, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [backdropOpacity, slideOffset]);

  const hideDrawer = useCallback(
    (onHidden: () => void) => {
      if (isClosing.current) return;
      isClosing.current = true;
      const token = ++animationToken.current;

      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideOffset, {
          toValue: Dimensions.get("window").height,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (token !== animationToken.current || !isVisible.current) return;

        if (!finished) {
          isClosing.current = false;
          return;
        }

        backdropOpacity.setValue(0);
        slideOffset.setValue(Dimensions.get("window").height);
        onHidden();
      });
    },
    [backdropOpacity, slideOffset]
  );

  useEffect(() => {
    if (visible) {
      showDrawer();
      return;
    }

    animationToken.current += 1;
    backdropOpacity.stopAnimation();
    slideOffset.stopAnimation();
    isClosing.current = false;
    backdropOpacity.setValue(0);
    slideOffset.setValue(Dimensions.get("window").height);
  }, [backdropOpacity, showDrawer, slideOffset, visible]);

  const handleCancel = () => hideDrawer(onCancel);
  const handleConfirm = () => hideDrawer(onConfirm);

  const years = Array.from(
    { length: maximumDate.getFullYear() - minimumDate.getFullYear() + 1 },
    (_, index) => maximumDate.getFullYear() - index
  );
  const days = Array.from(
    { length: getDaysInMonth(value.getFullYear(), value.getMonth()) },
    (_, index) => index + 1
  );
  const changePart = (part: DatePart, nextValue: number) => {
    onChange(updateDatePart(value, part, nextValue, minimumDate, maximumDate));
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleCancel}
      statusBarTranslucent
    >
      <View className="flex-1">
        <StatusBar
          backgroundColor="rgba(0,0,0,0.5)"
          barStyle="light-content"
        />
        <Animated.View
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            opacity: backdropOpacity,
          }}
        >
          <Pressable
            className="flex-1"
            accessibilityRole="button"
            accessibilityLabel="Cerrar selector de fecha"
            onPress={handleCancel}
          />
        </Animated.View>
        <Animated.View
          style={{
            position: "absolute",
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: "white",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            transform: [{ translateY: slideOffset }],
          }}
        >
          <SafeAreaView accessibilityViewIsModal>
            <View className="items-center pt-3">
              <View className="h-1 w-10 rounded-full bg-gray-300" />
            </View>
            <View className="flex-row items-center border-b border-gray-200 px-5 py-3">
              <View className="w-16" />
              <Text className="flex-1 text-center font-libre-bold text-base text-text-primary">
                {title}
              </Text>
              <Pressable
                className="w-16 py-2"
                accessibilityRole="button"
                accessibilityLabel="Confirmar fecha"
                onPress={handleConfirm}
              >
                <Text className="text-right font-libre-bold text-base text-blue-primary">
                  Listo
                </Text>
              </Pressable>
            </View>
            {Platform.OS === "ios" ? (
              <DateTimePicker
                value={value}
                mode="date"
                display="spinner"
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                locale="es-ES"
                onChange={(event, date) => {
                  if (event.type === "set" && date) onChange(date);
                }}
              />
            ) : (
              <View className="flex-row px-2 py-4">
                <Picker
                  style={{ flex: 1 }}
                  mode="dropdown"
                  accessibilityLabel="Día"
                  selectedValue={value.getDate()}
                  onValueChange={(day) => changePart("day", Number(day))}
                >
                  {days.map((day) => (
                    <Picker.Item key={day} label={String(day)} value={day} />
                  ))}
                </Picker>
                <Picker
                  style={{ flex: 1.5 }}
                  mode="dropdown"
                  accessibilityLabel="Mes"
                  selectedValue={value.getMonth()}
                  onValueChange={(month) => changePart("month", Number(month))}
                >
                  {MONTHS.map((month, index) => (
                    <Picker.Item key={month} label={month} value={index} />
                  ))}
                </Picker>
                <Picker
                  style={{ flex: 1 }}
                  mode="dropdown"
                  accessibilityLabel="Año"
                  selectedValue={value.getFullYear()}
                  onValueChange={(year) => changePart("year", Number(year))}
                >
                  {years.map((year) => (
                    <Picker.Item key={year} label={String(year)} value={year} />
                  ))}
                </Picker>
              </View>
            )}
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}
