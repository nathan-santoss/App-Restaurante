import { buscarProduto, produtos } from './cardapio.js';

export const quantidadeMaxima = 99;

export function validarQuantidade(quantidade) {
  // Confiro se recebi uma quantidade inteira dentro do limite do cardápio.
  if (!Number.isInteger(quantidade) || quantidade < 1 || quantidade > quantidadeMaxima) {
    throw new Error('Escolha uma quantidade inteira entre 1 e 99 por produto.');
  }
  return quantidade;
}

export function ajustarQuantidade(quantidade, variacao) {
  validarQuantidade(quantidade);
  let novaQuantidade = Number(quantidade + variacao);

  // Mesmo ao diminuir, deixo pelo menos uma unidade no carrinho.
  if (novaQuantidade < 1) {
    novaQuantidade = 1;
  }
  if (novaQuantidade > quantidadeMaxima) {
    novaQuantidade = quantidadeMaxima;
  }

  return novaQuantidade;
}

export function gerarIdentificador() {
  // Junto a hora atual com uma parte aleatória para identificar cada carrinho.
  const horario = Date.now().toString(36);
  const numeroAleatorio = Math.random().toString(36);
  const parteAleatoria = numeroAleatorio.slice(2, 10);
  const identificador = horario + '-' + parteAleatoria;

  return identificador;
}

// No Model, faço as contas em centavos; deixo a apresentação em reais para a tela.
export function calcularTotais(itens) {
  let totalCentavos = 0;
  let totalUnidades = 0;
  const itensCalculados = [];

  for (const item of itens) {
    const subtotalCentavos = item.precoCentavos * item.quantidade;
    // Somo o valor desta linha ao pedido e conto todas as unidades escolhidas.
    totalCentavos = totalCentavos + subtotalCentavos;
    totalUnidades = totalUnidades + item.quantidade;

    // Com os três pontos, copio os campos sem alterar o item original.
    const itemCalculado = { ...item, subtotalCentavos: subtotalCentavos };
    itensCalculados.push(itemCalculado);
  }
  return { itens: itensCalculados, totalCentavos: totalCentavos, totalUnidades: totalUnidades };
}

export function adicionarProduto(carrinho, produtoId, quantidade) {
  validarQuantidade(quantidade);
  const produto = buscarProduto(produtoId);
  if (!produto) {
    throw new Error('Este produto não está disponível.');
  }
  let atual = carrinho;
  if (!atual) {
    // Inicio um carrinho com ID próprio quando este é o primeiro produto adicionado.
    atual = { id: gerarIdentificador(), itens: [] };
  }
  const existente = atual.itens.find((item) => {
    return item.id === produtoId;
  });
  if (existente) {
    // Quando o produto já está na lista, somo as unidades na mesma linha.
    const novaQuantidade = existente.quantidade + quantidade;
    validarQuantidade(novaQuantidade);
    // Confiro também a soma para não ultrapassar 99 unidades ao adicionar mais do mesmo produto.
    const carrinhoAtualizado = alterarQuantidade(atual, produtoId, novaQuantidade);
    return carrinhoAtualizado;
  }
  const item = {
    id: produto.id,
    nome: produto.nome,
    precoCentavos: produto.precoCentavos,
    quantidade: quantidade,
  };
  return { ...atual, itens: [...atual.itens, item] };
}

export function alterarQuantidade(carrinho, produtoId, quantidade) {
  validarQuantidade(quantidade);
  if (!carrinho) {
    return null;
  }

  const novosItens = [];
  // Percorro os itens e troco apenas a quantidade do produto escolhido.
  for (const item of carrinho.itens) {
    if (item.id === produtoId) {
      const itemAtualizado = { ...item, quantidade: quantidade };
      novosItens.push(itemAtualizado);
    } else {
      novosItens.push(item);
    }
  }

  return { ...carrinho, itens: novosItens };
}

export function removerProduto(carrinho, produtoId) {
  if (!carrinho) {
    return null;
  }
  const itens = [];

  // Monto outra lista e deixo de fora o produto que quero remover.
  for (const item of carrinho.itens) {
    if (item.id !== produtoId) {
      itens.push(item);
    }
  }
  if (itens.length === 0) {
    // Represento o carrinho vazio com null para que o Controller apague seu registro.
    return null;
  }
  return { ...carrinho, itens: itens };
}

function validarId(id) {
  if (typeof id !== 'string') {
    return false;
  }

  const formatoPermitido = /^[a-zA-Z0-9-]{1,80}$/;
  return formatoPermitido.test(id);
}

function validarItens(itens) {
  if (!Array.isArray(itens) || itens.length === 0 || itens.length > 100) {
    throw new Error('A lista de itens salva tem formato inválido.');
  }
  const idsEncontrados = [];
  const itensValidados = [];

  // Antes de usar o que foi salvo, verifico cada item e procuro IDs repetidos.
  for (const item of itens) {
    if (
      !item ||
      !validarId(item.id) ||
      idsEncontrados.includes(item.id) ||
      typeof item.nome !== 'string' ||
      !item.nome.trim() ||
      item.nome.length > 120 ||
      !Number.isSafeInteger(item.precoCentavos) ||
      item.precoCentavos <= 0 ||
      item.precoCentavos > 1000000
    ) {
      throw new Error('Um item salvo tem ID, nome ou preço inválido.');
    }
    validarQuantidade(item.quantidade);
    idsEncontrados.push(item.id);
    // Guardo cada ID validado para reconhecer uma repetição nas próximas voltas do laço.
    const itemValidado = {
      id: item.id,
      nome: item.nome,
      precoCentavos: item.precoCentavos,
      quantidade: item.quantidade,
    };
    itensValidados.push(itemValidado);
  }

  return itensValidados;
}

export function restaurarCarrinho(dados) {
  // Se a chave ainda não existe, considero que não há carrinho para recuperar.
  if (dados === null) {
    return null;
  }
  if (!dados || !validarId(dados.id)) {
    throw new Error('O carrinho salvo tem formato inválido.');
  }
  const itens = validarItens(dados.itens);
  if (itens.length > produtos.length) {
    throw new Error('O carrinho possui itens desconhecidos.');
  }
  for (const item of itens) {
    const produto = buscarProduto(item.id);
    // Comparo os dados salvos com o cardápio atual antes de permitir continuar a compra.
    if (
      !produto ||
      produto.precoCentavos !== item.precoCentavos ||
      produto.nome !== item.nome
    ) {
      throw new Error(
        'O carrinho salvo contém um produto que mudou ou não está disponível.',
      );
    }
  }
  return { id: dados.id, itens: itens };
}

export function criarPedido(carrinho, data = new Date()) {
  if (!carrinho || carrinho.itens.length === 0) {
    throw new Error('Adicione itens antes de confirmar.');
  }
  const itens = validarItens(carrinho.itens);
  const totais = calcularTotais(itens);
  // Guardo uma cópia dos itens para preservar os preços deste momento.
  return {
    id: 'IF-' + carrinho.id,
    carrinhoId: carrinho.id,
    data: data.toISOString(),
    itens: itens,
    totalCentavos: totais.totalCentavos,
  };
}

export function restaurarPedido(dados) {
  if (dados === null) {
    return null;
  }
  if (
    !dados ||
    !validarId(dados.carrinhoId) ||
    dados.id !== 'IF-' + dados.carrinhoId ||
    typeof dados.data !== 'string' ||
    !Number.isFinite(Date.parse(dados.data))
  ) {
    throw new Error('O último pedido salvo tem formato inválido.');
  }
  const itens = validarItens(dados.itens);
  const totais = calcularTotais(itens);
  if (dados.totalCentavos !== totais.totalCentavos) {
    // Recuso o registro se o total salvo não corresponde à soma dos itens.
    throw new Error('O total do pedido salvo é inválido.');
  }
  // Trago de volta só os dados do pedido, sem misturar nome ou telefone.
  return {
    id: dados.id,
    carrinhoId: dados.carrinhoId,
    data: dados.data,
    itens: itens,
    totalCentavos: dados.totalCentavos,
  };
}
