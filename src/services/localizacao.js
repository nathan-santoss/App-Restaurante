import { validarEntrega } from '../models/entrega.js';

// Recebo a biblioteca do aparelho para também conseguir testar as falhas sem um celular.
export async function obterLocalizacaoAtual(localizacao, limiteMs = 25000) {
  const permissao = await localizacao.requestForegroundPermissionsAsync();
  if (!permissao.granted) {
    // Distingo a recusa definitiva para oferecer o atalho aos ajustes do sistema.
    let mensagem = 'Libere a localização do Expo Go nos ajustes do celular e tente novamente.';
    if (permissao.canAskAgain) {
      mensagem = 'Permita o acesso à localização para marcar onde receber o pedido.';
    }
    const erro = new Error(mensagem);
    erro.abrirAjustes = !permissao.canAskAgain;
    throw erro;
  }

  // Consulto se a localização está ligada antes de esperar uma posição do dispositivo.
  if (!await localizacao.hasServicesEnabledAsync()) {
    throw new Error('Ative a localização (GPS) nos ajustes do celular e tente novamente.');
  }

  let temporizador;
  try {
    // Estabeleço um prazo para a tela voltar a responder mesmo se o GPS demorar.
    const prazo = new Promise((_, rejeitar) => {
      temporizador = setTimeout(() => {
        rejeitar(new Error('A localização demorou demais. Vá a um local aberto e tente novamente.'));
      }, limiteMs);
    });
    // Solicito uma leitura pontual com boa precisão, sem iniciar rastreamento contínuo.
    const posicao = await Promise.race([
      localizacao.getCurrentPositionAsync({ accuracy: localizacao.Accuracy.High }),
      prazo,
    ]);
    // Considero a precisão desconhecida somente quando o aparelho não informa esse valor.
    let precisaoMetros = null;
    if (posicao.coords.accuracy != null) {
      precisaoMetros = posicao.coords.accuracy;
    }
    const entrega = {
      latitude: posicao.coords.latitude,
      longitude: posicao.coords.longitude,
      precisaoMetros: precisaoMetros,
      capturadaEm: new Date(posicao.timestamp).toISOString(),
      complemento: '',
    };
    return validarEntrega(entrega);
  } finally {
    // Libero o temporizador tanto quando recebo o ponto quanto quando ocorre uma falha.
    clearTimeout(temporizador);
  }
}
