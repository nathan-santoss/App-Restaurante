import { Alert, View } from 'react-native';
import { useApp } from '../../contexts/AppContext.jsx';
import { estilos } from '../../styles/componentes.js';
import Botao from './Botao.jsx';

export default function AcoesLimpeza() {
  const { limparDados, ocupado } = useApp();

  function confirmarLimpezaIfome() {
    // Pergunto antes de apagar e só chamo a limpeza se a pessoa confirmar.
    Alert.alert(
      'Limpar dados do iFome?',
      'Isso apaga o carrinho, as preferências, o último pedido e os dados pessoais desta conta. Seu cadastro de acesso será mantido.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Apagar dados', style: 'destructive', onPress: () => {
          return limparDados();
        } },
      ],
    );
  }

  function confirmarRedefinicaoGlobal() {
    // Explico o alcance maior desta ação antes de permitir a limpeza de desenvolvimento.
    Alert.alert(
      'Redefinir armazenamento global?',
      'Esta ação de desenvolvimento apaga TODO o AsyncStorage acessível à aplicação, inclusive dados de pedidos das outras contas e chaves de bibliotecas. Também apaga nome e telefone desta conta no SecureStore. Os cadastros de acesso e os dados pessoais das outras contas serão mantidos. Não é possível desfazer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Apagar tudo', style: 'destructive', onPress: () => {
          // Passo true para escolher a limpeza global em vez da limpeza só desta conta.
          return limparDados(true);
        } },
      ],
    );
  }

  function mostrarLimpezaGlobal() {
    // Consulto a indicação de desenvolvimento do Expo antes de montar esta opção extra.
    if (__DEV__) {
      return (
        <Botao
          titulo="Redefinição global (desenvolvimento)"
          variante="secundario"
          aoPressionar={confirmarRedefinicaoGlobal}
          desabilitado={ocupado}
        />
      );
    }

    return null;
  }

  return (
    // Agrupo os botões nesta View para aplicar o mesmo espaçamento às ações de limpeza.
    <View style={estilos.limpeza}>
      {/* Escolho a variante secundária do meu Botao para apresentar esta ação com menos destaque. */}
      <Botao
        titulo="Limpar dados do iFome"
        variante="secundario"
        aoPressionar={confirmarLimpezaIfome}
        desabilitado={ocupado}
      />
      {/* Exibo esta opção extra apenas quando o aplicativo está em desenvolvimento. */}
      {mostrarLimpezaGlobal()}
    </View>
  );
}
