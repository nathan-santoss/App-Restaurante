import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from './src/contexts/AppContext.jsx';
import AppNavigation from './src/navigation/AppNavigation.jsx';

export default function App() {
  // Envolvo as telas com a área segura e com o Provider que compartilha os dados.
  return (
    <SafeAreaProvider>
      <AppProvider>
        {/* Escolho ícones escuros para a barra de status ficar legível no fundo claro. */}
        <StatusBar style="dark" />
        {/* A partir daqui, deixo a navegação escolher entre o login e as telas de pedidos. */}
        <AppNavigation />
      </AppProvider>
    </SafeAreaProvider>
  );
}
