import { ActivityIndicator, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useApp } from '../contexts/AppContext.jsx';
import { cores } from '../styles/cores.js';
import { estilos, opcoesNavegacao } from '../styles/telas.js';
import AcoesLimpeza from '../views/components/AcoesLimpeza.jsx';
import Botao from '../views/components/Botao.jsx';
import AjustesScreen from '../views/screens/AjustesScreen.jsx';
import CardapioScreen from '../views/screens/CardapioScreen.jsx';
import CarrinhoScreen from '../views/screens/CarrinhoScreen.jsx';
import ResumoScreen from '../views/screens/ResumoScreen.jsx';
import AutenticacaoScreen from '../views/screens/AutenticacaoScreen.jsx';

// Uso uma pilha de telas para poder abrir uma página e voltar à anterior.
const Stack = createNativeStackNavigator();

export default function AppNavigation() {
  const { usuario, pronto, ocupado, erroInicial, inicializar, sair } = useApp();
  // Enquanto recupero os dados, mostro a espera ou uma forma de tentar novamente.
  if (pronto === false) {
    return (
      <SafeAreaView style={estilos.segura}>
        <ScrollView contentContainerStyle={estilos.centralizado}>
          <Text style={estilos.marca}>iFome</Text>
          {mostrarIndicadorInicial()}
          {mostrarMensagemInicial()}
          {mostrarErroInicial()}
        </ScrollView>
      </SafeAreaView>
    );
  }
  function mostrarIndicadorInicial() {
    // Apresento a espera durante a leitura; com null, deixo este espaço sem conteúdo.
    if (ocupado) {
      return (
        <ActivityIndicator size="large" color={cores.principal} />
      );
    }

    return null;
  }

  function mostrarMensagemInicial() {
    // Trato a mensagem vazia como false para mostrar a preparação enquanto não há erro.
    if (Boolean(erroInicial) === false) {
      return (
        <Text style={estilos.texto}>
          Preparando seu cardápio e restaurando seus dados…
        </Text>
      );
    }

    return null;
  }

  function mostrarErroInicial() {
    // Reúno o aviso e as opções de recuperação quando encontro uma falha na leitura inicial.
    if (Boolean(erroInicial)) {
      return (
        <>
          <Text style={estilos.tituloSecao}>Vamos tentar de novo?</Text>
          <Text style={estilos.texto}>{erroInicial}</Text>
          <Text style={estilos.texto}>
            As alterações ficam bloqueadas para proteger os dados salvos. Tente
            recarregar. Se os dados estiverem inválidos, você pode apagá-los abaixo.
          </Text>
          <Botao
            titulo="Tentar carregar novamente"
            aoPressionar={inicializar}
            desabilitado={ocupado}
          />
          <AcoesLimpeza />
          <Botao
            titulo="Voltar ao login"
            aoPressionar={sair}
            variante="secundario"
            desabilitado={ocupado}
          />
        </>
      );
    }

    return null;
  }

  function mostrarTelasDeAcesso() {
    // Verifico se falta um usuário conectado antes de disponibilizar login e cadastro.
    if (Boolean(usuario) === false) {
      return (
        <Stack.Group navigationKey="acesso">
          <Stack.Screen name="Login" component={AutenticacaoScreen} />
          <Stack.Screen name="Cadastro" component={AutenticacaoScreen} />
        </Stack.Group>
      );
    }

    return null;
  }

  function mostrarTelasDePedidos() {
    // Só monto as rotas de compra depois que a autenticação entrega os dados da conta.
    if (usuario) {
      // Uso o ID da conta na chave para reiniciar este grupo quando o usuário muda.
      return (
        <Stack.Group navigationKey={usuario.id}>
          <Stack.Screen name="Cardapio" component={CardapioScreen} />
          <Stack.Screen name="Carrinho" component={CarrinhoScreen} />
          <Stack.Screen name="Resumo" component={ResumoScreen} />
          <Stack.Screen name="Ajustes" component={AjustesScreen} />
        </Stack.Group>
      );
    }

    return null;
  }

  return (
    // Mantenho a navegação dentro deste container para organizar as rotas e o histórico.
    <NavigationContainer>
      <Stack.Navigator screenOptions={opcoesNavegacao}>
        {/* Sem uma conta conectada, ofereço apenas o login e o cadastro. */}
        {mostrarTelasDeAcesso()}
        {/* Após o login, libero as telas de pedidos para esta conta. */}
        {mostrarTelasDePedidos()}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
