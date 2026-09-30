import { Text, View } from 'react-native';
import { estilos } from '../../styles/componentes.js';

export default function EstadoVazio({ titulo, mensagem }) {
  // Exibo uma orientação simples quando ainda não há itens para mostrar.
  return (
    // Uso View como uma caixa para agrupar e alinhar a marca, o título e a orientação.
    <View style={estilos.vazio}>
      <Text style={estilos.marcaVazio} accessibilityElementsHidden>
        iF
      </Text>
      {/* Aproveito os textos recebidos para usar este aviso em mais de uma tela. */}
      <Text style={estilos.tituloVazio}>{titulo}</Text>
      {/* Entre chaves, mostro o valor da mensagem recebida em vez de um texto fixo. */}
      <Text style={estilos.textoVazio}>{mensagem}</Text>
    </View>
  );
}
