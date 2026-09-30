import { useState } from 'react';
import { Text, View } from 'react-native';
import { useApp } from '../../contexts/AppContext.jsx';
import { estilos } from '../../styles/componentes.js';
import { formatarMoeda } from '../../utils/formatacao.js';
import Botao from './Botao.jsx';
import SeletorQuantidade from './SeletorQuantidade.jsx';

export default function ProdutoCard({ produto }) {
  const { adicionarAoCarrinho, ajustarSelecao, preferencias, bloqueado } = useApp();
  // Guardo aqui a quantidade que ainda vou adicionar, separada do carrinho salvo.
  const [quantidade, definirQuantidade] = useState(1);
  const [mensagem, definirMensagem] = useState('');

  function selecionarQuantidade(variacao) {
    // Recebo a quantidade mais recente do estado para aplicar o aumento ou a diminuição.
    definirQuantidade((atual) => {
      return ajustarSelecao(atual, variacao);
    });
    // Retiro o aviso anterior quando a pessoa começa a escolher outra quantidade.
    definirMensagem('');
  }

  async function adicionar() {
    // Envio o ID e as unidades; o Model busca o nome e o preço no cardápio.
    const sucesso = await adicionarAoCarrinho(produto.id, quantidade);
    if (sucesso) {
      // Depois da gravação, aviso que deu certo e preparo a próxima seleção.
      definirMensagem('Adicionado ao carrinho.');
      definirQuantidade(1);
    }
  }

  function mostrarDescricao() {
    // Consulto a preferência antes de devolver o texto que vai aparecer no cartão.
    if (preferencias.mostrarDescricoes) {
      return (
        <Text style={estilos.descricaoProduto}>{produto.descricao}</Text>
      );
    }

    return null;
  }

  function mostrarMensagem() {
    // Só crio o texto de sucesso depois que a ação de adicionar preenche a mensagem.
    if (Boolean(mensagem)) {
      return (
        <Text accessibilityLiveRegion="polite" style={estilos.sucesso}>
          {mensagem}
        </Text>
      );
    }

    return null;
  }

  return (
    // Monto cada produto como um cartão que reúne identificação, preço e controles de compra.
    <View style={estilos.produto}>
      <View style={estilos.linhaProduto}>
        <View style={estilos.seloProduto} accessibilityElementsHidden>
          <Text style={estilos.numeroProduto}>{produto.id.slice(-2)}</Text>
        </View>
        <View style={estilos.flexivel}>
          <Text style={estilos.categoriaProduto}>{produto.categoria.toUpperCase()}</Text>
          <Text style={estilos.nomeProduto}>{produto.nome}</Text>
        </View>
      </View>
      {/* Respeito a escolha feita nos Ajustes antes de mostrar a descrição. */}
      {mostrarDescricao()}
      <Text style={estilos.preco}>{formatarMoeda(produto.precoCentavos)}</Text>
      <View style={estilos.acoesProduto}>
        {/* Reaproveito o SeletorQuantidade, meu componente com os botões de menos e mais. */}
        <SeletorQuantidade
          quantidade={quantidade}
          aoMudar={selecionarQuantidade}
          nome={produto.nome}
          desabilitado={bloqueado}
        />
        {/* Passo adicionar como ação do Botao para salvar a seleção somente quando houver um toque. */}
        <Botao
          titulo="Adicionar +"
          rotuloAcessivel={'Adicionar ' + produto.nome + ' ao carrinho'}
          aoPressionar={adicionar}
          desabilitado={bloqueado}
        />
      </View>
      {mostrarMensagem()}
    </View>
  );
}
