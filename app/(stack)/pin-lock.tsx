import React, { useState } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, Alert } from 'react-native';
import { PinInput } from '@/src/components/ui/pin/PinInput';
import { usePinStore } from '@/src/store/pin.store';
import { authStore } from '@/src/store/auth.store';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/assets/Colors';

const PinLockScreen = () => {
    const [error, setError] = useState<string | null>(null);
    const { validatePin } = usePinStore();
    const { logout } = authStore();

    const handleComplete = async (pin: string) => {
        const isValid = await validatePin(pin);
        if (isValid) {
            setError(null);
            (router as any).replace("/(stack)/(tabs)/dashboard");
        } else {
            setError('PIN incorrecto. Intenta de nuevo.');
        }
    };

    const handleLogout = () => {
        Alert.alert(
            "Cerrar sesión",
            "¿Estás seguro de que quieres cerrar sesión? Tendrás que ingresar tus credenciales nuevamente.",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Cerrar sesión",
                    style: "destructive",
                    onPress: () => {
                        logout();
                        (router as any).replace("/login");
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1">
                <PinInput
                    title="Sesión bloqueada"
                    subtitle="Ingresa tu PIN de acceso"
                    onComplete={handleComplete}
                    error={error}
                />
            </View>

            <View className="items-center pb-10">
                <TouchableOpacity onPress={handleLogout} className="flex-row items-center">
                    <Ionicons name="log-out-outline" size={20} color={Colors.bluePrimary} />
                    <Text className="text-blue-primary font-libre-bold ml-2">Cerrar sesión</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default PinLockScreen;
