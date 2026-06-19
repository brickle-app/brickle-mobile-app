import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

type AccountType = 'ahorros' | 'corriente';

interface AccountTypeSelectorProps {
  selectedType: AccountType;
  onTypeChange: (type: AccountType) => void;
}

/**
 * Component for selecting the type of bank account (savings or current)
 */
export const AccountTypeSelector = ({
  selectedType,
  onTypeChange
}: AccountTypeSelectorProps) => {
  return (
    <View className="flex-row w-full">
      <TouchableOpacity
        className={`flex-1 py-3 rounded-l-full items-center ${selectedType === 'ahorros' ? 'bg-blue-primary' : 'bg-accent-primary'
          }`}
        onPress={() => onTypeChange('ahorros')}
      >
        <Text
          className={`font-libre-bold ${selectedType === 'ahorros' ? 'text-white' : 'text-blue-primary'
            }`}
        >
          Ahorro
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className={`flex-1 py-3 rounded-r-full items-center ${selectedType === 'corriente' ? 'bg-blue-primary' : 'bg-accent-primary'
          }`}
        onPress={() => onTypeChange('corriente')}
      >
        <Text
          className={`font-libre-bold ${selectedType === 'corriente' ? 'text-white' : 'text-blue-primary'
            }`}
        >
          Corriente
        </Text>
      </TouchableOpacity>
    </View>
  );
}; 