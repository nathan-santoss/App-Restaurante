import { Text, View } from 'react-native';
import { useApp } from '../../contexts/AppContext.jsx';
import { estilos } from '../../styles/componentes.js';
import { formatarMoeda } from '../../utils/formatacao.js';
import Botao from './Botao.jsx';
import SeletorQuantidade from './SeletorQuantidade.jsx';

export default function ItensPedido({ itens, editavel = false }) {
  const { mudarQuantidade, removerItem, bloqueado } = useApp();

  // Para cada item, apresento os valores que já recebi calculados do Controller.
  function mostrarItem(item) {
    function mostrarControlesDoItem() {
      // Aproveito o item recebido por mostrarItem para ligar cada controle ao produto desta linha.
      if (editavel) {
        return (
          <View style={estilos.acoesProduto}>
            <SeletorQuantidade
              quantidade={item.quantidade}
              nome={item.nome}
              desabilitado={bloqueado}
              aoMudar={(variacao) => {
                // Junto o ID deste item à variação para alterar o produto certo no carrinho.
                return mudarQuantidade(item.id, variacao);
              }}
            />
            <Botao
              titulo="Remover"
              rotuloAcessivel={'Remover ' + item.nome}
              variante="discreto"
              aoPressionar={() => {
                return removerItem(item.id);
              }}
              desabilitado={bloqueado}
            />
          </View>
        );
      }

      // No resumo e na consulta, devolvo null para apresentar os valores sem botões de edição.
      return null;
    }

    return (
      // Identifico esta View com key para o React acompanhar o produto quando a lista mudar.
      <View key={item.id} style={estilos.itemPedido}>
        <View style={estilos.linha}>
          <Text style={estilos.nomeItem}>{item.nome}</Text>
          <Text style={estilos.subtotal}>{formatarMoeda(item.subtotalCentavos)}</Text>
        </View>
        <Text style={estilos.detalhe}>
          {item.quantidade} un. × {formatarMoeda(item.precoCentavos)} cada
        </Text>
        {/* Só ofereço os controles quando estou mostrando o carrinho editável. */}
        {mostrarControlesDoItem()}
      </View>
    );
  }

  return (
    <View>
      {/* Uso map para chamar mostrarItem uma vez por produto e reunir os blocos visuais resultantes. */}
      {itens.map(mostrarItem)}
    </View>
  );
}
