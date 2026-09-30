import { FlatList, Pressable, Text, View } from 'react-native';
import { useApp } from '../../contexts/AppContext.jsx';
import { categorias } from '../../models/cardapio.js';
import { estilos, estiloFiltro, estiloTextoFiltro } from '../../styles/telas.js';
import { formatarMoeda } from '../../utils/formatacao.js';
import Botao from '../components/Botao.jsx';
import EstadoVazio from '../components/EstadoVazio.jsx';
import ProdutoCard from '../components/ProdutoCard.jsx';
import Tela from '../components/Tela.jsx';

export default function CardapioScreen({ navigation }) {
  const {
    produtosVisiveis,
    preferencias,
    mudarPreferencias,
    totalUnidades,
    totalCentavos,
    bloqueado,
    ocupado,
  } = useApp();

  // Devolvo o ID fixo do produto para a lista reconhecê-lo quando a tela atualizar.
  function identificarProduto(produto) {
    return produto.id;
  }

  function mostrarProduto(informacoesDoItem) {
    // Retiro o produto do objeto enviado pela FlatList e passo seus dados ao cartão.
    const produto = informacoesDoItem.item;
    return <ProdutoCard produto={produto} />;
  }

  function abrirCarrinho() {
    navigation.navigate('Carrinho');
  }

  // Apresento no botão a quantidade total de unidades e o valor do carrinho.
  const valorDoCarrinho = formatarMoeda(totalCentavos);
  const tituloDoCarrinho = 'Ver carrinho · ' + totalUnidades + ' un. · ' + valorDoCarrinho;

  return (
    <Tela navigation={navigation} inicio>
      {/* Uso FlatList para montar a lista a partir de data; renderItem define o cartão de cada produto. */}
      {/* Com keyExtractor, devolvo a identificação de cada linha para o React acompanhar as mudanças. */}
      <FlatList
        data={produtosVisiveis}
        keyExtractor={identificarProduto}
        renderItem={mostrarProduto}
        contentContainerStyle={estilos.lista}
        ListHeaderComponent={
          // Coloco neste cabeçalho a apresentação e os filtros que rolam junto com os produtos.
          <View style={estilos.introducao}>
            <View style={estilos.destaque}>
              <Text style={estilos.destaqueEtiqueta}>BATEU AQUELA FOME?</Text>
              <Text accessibilityRole="header" style={estilos.destaqueTitulo}>
                Seu próximo favorito{'\n'}está no cardápio.
              </Text>
              <Text style={estilos.destaqueTexto}>
                Escolha com calma. A gente guarda seu pedido por aqui.
              </Text>
            </View>
            <View style={estilos.filtros}>
              {/* Desenho um botão por categoria e destaco a opção escolhida. */}
              {categorias.map((categoria) => {
                const ativa = preferencias.categoria === categoria;
                return (
                  <Pressable
                    key={categoria}
                    accessibilityRole="button"
                    accessibilityState={{ selected: ativa, disabled: bloqueado }}
                    disabled={bloqueado}
                    onPress={() => {
                      // Salvo a categoria escolhida para o Controller atualizar os produtos visíveis.
                      return mudarPreferencias({ categoria: categoria });
                    }}
                    style={estiloFiltro(ativa)}
                  >
                    <Text style={estiloTextoFiltro(ativa)}>{categoria}</Text>
                  </Pressable>
                );
              })}
            </View>
            <View style={estilos.secaoLinha}>
              <Text style={estilos.tituloSecao}>Cardápio</Text>
              <Text style={estilos.etiqueta}>{produtosVisiveis.length} opções</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          // Escolho o aviso que a FlatList mostra quando data não contém nenhum produto.
          <EstadoVazio
            titulo="Nenhum produto por aqui"
            mensagem="Escolha outra categoria para ver as opções disponíveis."
          />
        }
      />
      <View style={estilos.rodape}>
        {/* Mantenho o acesso ao carrinho fora da lista para ele continuar visível durante a rolagem. */}
        <Botao
          titulo={tituloDoCarrinho}
          aoPressionar={abrirCarrinho}
          desabilitado={ocupado}
        />
      </View>
    </Tela>
  );
}
