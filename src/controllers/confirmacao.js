import { criarPedido } from '../models/pedido.js';

// Pelo ID do carrinho, descubro se já registrei este pedido em uma tentativa anterior.
export async function registrarPedido(carrinho, ultimoPedido, armazenamento, usuarioId) {
  if (!carrinho) {
    throw new Error('Seu carrinho está vazio.');
  }
  let pedido = ultimoPedido;
  if (!pedido || pedido.carrinhoId !== carrinho.id) {
    // Crio um registro somente se este carrinho ainda não corresponde ao último pedido.
    pedido = criarPedido(carrinho);
    // Primeiro salvo o pedido; só depois tento apagar o carrinho.
    await armazenamento.salvarUltimoPedido(pedido, usuarioId);
  }
  try {
    // Tento apagar o carrinho depois do registro, preservando o pedido se esta etapa falhar.
    await armazenamento.apagarCarrinho(usuarioId);
    return { pedido: pedido, limpezaPendente: false };
  } catch {
    // Se a limpeza falhar, aviso que ainda preciso terminá-la sem criar outro pedido.
    return { pedido: pedido, limpezaPendente: true };
  }
}
