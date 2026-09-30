import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { categorias, filtrarProdutos } from '../models/cardapio.js';
import {
  adicionarProduto,
  ajustarQuantidade,
  alterarQuantidade,
  calcularTotais,
  removerProduto,
} from '../models/pedido.js';
import * as armazenamento from '../services/armazenamento.js';
import * as clienteSeguro from '../services/clienteSeguro.js';
import * as autenticacao from '../services/autenticacao.js';
import { registrarPedido } from './confirmacao.js';

// Começo com os dados vazios e espero a leitura antes de liberar o carrinho.
const estadoInicial = {
  usuario: null,
  pronto: false,
  ocupado: false,
  erroInicial: '',
  carrinho: null,
  preferencias: armazenamento.preferenciasIniciais,
  cliente: null,
  avisoCliente: '',
  ultimoPedido: null,
  pedidoConfirmado: null,
  limpezaPendente: false,
};

export function useAppController() {
  // Com useState, aviso as telas quando algum dado compartilhado muda.
  const [estado, definirEstado] = useState(estadoInicial);
  // Nas referências, guardo o valor mais recente para usar durante as gravações.
  const estadoAtual = useRef(estadoInicial);
  const operacaoEmAndamento = useRef(false);

  function atualizar(alteracoes) {
    // Copio o estado anterior e substituo somente os campos recebidos.
    const novoEstado = { ...estadoAtual.current, ...alteracoes };
    estadoAtual.current = novoEstado;
    definirEstado(novoEstado);
  }

  // No Controller, organizo as ações e seguro novos toques até terminar a gravação.
  async function executar(acao, mensagemErro) {
    if (operacaoEmAndamento.current) {
      return false;
    }
    // Atualizo a referência antes da tela para bloquear até dois toques muito próximos.
    operacaoEmAndamento.current = true;
    atualizar({ ocupado: true });
    try {
      await acao();
      return true;
    } catch (erro) {
      let detalheErro = 'Tente novamente.';
      if (erro.message) {
        detalheErro = erro.message;
      }
      Alert.alert(mensagemErro, detalheErro);
      return false;
    } finally {
      // Ao chegar aqui, libero os botões tanto no sucesso quanto na falha.
      operacaoEmAndamento.current = false;
      atualizar({ ocupado: false });
    }
  }

  async function restaurarDados() {
    atualizar({ pronto: false, erroInicial: '' });
    const usuario = estadoAtual.current.usuario;
    if (!usuario) {
      atualizar({ pronto: true });
      return;
    }
    try {
      // Busco os dados desta conta antes de mostrar a área de pedidos.
      const carrinho = await armazenamento.carregarCarrinho(usuario.id);
      const ultimoPedido = await armazenamento.carregarUltimoPedido(usuario.id);
      const preferencias = await armazenamento.carregarPreferencias(usuario.id);
      let cliente = null;
      // Se a leitura opcional de nome e telefone falhar, guardo o aviso e continuo com os pedidos.
      let avisoCliente = '';
      try {
        cliente = await clienteSeguro.carregarCliente(usuario.id);
      } catch (erro) {
        avisoCliente = 'Não foi possível restaurar os dados pessoais. ' + erro.message;
      }
      let carrinhoRestaurado = carrinho;
      let pedidoConfirmado = null;
      let limpezaPendente = false;
      if (carrinho && ultimoPedido && carrinho.id === ultimoPedido.carrinhoId) {
        // Reconheço um pedido já salvo e deixo pendente apenas a limpeza do carrinho.
        carrinhoRestaurado = null;
        pedidoConfirmado = ultimoPedido;
        limpezaPendente = true;
      }
      atualizar({
        pronto: true,
        carrinho: carrinhoRestaurado,
        ultimoPedido: ultimoPedido,
        preferencias: preferencias,
        cliente: cliente,
        avisoCliente: avisoCliente,
        pedidoConfirmado: pedidoConfirmado,
        limpezaPendente: limpezaPendente,
      });
    } catch (erro) {
      atualizar({ erroInicial: 'Não foi possível carregar os dados. ' + erro.message });
    }
  }

  async function inicializar() {
    return executar(restaurarDados, 'Não foi possível abrir o iFome');
  }

  async function entrar(email, senha) {
    return executar(async () => {
      const usuario = await autenticacao.autenticarUsuario(email, senha);
      // Depois de conferir o login, retiro da memória os dados da conta anterior.
      atualizar({ ...estadoInicial, usuario: usuario, ocupado: true });
      await restaurarDados();
    }, 'Não foi possível entrar');
  }

  async function cadastrar(email, senha) {
    return executar(async () => {
      await autenticacao.cadastrarUsuario(email, senha);
    }, 'Não foi possível criar a conta');
  }

  async function sair() {
    return executar(async () => {
      // Ao sair, encerro a sessão em memória e preservo o que ficou salvo no aparelho.
      atualizar({ ...estadoInicial, pronto: true, ocupado: true });
    }, 'Não foi possível sair');
  }

  useEffect(() => {
    // Peço a inicialização uma vez, quando o Provider aparece na tela.
    inicializar();
  }, []);

  function podeAlterar() {
    // Libero mudanças só depois do login, da leitura inicial e de qualquer limpeza pendente.
    if (!estadoAtual.current.usuario) {
      return false;
    }
    if (!estadoAtual.current.pronto) {
      return false;
    }
    if (estadoAtual.current.limpezaPendente) {
      return false;
    }

    return true;
  }

  async function atualizarCarrinho(transformar) {
    if (!podeAlterar()) {
      return false;
    }
    return executar(async () => {
      // Recebo a mudança desejada, calculo o novo carrinho e tento salvá-lo.
      const carrinho = transformar(estadoAtual.current.carrinho);
      const usuarioId = estadoAtual.current.usuario.id;
      if (carrinho) {
        await armazenamento.salvarCarrinho(carrinho, usuarioId);
      } else {
        await armazenamento.apagarCarrinho(usuarioId);
      }
      // Só mostro a mudança depois que o armazenamento confirma a gravação.
      atualizar({ carrinho: carrinho, pedidoConfirmado: null });
    }, 'Não foi possível salvar o carrinho');
  }

  async function adicionarAoCarrinho(produtoId, quantidade) {
    return atualizarCarrinho((carrinho) => {
      return adicionarProduto(carrinho, produtoId, quantidade);
    },
    );
  }

  async function mudarQuantidade(produtoId, variacao) {
    return atualizarCarrinho((carrinho) => {
      if (!carrinho) {
        return null;
      }
      const item = carrinho.itens.find((itemAtual) => {
        return itemAtual.id === produtoId;
      });
      if (!item) {
        throw new Error('Este item não está no carrinho.');
      }
      const novaQuantidade = ajustarQuantidade(item.quantidade, variacao);
      // Uso a quantidade ajustada para montar outro carrinho sem editar o item original.
      const carrinhoAtualizado = alterarQuantidade(carrinho, produtoId, novaQuantidade);
      return carrinhoAtualizado;
    });
  }

  async function removerItem(produtoId) {
    return atualizarCarrinho((carrinho) => {
      return removerProduto(carrinho, produtoId);
    });
  }

  async function esvaziarCarrinho() {
    // Devolvo null para que atualizarCarrinho remova também a chave salva no aparelho.
    return atualizarCarrinho(() => {
      return null;
    });
  }

  async function mudarPreferencias(alteracoes) {
    if (!podeAlterar()) {
      return false;
    }
    return executar(async () => {
      const preferencias = { ...estadoAtual.current.preferencias, ...alteracoes };
      // Confiro a categoria e o valor verdadeiro ou falso antes de gravar as preferências.
      if (
        !categorias.includes(preferencias.categoria) ||
        typeof preferencias.mostrarDescricoes !== 'boolean'
      ) {
        throw new Error('Preferência inválida.');
      }
      await armazenamento.salvarPreferencias(preferencias, estadoAtual.current.usuario.id);
      atualizar({ preferencias: preferencias });
    }, 'Não foi possível salvar as preferências');
  }

  async function confirmarPedido() {
    if (!podeAlterar()) {
      return false;
    }
    return executar(async () => {
      // Aguardo o registro para saber se posso esvaziar a tela do carrinho.
      const resultado = await registrarPedido(
        estadoAtual.current.carrinho,
        estadoAtual.current.ultimoPedido,
        armazenamento,
        estadoAtual.current.usuario.id,
      );
      atualizar({
        ultimoPedido: resultado.pedido,
        pedidoConfirmado: resultado.pedido,
        carrinho: null,
        limpezaPendente: resultado.limpezaPendente,
      });
    }, 'Pedido não confirmado. Seu carrinho foi mantido');
  }

  async function concluirLimpeza() {
    return executar(async () => {
      if (!estadoAtual.current.limpezaPendente) {
        return;
      }
      // Repito apenas o apagamento, pois o pedido já foi registrado.
      await armazenamento.apagarCarrinho(estadoAtual.current.usuario.id);
      atualizar({ limpezaPendente: false, carrinho: null });
    }, 'O pedido já está registrado. Não foi possível concluir a limpeza');
  }

  async function salvarDadosCliente(dados) {
    if (!estadoAtual.current.pronto || !estadoAtual.current.usuario) {
      return false;
    }
    return executar(async () => {
      try {
        const cliente = await clienteSeguro.salvarCliente(
          dados,
          estadoAtual.current.usuario.id,
        );
        atualizar({ cliente: cliente, avisoCliente: '' });
      } catch (erro) {
        atualizar({
          avisoCliente: 'Não foi possível salvar os dados pessoais. ' + erro.message,
        });
        throw erro;
      }
    }, 'Não foi possível salvar seus dados');
  }

  async function esquecerCliente() {
    if (!estadoAtual.current.usuario) {
      return false;
    }
    return executar(async () => {
      await clienteSeguro.apagarCliente(estadoAtual.current.usuario.id);
      atualizar({ cliente: null, avisoCliente: '' });
    }, 'Não foi possível apagar seus dados. Tente novamente');
  }

  async function consultarUltimoPedido() {
    // Releio o armazenamento para trazer o pedido que realmente ficou salvo nesta conta.
    if (!estadoAtual.current.pronto || !estadoAtual.current.usuario) {
      return false;
    }
    return executar(async () => {
      const ultimoPedido = await armazenamento.carregarUltimoPedido(
        estadoAtual.current.usuario.id,
      );
      atualizar({ ultimoPedido: ultimoPedido });
    }, 'Não foi possível consultar o último pedido');
  }

  async function limparDados(global = false) {
    if (!estadoAtual.current.usuario) {
      return false;
    }
    return executar(async () => {
      const usuarioId = estadoAtual.current.usuario.id;
      // Reinicio as telas para descartar também os campos que ainda não foram salvos.
      atualizar({ pronto: false, erroInicial: '' });
      let erroLimpeza = '';
      try {
        if (global) {
          await armazenamento.redefinirAsyncStorage();
        } else {
          await armazenamento.limparDadosIfome(usuarioId);
        }
        atualizar({
          carrinho: null,
          preferencias: { ...armazenamento.preferenciasIniciais },
          ultimoPedido: null,
          pedidoConfirmado: null,
          limpezaPendente: false,
        });
      } catch (erro) {
        erroLimpeza =
          'A limpeza do armazenamento local não foi concluída. ' + erro.message;
      }
      // Como os armazenamentos são separados, faço outra tentativa para os dados pessoais.
      try {
        await clienteSeguro.apagarCliente(usuarioId);
        atualizar({ cliente: null, avisoCliente: '' });
      } catch (erro) {
        atualizar({
          avisoCliente:
            'Os dados pessoais não foram apagados. Use “Esquecer meus dados” para tentar novamente. ' +
            erro.message,
        });
      }
      if (erroLimpeza) {
        // Mantenho a tela bloqueada até uma nova leitura quando a limpeza local fica incompleta.
        atualizar({
          pronto: false,
          erroInicial: erroLimpeza + ' Recarregue antes de continuar.',
        });
        throw new Error(erroLimpeza);
      }
      atualizar({ pronto: true, erroInicial: '' });
      let titulo = 'Limpeza concluída';
      let mensagem = 'O carrinho, as preferências e o último pedido foram apagados.';
      if (estadoAtual.current.avisoCliente) {
        titulo = 'Limpeza parcial';
        mensagem += '\n\n' + estadoAtual.current.avisoCliente;
      } else {
        mensagem += '\nOs dados pessoais também foram apagados.';
      }
      Alert.alert(titulo, mensagem);
    }, 'A limpeza não foi concluída');
  }

  let itens = [];
  if (estado.carrinho) {
    itens = estado.carrinho.itens;
  }
  // Preparo os mesmos totais para o carrinho e para a tela de resumo.
  const totais = calcularTotais(itens);
  let resumoUltimoPedido = null;
  // Recalculo os subtotais para que a consulta use o mesmo formato do carrinho.
  if (estado.ultimoPedido) {
    resumoUltimoPedido = {
      ...estado.ultimoPedido,
      ...calcularTotais(estado.ultimoPedido.itens),
    };
  }
  let resumoConfirmado = null;
  if (estado.pedidoConfirmado) {
    resumoConfirmado = {
      ...estado.pedidoConfirmado,
      ...calcularTotais(estado.pedidoConfirmado.itens),
    };
  }

  const produtosVisiveis = filtrarProdutos(estado.preferencias.categoria);
  let bloqueado = false;
  if (estado.ocupado || estado.limpezaPendente || !estado.pronto || !estado.usuario) {
    bloqueado = true;
  }

  // Entrego os dados e as ações ao Context, que os compartilha com as telas.
  return {
    ...estado,
    ...totais,
    resumoUltimoPedido: resumoUltimoPedido,
    resumoConfirmado: resumoConfirmado,
    produtosVisiveis: produtosVisiveis,
    bloqueado: bloqueado,
    ajustarSelecao: ajustarQuantidade,
    entrar: entrar,
    cadastrar: cadastrar,
    sair: sair,
    inicializar: inicializar,
    adicionarAoCarrinho: adicionarAoCarrinho,
    mudarQuantidade: mudarQuantidade,
    removerItem: removerItem,
    esvaziarCarrinho: esvaziarCarrinho,
    mudarPreferencias: mudarPreferencias,
    confirmarPedido: confirmarPedido,
    concluirLimpeza: concluirLimpeza,
    salvarDadosCliente: salvarDadosCliente,
    esquecerCliente: esquecerCliente,
    consultarUltimoPedido: consultarUltimoPedido,
    limparDados: limparDados,
  };
}
