import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';

interface Props {
  children: React.ReactNode;
  /** Callback al pulsar "Reiniciar"; si no se pasa, solo se limpia el error (evita usar router sin contexto). */
  onRestart?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleRestart = () => {
    this.setState({ hasError: false, error: null });
    this.props.onRestart?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-1 justify-center items-center p-6">
            <View className="items-center mb-8">
              <Text className="text-2xl font-libre-bold text-red-600 mb-4">
                Algo salió mal
              </Text>
              <Text className="text-base text-gray-600 text-center mb-6">
                La aplicación encontró un error inesperado. Por favor, reinicia la app.
              </Text>
              {__DEV__ && (
                <Text className="text-sm text-gray-500 mb-6">
                  Error: {this.state.error?.toString()}
                </Text>
              )}
            </View>
            <TouchableOpacity
              onPress={this.handleRestart}
              className="bg-blue-600 px-6 py-3 rounded-full"
            >
              <Text className="text-white font-libre-regular">
                Reiniciar Aplicación
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
} 