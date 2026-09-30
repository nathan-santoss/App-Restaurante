import { ScrollView, Text, View } from 'react-native';
import { useApp } from '../../contexts/AppContext.jsx';
import { estilos } from '../../styles/telas.js';
import { formatarData } from '../../utils/formatacao.js';
import Botao from '../components/Botao.jsx';
import EstadoVazio from '../components/EstadoVazio.jsx';
import ItensPedido from '../components/ItensPedido.jsx';
import Tela from '../components/Tela.jsx';
import TotalPedido from '../components/TotalPedido.jsx';

export default function ResumoScreen({ navigation }) {
  const {
    itens,
    totalCentavos,
    totalUnidades,
    cliente,
    confirmarPedido,
    resumoConfirmado,
    bloqueado,
  } = useApp();

  function comecarOutroPedido() {
    navigation.popToTop();
  }

  function corrigirCarrinho() {
    // Volto uma tela para permitir os ajustes antes da confirmação.
    navigation.goBack();
  }

  let mostrarDadosCliente = false;
  // Evito exibir um cartão sem conteúdo quando nome e telefone estão vazios.
  if (cliente) {
    if (cliente.nome || cliente.telefone) {
      mostrarDadosCliente = true;
    }
  }

  // Depois da confirmação, mostro a cópia do pedido que já ficou salva.
  if (resumoConfirmado) {
    return (
      <Tela
        navigation={navigation}
        titulo="Tudo certo!"
        subtitulo="Seu pedido ficou salvo por aqui."
      >
        <ScrollView contentContainerStyle={estilos.conteudo}>
          <View style={estilos.confirmado}>
            <Text style={estilos.tituloConfirmado}>Pedido registrado</Text>
            <Text style={estilos.textoForte}>Salvo neste aparelho.</Text>
            <Text style={estilos.texto}>
              Este é um registro local. O pedido não foi enviado a um restaurante.
            </Text>
            {/* Permito selecionar este Text para copiar a identificação do pedido salvo. */}
            <Text selectable style={estilos.identificador}>
              {resumoConfirmado.id}
            </Text>
            <Text style={estilos.texto}>{formatarData(resumoConfirmado.data)}</Text>
          </View>
          {/* Apresento os itens confirmados sem edição para preservar o registro deste pedido. */}
          <ItensPedido itens={resumoConfirmado.itens} />
          <TotalPedido
            totalCentavos={resumoConfirmado.totalCentavos}
            totalUnidades={resumoConfirmado.totalUnidades}
          />
          <Botao
            titulo="Começar outro pedido"
            aoPressionar={comecarOutroPedido}
            desabilitado={bloqueado}
          />
        </ScrollView>
      </Tela>
    );
  }

  function mostrarResumoVazio() {
    // Oriento a pessoa a montar o carrinho caso ela chegue ao resumo sem itens.
    if (itens.length === 0) {
      return (
        <EstadoVazio
          titulo="Nenhum item para revisar"
          mensagem="Volte ao cardápio para montar seu pedido."
        />
      );
    }

    return null;
  }

  function mostrarCliente() {
    // Só leio nome e telefone nas funções abaixo quando tenho dados para apresentar.
    if (mostrarDadosCliente) {
      return (
        <View style={estilos.cartao}>
          <Text style={estilos.tituloSecao}>Seus dados</Text>
          {mostrarNomeCliente()}
          {mostrarTelefoneCliente()}
          <Text style={estilos.etiqueta}>
            Guardados separadamente no armazenamento seguro.
          </Text>
        </View>
      );
    }

    return null;
  }

  function mostrarNomeCliente() {
    // Apresento o nome somente quando esse campo opcional contém algum texto.
    if (Boolean(cliente.nome)) {
      return (
        <Text style={estilos.textoForte}>{cliente.nome}</Text>
      );
    }

    return null;
  }

  function mostrarTelefoneCliente() {
    // Confiro o telefone separadamente para permitir salvar apenas um dos dados pessoais.
    if (Boolean(cliente.telefone)) {
      return (
        <Text style={estilos.texto}>{cliente.telefone}</Text>
      );
    }

    return null;
  }

  return (
    <Tela
      navigation={navigation}
      titulo="Resumo do pedido"
      subtitulo="Confira os detalhes antes de confirmar."
    >
      <ScrollView contentContainerStyle={estilos.conteudo}>
        {mostrarResumoVazio()}
        {/* Reutilizo ItensPedido para apresentar cada produto com quantidade, preço e subtotal. */}
        <ItensPedido itens={itens} />
        {/* Incluo nome e telefone apenas se a pessoa tiver salvo esses dados. */}
        {mostrarCliente()}
        <Botao
          titulo="Voltar ao carrinho e corrigir"
          variante="secundario"
          aoPressionar={corrigirCarrinho}
          desabilitado={bloqueado}
        />
        <Text style={estilos.texto}>
          Ao confirmar, o pedido será registrado somente neste aparelho. Nenhum pagamento
          será realizado.
        </Text>
      </ScrollView>
      <View style={estilos.rodape}>
        {/* Entrego os totais ao componente TotalPedido, que organiza a apresentação dos valores. */}
        <TotalPedido totalCentavos={totalCentavos} totalUnidades={totalUnidades} />
        {/* Somente neste botão chamo a ação que registra o pedido no aparelho. */}
        <Botao
          titulo="Confirmar pedido"
          aoPressionar={confirmarPedido}
          desabilitado={bloqueado || itens.length === 0}
        />
      </View>
    </Tela>
  );
}
