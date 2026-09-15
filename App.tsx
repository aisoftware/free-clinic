import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootNavigator } from './navigation/RootNavigator';
import { AppStateProvider } from './state/AppState';

export default function App() {
  return (
    <SafeAreaProvider>
      <AppStateProvider>
        <StatusBar style="dark" />
        <RootNavigator />
      </AppStateProvider>
    </SafeAreaProvider>
  );
}
