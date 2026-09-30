import test from 'node:test';
import assert from 'node:assert/strict';
import { validarEntrega } from '../src/models/entrega.js';
import { adicionarProduto, criarPedido, restaurarPedido } from '../src/models/pedido.js';
import { registrarPedido } from '../src/controllers/confirmacao.js';
import { obterLocalizacaoAtual } from '../src/services/localizacao.js';

const entrega = {
  latitude: -5.7945, longitude: -35.211,
  precisaoMetros: 12, capturadaEm: '2026-09-30T12:00:00.000Z',
  complemento: '  Portaria azul  ',
};
const carrinho = adicionarProduto(null, 'comida-01', 2);

// Simulo o retorno do celular para conferir os caminhos de erro sem acessar um GPS real.
function criarGps(alteracoes = {}) {
  return {
    Accuracy: { High: 4 },
    requestForegroundPermissionsAsync: async () => ({ granted: true, canAskAgain: true }),
    hasServicesEnabledAsync: async () => true,
    getCurrentPositionAsync: async (opcoes) => {
      assert.equal(opcoes.accuracy, 4);
      return {
        coords: { latitude: -5.7945, longitude: -35.211, accuracy: 12 },
        timestamp: Date.parse(entrega.capturadaEm),
      };
    },
    ...alteracoes,
  };
}

test('captura coordenadas, precisão e horário do aparelho', async () => {
  const ponto = await obterLocalizacaoAtual(criarGps());
  assert.deepEqual(ponto, { ...entrega, complemento: '' });
});

for (const canAskAgain of [true, false]) {
  test('permite recuperar a recusa da localização: canAskAgain=' + canAskAgain, async () => {
    let consultouGps = false;
    const gps = criarGps({
      requestForegroundPermissionsAsync: async () => ({ granted: false, canAskAgain }),
      hasServicesEnabledAsync: async () => { consultouGps = true; return true; },
    });
    await assert.rejects(obterLocalizacaoAtual(gps), (erro) => {
      assert.equal(erro.abrirAjustes, !canAskAgain);
      return true;
    });
    assert.equal(consultouGps, false);
  });
}

test('orienta a ativação do GPS antes de buscar a posição', async () => {
  let capturou = false;
  const gps = criarGps({
    hasServicesEnabledAsync: async () => false,
    getCurrentPositionAsync: async () => { capturou = true; },
  });
  await assert.rejects(obterLocalizacaoAtual(gps), /Ative a localização/);
  assert.equal(capturou, false);
});

test('encerra a espera e ignora uma posição que chega depois do prazo', async () => {
  let responder;
  const gps = criarGps({
    getCurrentPositionAsync: () => new Promise((resolve) => { responder = resolve; }),
  });
  await assert.rejects(obterLocalizacaoAtual(gps, 5), /demorou demais/);
  responder({ coords: {}, timestamp: Date.now() });
});

test('propaga falha do sensor para permitir uma nova tentativa', async () => {
  const gps = criarGps({
    getCurrentPositionAsync: async () => { throw new Error('Sensor indisponível'); },
  });
  await assert.rejects(obterLocalizacaoAtual(gps), /Sensor indisponível/);
});

test('aceita coordenadas zero e precisão desconhecida', () => {
  const ponto = validarEntrega({ ...entrega, latitude: 0, longitude: 0, precisaoMetros: null });
  assert.equal(ponto.latitude, 0);
  assert.equal(ponto.precisaoMetros, null);
  assert.equal(ponto.complemento, 'Portaria azul');
});

test('rejeita localização incompleta e valores corrompidos', () => {
  for (const dados of [
    null, {}, { ...entrega, latitude: 91 }, { ...entrega, longitude: -181 },
    { ...entrega, latitude: NaN }, { ...entrega, longitude: '12' },
    { ...entrega, precisaoMetros: -1 }, { ...entrega, capturadaEm: 'inválida' },
    { ...entrega, complemento: 'x'.repeat(201) },
  ]) {
    assert.throws(() => validarEntrega(dados));
  }
});

test('impede um novo pedido sem localização', () => {
  assert.throws(() => criarPedido(carrinho), /Capture sua localização/);
});

test('preserva entrega e totais após salvar e restaurar o JSON', () => {
  const original = { ...entrega };
  const pedido = criarPedido(carrinho, original);
  original.latitude = 0;
  const restaurado = restaurarPedido(JSON.parse(JSON.stringify(pedido)));
  assert.equal(restaurado.entrega.latitude, entrega.latitude);
  assert.equal(restaurado.entrega.complemento, 'Portaria azul');
  assert.equal(restaurado.totalCentavos, pedido.totalCentavos);
});

test('restaura pedidos antigos sem exigir localização retroativamente', () => {
  const legado = criarPedido(carrinho, entrega);
  delete legado.entrega;
  assert.equal(restaurarPedido(legado).entrega, null);
});

test('recusa coordenadas corrompidas no pedido salvo', () => {
  const pedido = criarPedido(carrinho, entrega);
  pedido.entrega.longitude = Infinity;
  assert.throws(() => restaurarPedido(pedido), /Capture sua localização/);
});

test('salva entrega na conta certa antes de apagar o carrinho', async () => {
  const acoes = [];
  const armazenamento = {
    salvarUltimoPedido: async (pedido, usuarioId) => {
      assert.equal(pedido.entrega.latitude, entrega.latitude);
      acoes.push(['salvar', usuarioId]);
    },
    apagarCarrinho: async (usuarioId) => { acoes.push(['apagar', usuarioId]); },
  };
  const resultado = await registrarPedido(carrinho, null, armazenamento, 'conta-2', entrega);
  assert.equal(resultado.limpezaPendente, false);
  assert.deepEqual(acoes, [['salvar', 'conta-2'], ['apagar', 'conta-2']]);
});

test('mantém o carrinho quando a gravação do pedido falha', async () => {
  let apagou = false;
  const armazenamento = {
    salvarUltimoPedido: async () => { throw new Error('Sem espaço'); },
    apagarCarrinho: async () => { apagou = true; },
  };
  await assert.rejects(
    registrarPedido(carrinho, null, armazenamento, 'admin', entrega), /Sem espaço/,
  );
  assert.equal(apagou, false);
});

test('não grava nem apaga o carrinho se a entrega estiver ausente', async () => {
  const armazenamento = {
    salvarUltimoPedido: async () => assert.fail('Não deveria salvar'),
    apagarCarrinho: async () => assert.fail('Não deveria apagar'),
  };
  await assert.rejects(registrarPedido(carrinho, null, armazenamento, 'admin'), /Capture/);
});

test('repete só a limpeza e preserva a entrega do pedido já confirmado', async () => {
  let gravacoes = 0;
  const armazenamento = {
    salvarUltimoPedido: async () => { gravacoes += 1; },
    apagarCarrinho: async () => { throw new Error('Falha ao limpar'); },
  };
  const primeiro = await registrarPedido(carrinho, null, armazenamento, 'admin', entrega);
  assert.equal(primeiro.limpezaPendente, true);
  armazenamento.apagarCarrinho = async () => {};
  const repetido = await registrarPedido(carrinho, primeiro.pedido, armazenamento, 'admin', null);
  assert.equal(repetido.limpezaPendente, false);
  assert.equal(gravacoes, 1);
  assert.deepEqual(repetido.pedido.entrega, primeiro.pedido.entrega);
});
