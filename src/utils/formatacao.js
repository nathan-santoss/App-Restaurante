export function formatarMoeda(centavos) {
  // Divido por cem só na hora de mostrar o preço em reais.
  const valorEmReais = centavos / 100;
  // Peço o símbolo R$ e os separadores brasileiros sem montar esse texto à mão.
  const valorFormatado = valorEmReais.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  return valorFormatado;
}

export function formatarData(data) {
  // Uso o formato brasileiro para apresentar a data e a hora do pedido.
  const dataDoPedido = new Date(data);
  // Apresento o horário no fuso do aparelho a partir da data que ficou salva.
  const dataFormatada = dataDoPedido.toLocaleString('pt-BR');

  return dataFormatada;
}
