import AsyncStorage from '@react-native-async-storage/async-storage';
import { categorias } from '../models/cardapio.js';
import { restaurarCarrinho, restaurarPedido } from '../models/pedido.js';

export const prefixo = '@ifome:';

function obterPrefixo(usuarioId) {
  if (!usuarioId) {
    throw new Error('Faça login para acessar seus dados.');
  }
  // Para o administrador, mantenho as chaves usadas antes da inclusão do login.
  if (usuarioId === 'admin') {
    return prefixo;
  }
  return prefixo + 'usuario:' + usuarioId + ':';
}

function obterChaves(usuarioId) {
  // Organizo as chaves por conta para não misturar os carrinhos dos usuários.
  const prefixoUsuario = obterPrefixo(usuarioId);
  return {
    carrinho: prefixoUsuario + 'carrinho',
    ultimoPedido: prefixoUsuario + 'ultimoPedido',
    categoria: prefixoUsuario + 'categoria',
    descricoes: prefixoUsuario + 'descricoes',
  };
}

export const preferenciasIniciais = { categoria: 'Todos', mostrarDescricoes: true };

export function interpretarJson(texto, nome) {
  if (texto === null) {
    return null;
  }
  try {
    // Converto o texto salvo de volta para um objeto que o app consegue usar.
    const dados = JSON.parse(texto);
    if (dados === null) {
      throw new Error('Conteúdo nulo.');
    }
    return dados;
  } catch {
    throw new Error(
      'Não foi possível interpretar ' + nome + '. Os dados salvos foram preservados.',
    );
  }
}

// Neste Service, acesso o armazenamento e deixo o Controller avisar quando algo falha.
export async function carregarCarrinho(usuarioId) {
  const chaves = obterChaves(usuarioId);
  const texto = await AsyncStorage.getItem(chaves.carrinho);
  const dados = interpretarJson(texto, 'o carrinho');
  // Além de ler o JSON, verifico se os itens e os preços ainda combinam com o cardápio.
  const carrinho = restaurarCarrinho(dados);
  return carrinho;
}

export async function salvarCarrinho(carrinho, usuarioId) {
  const chaves = obterChaves(usuarioId);
  // Transformo o carrinho em texto porque o AsyncStorage guarda valores desse tipo.
  const textoCarrinho = JSON.stringify(carrinho);
  await AsyncStorage.setItem(chaves.carrinho, textoCarrinho);
}

export async function apagarCarrinho(usuarioId) {
  // Removo apenas a chave do carrinho, preservando o último pedido e as preferências.
  const chaves = obterChaves(usuarioId);
  await AsyncStorage.removeItem(chaves.carrinho);
}

export async function carregarUltimoPedido(usuarioId) {
  const chaves = obterChaves(usuarioId);
  const texto = await AsyncStorage.getItem(chaves.ultimoPedido);
  const dados = interpretarJson(texto, 'o último pedido');
  const pedido = restaurarPedido(dados);
  return pedido;
}

export async function salvarUltimoPedido(pedido, usuarioId) {
  const chaves = obterChaves(usuarioId);
  const textoPedido = JSON.stringify(pedido);
  await AsyncStorage.setItem(chaves.ultimoPedido, textoPedido);
}

export async function carregarPreferencias(usuarioId) {
  const chaves = obterChaves(usuarioId);
  const pares = await AsyncStorage.multiGet([chaves.categoria, chaves.descricoes]);
  const valores = {};

  // Recebo pares de chave e valor; separo cada um para facilitar a leitura abaixo.
  for (const par of pares) {
    const chave = par[0];
    const valor = par[1];
    valores[chave] = valor;
  }
  const preferencias = { ...preferenciasIniciais };
  // Parto das opções padrão e substituo somente as que encontro salvas.
  if (valores[chaves.categoria] !== null) {
    preferencias.categoria = interpretarJson(valores[chaves.categoria], 'a categoria');
  }
  if (valores[chaves.descricoes] !== null) {
    preferencias.mostrarDescricoes = interpretarJson(
      valores[chaves.descricoes],
      'as preferências',
    );
  }
  if (
    !categorias.includes(preferencias.categoria) ||
    typeof preferencias.mostrarDescricoes !== 'boolean'
  ) {
    throw new Error('As preferências salvas têm formato inválido.');
  }
  return preferencias;
}

export async function salvarPreferencias(preferencias, usuarioId) {
  const chaves = obterChaves(usuarioId);
  const categoriaSalva = JSON.stringify(preferencias.categoria);
  const descricoesSalvas = JSON.stringify(preferencias.mostrarDescricoes);

  // Envio as duas preferências juntas na mesma chamada.
  await AsyncStorage.multiSet([
    [chaves.categoria, categoriaSalva],
    [chaves.descricoes, descricoesSalvas],
  ]);
}

export async function limparDadosIfome(usuarioId) {
  const prefixoUsuario = obterPrefixo(usuarioId);
  const existentes = await AsyncStorage.getAllKeys();
  // Escolho somente as chaves desta conta antes de pedir o apagamento.
  const chavesIfome = existentes.filter((chave) => {
    if (usuarioId === 'admin' && chave.startsWith(prefixo + 'usuario:')) {
      // Excluo da seleção as contas comuns, pois elas também começam com o prefixo do app.
      return false;
    }
    return chave.startsWith(prefixoUsuario);
  });
  await AsyncStorage.multiRemove(chavesIfome);
}

export async function redefinirAsyncStorage() {
  // Restrinjo esta limpeza global ao desenvolvimento, depois da confirmação na tela.
  if (!__DEV__) {
    throw new Error('Esta ação só está disponível em desenvolvimento.');
  }
  await AsyncStorage.getAllKeys();
  await AsyncStorage.clear();
}
