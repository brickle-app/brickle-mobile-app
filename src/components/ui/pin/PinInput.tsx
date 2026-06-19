import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/assets/Colors';

interface PinInputProps {
    length?: number;
    onComplete: (pin: string) => void;
    error?: string | null;
    title?: string;
    subtitle?: string;
}

export const PinInput: React.FC<PinInputProps> = ({
    length = 4,
    onComplete,
    error,
    title = "Ingresa tu PIN",
    subtitle = "Para proteger tu sesión",
}) => {
    const [pin, setPin] = useState('');

    const handlePress = (num: string) => {
        if (pin.length < length) {
            const newPin = pin + num;
            setPin(newPin);
            if (newPin.length === length) {
                onComplete(newPin);
            }
        }
    };

    const handleBackspace = () => {
        setPin(pin.slice(0, -1));
    };

    const renderDots = () => {
        return (
            <View className="flex-row justify-center items-center gap-6 my-8">
                {Array.from({ length }).map((_, i) => (
                    <View
                        key={i}
                        className={`w-4 h-4 rounded-full border ${i < pin.length ? 'bg-blue-primary border-blue-primary' : 'bg-transparent border-gray-300'
                            }`}
                    />
                ))}
            </View>
        );
    };

    const renderKeypad = () => {
        const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'DEL'];
        return (
            <View className="flex-row flex-wrap justify-center w-full max-w-[300px]">
                {keys.map((key, i) => (
                    <TouchableOpacity
                        key={i}
                        onPress={() => {
                            if (key === 'DEL') handleBackspace();
                            else if (key !== '') handlePress(key);
                        }}
                        disabled={key === ''}
                        className={`w-[80px] h-[80px] items-center justify-center m-2 rounded-full ${key === '' ? 'opacity-0' : 'bg-gray-50'
                            }`}
                        activeOpacity={0.7}
                    >
                        {key === 'DEL' ? (
                            <Ionicons name="backspace-outline" size={32} color={Colors.bluePrimary} />
                        ) : (
                            <Text className="text-3xl font-libre-bold text-blue-primary">{key}</Text>
                        )}
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    return (
        <View className="flex-1 items-center justify-center bg-white px-6">
            <Text className="text-2xl font-libre-bold text-blue-primary mb-2 text-center">{title}</Text>
            <Text className="text-base text-gray-500 mb-4 text-center">{subtitle}</Text>

            {renderDots()}

            {error && (
                <Text className="text-red-500 text-sm mb-4 text-center">{error}</Text>
            )}

            {renderKeypad()}
        </View>
    );
};
