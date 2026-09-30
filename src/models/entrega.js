export function validarEntrega(dados) {
  // Confiro os limites do planeta para não guardar um ponto impossível no pedido.
  if (
    !dados ||
    !Number.isFinite(dados.latitude) || Math.abs(dados.latitude) > 90 ||
    !Number.isFinite(dados.longitude) || Math.abs(dados.longitude) > 180
  ) {
    throw new Error('Capture sua localização antes de confirmar o pedido.');
  }
  // Aceito precisão desconhecida, mas rejeito distâncias negativas ou inválidas.
  if (dados.precisaoMetros !== null) {
    if (!Number.isFinite(dados.precisaoMetros) || dados.precisaoMetros < 0) {
      throw new Error('A precisão da localização é inválida. Capture novamente.');
    }
  }
  // Verifico o horário para manter o registro do momento em que consultei o GPS.
  if (typeof dados.capturadaEm !== 'string' || !Number.isFinite(Date.parse(dados.capturadaEm))) {
    throw new Error('O horário da localização é inválido. Capture novamente.');
  }
  // Limito a referência a uma observação curta, como apartamento ou portaria.
  if (typeof dados.complemento !== 'string' || dados.complemento.length > 200) {
    throw new Error('Informe um complemento de até 200 caracteres.');
  }
  // Devolvo uma cópia para preservar a entrega mesmo se o formulário mudar depois.
  return {
    latitude: dados.latitude,
    longitude: dados.longitude,
    precisaoMetros: dados.precisaoMetros,
    capturadaEm: dados.capturadaEm,
    complemento: dados.complemento.trim(),
  };
}
