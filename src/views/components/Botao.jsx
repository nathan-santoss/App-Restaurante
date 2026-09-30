import { Pressable, Text } from 'react-native';
import { estiloBotao, estiloTextoBotao } from '../../styles/componentes.js';

// Recebo as props, que são as opções enviadas pela tela para configurar este botão.
export default function Botao({
  titulo,
  aoPressionar,
  desabilitado = false,
  variante = 'principal',
  rotuloAcessivel,
}) {
  // Aproveito o título quando não recebo uma descrição própria para o leitor de tela.
  let descricaoAcessivel = titulo;
  if (rotuloAcessivel) {
    descricaoAcessivel = rotuloAcessivel;
  }

  function escolherEstilo(informacoesDoToque) {
    // Recebo do Pressable se o toque está ativo para atualizar a aparência do botão.
    const pressionado = informacoesDoToque.pressed;
    const estilosDoBotao = estiloBotao(variante, desabilitado, pressionado);
    return estilosDoBotao;
  }

  return (
    // Com Pressable, crio uma área que reconhece o toque e pode ser desabilitada.
    // Entrego ao toque a função recebida da tela, sem executá-la durante a montagem.
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={descricaoAcessivel}
      accessibilityState={{ disabled: desabilitado }}
      disabled={desabilitado}
      onPress={aoPressionar}
      style={escolherEstilo}
    >
      {/* Coloco a legenda em Text, o componente que uso para exibir palavras na interface. */}
      <Text style={estiloTextoBotao(variante)}>{titulo}</Text>
    </Pressable>
  );
}
