import { Alert, ScrollView, Text, View } from 'react-native';
import { useApp } from '../../contexts/AppContext.jsx';
import { estilos } from '../../styles/telas.js';
import Botao from '../components/Botao.jsx';
import EstadoVazio from '../components/EstadoVazio.jsx';
import ItensPedido from '../components/ItensPedido.jsx';
import Tela from '../components/Tela.jsx';
import TotalPedido from '../components/TotalPedido.jsx';

export default function CarrinhoScreen({ navigation }) {
  const { itens, totalCentavos, totalUnidades, esvaziarCarrinho, bloqueado } = useApp();
  // Verifico se há itens para decidir quais ações posso oferecer nesta tela.
  const vazio = itens.length === 0;

  function confirmarEsvaziamento() {
    // Antes de esvaziar a lista, dou a chance de cancelar a ação.
    Alert.alert(
      'Esvaziar carrinho?',
      'Todos os itens serão removidos. O último pedido confirmado será mantido.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Esvaziar', style: 'destructive', onPress: esvaziarCarrinho },
      ],
    );
  }

  function continuarEscolhendo() {
    // Retorno ao começo da pilha, onde deixei o cardápio.
    navigation.popToTop();
  }

  function revisarPedido() {
    // Nesta etapa, apenas abro o resumo; ainda não registro o pedido.
    navigation.navigate('Resumo');
  }

  function mostrarCarrinhoVazio() {
    // Apresento uma orientação para voltar às compras quando a lista não tem nenhum item.
    if (vazio) {
      return (
        <EstadoVazio
          titulo="A fome está só começando"
          mensagem="Seu carrinho está vazio. Explore o cardápio e adicione algo gostoso."
        />
      );
    }

    return null;
  }

  function mostrarItensDoCarrinho() {
    // Uso a comparação com false para montar os controles apenas quando o carrinho tem produtos.
    if (vazio === false) {
      return (
        <>
          {/* Agrupo o título, os itens e o botão sem acrescentar outra View ao layout. */}
          <View style={estilos.secaoLinha}>
            <Text style={estilos.tituloSecao}>Seus itens</Text>
            <Text style={estilos.etiqueta}>{totalUnidades} unidades</Text>
          </View>
          {/* Ativo a edição para mostrar os botões de quantidade e remoção em cada item. */}
          <ItensPedido itens={itens} editavel />
          <Botao
            titulo="Esvaziar carrinho"
            variante="secundario"
            aoPressionar={confirmarEsvaziamento}
            desabilitado={bloqueado}
          />
        </>
      );
    }

    return null;
  }

  return (
    <Tela
      navigation={navigation}
      titulo="Seu carrinho"
      subtitulo="Uma boa escolha em cada item."
    >
      {/* Com ScrollView, permito rolar os itens quando a lista ocupa mais espaço que a tela. */}
      <ScrollView contentContainerStyle={estilos.conteudo}>
        {mostrarCarrinhoVazio()}
        {mostrarItensDoCarrinho()}
        <Botao
          titulo="Continuar escolhendo"
          variante="secundario"
          aoPressionar={continuarEscolhendo}
          desabilitado={bloqueado}
        />
      </ScrollView>
      {/* Deixo esta View fora da rolagem para manter o total e a finalização acessíveis no rodapé. */}
      <View style={estilos.rodape}>
        {/* Reúno o total e a revisão abaixo da lista; só libero a revisão quando há itens. */}
        <TotalPedido totalCentavos={totalCentavos} totalUnidades={totalUnidades} />
        <Botao
          titulo="Finalizar · Revisar pedido"
          aoPressionar={revisarPedido}
          desabilitado={vazio || bloqueado}
        />
      </View>
    </Tela>
  );
}
