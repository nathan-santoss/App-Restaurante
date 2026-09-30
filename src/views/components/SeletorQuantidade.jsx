import { Pressable, Text, View } from 'react-native';
import { quantidadeMaxima } from '../../models/pedido.js';
import { estilos, estiloQuantidade } from '../../styles/componentes.js';

export default function SeletorQuantidade({
  quantidade,
  aoMudar,
  desabilitado = false,
  nome,
}) {
  // Nos limites de quantidade, desativo apenas o botão que não pode mais ser usado.
  const diminuirDesabilitado = desabilitado || quantidade <= 1;
  const aumentarDesabilitado = desabilitado || quantidade >= quantidadeMaxima;

  function diminuir() {
    // Envio a variação de uma unidade; quem recebeu aoMudar calcula a quantidade final.
    return aoMudar(-1);
  }

  function aumentar() {
    return aoMudar(1);
  }

  return (
    <View style={estilos.grupoQuantidade}>
      {/* Faço do sinal de menos uma área de toque; onPress liga essa área à função diminuir. */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={'Diminuir quantidade de ' + nome}
        accessibilityState={{ disabled: diminuirDesabilitado }}
        disabled={diminuirDesabilitado}
        onPress={diminuir}
        style={estiloQuantidade(diminuirDesabilitado)}
      >
        <Text style={estilos.sinalQuantidade}>−</Text>
      </Pressable>
      {/* Incluo o nome do produto para o leitor de tela identificar esta quantidade. */}
      <Text
        accessibilityLabel={quantidade + ' unidades de ' + nome}
        style={estilos.quantidade}
      >
        {quantidade}
      </Text>
      {/* Informo o bloqueio tanto ao Pressable quanto ao leitor de tela pelas propriedades disabled. */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={'Aumentar quantidade de ' + nome}
        accessibilityState={{ disabled: aumentarDesabilitado }}
        disabled={aumentarDesabilitado}
        onPress={aumentar}
        style={estiloQuantidade(aumentarDesabilitado)}
      >
        <Text style={estilos.sinalQuantidade}>+</Text>
      </Pressable>
    </View>
  );
}
