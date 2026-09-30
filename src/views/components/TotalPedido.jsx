import { Text, View } from 'react-native';
import { estilos } from '../../styles/componentes.js';
import { formatarMoeda } from '../../utils/formatacao.js';

export default function TotalPedido({ totalCentavos, totalUnidades }) {
  // Recebo o total já calculado e só preparo o texto em reais para a tela.
  const totalFormatado = formatarMoeda(totalCentavos);
  return (
    // Aplico à View o estilo do cartão de total, com fundo e espaçamento próprios.
    <View style={estilos.total}>
      <Text style={estilos.rotuloTotal}>Total do pedido</Text>
      {/* Dou destaque ao valor com um estilo diferente do rótulo e da quantidade. */}
      <Text style={estilos.valorTotal}>{totalFormatado}</Text>
      {/* Mostro a soma das quantidades, que pode ser maior que o número de produtos diferentes. */}
      <Text style={estilos.detalhe}>{totalUnidades} unidades · Sem taxas adicionais</Text>
    </View>
  );
}
