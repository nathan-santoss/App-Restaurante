import { StyleSheet } from 'react-native';
import { cores } from './cores.js';

// Defino aqui a aparência dos componentes que reaproveito em várias telas.
export const estilos = StyleSheet.create({
  botao: {
    // Deixo espaço interno e uma altura mínima para facilitar o toque.
    minHeight: 50,
    borderRadius: 14,
    backgroundColor: cores.principal,
    paddingHorizontal: 18,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoSecundario: {
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  botaoDiscreto: { backgroundColor: cores.suave },
  botaoDesabilitado: { opacity: 0.45 },
  botaoPressionado: { opacity: 0.75 },
  textoBotao: {
    color: cores.superficie,
    fontWeight: '700',
    fontSize: 15,
    textAlign: 'center',
  },
  textoBotaoSecundario: { color: cores.principal },
  grupoQuantidade: {
    // Alinho os sinais e a quantidade na mesma linha com flexDirection.
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: cores.fundo,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: cores.borda,
  },
  botaoQuantidade: {
    width: 46,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sinalQuantidade: { fontSize: 23, color: cores.principal, fontWeight: '500' },
  quantidade: {
    minWidth: 30,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: cores.texto,
  },
  produto: {
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 20,
    padding: 18,
    gap: 12,
  },
  linhaProduto: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  seloProduto: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: cores.suave,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numeroProduto: { color: cores.principal, fontSize: 18, fontWeight: '700' },
  flexivel: { flex: 1 },
  categoriaProduto: {
    color: cores.secundario,
    fontSize: 10,
    letterSpacing: 1.5,
    fontWeight: '700',
    marginBottom: 4,
  },
  nomeProduto: { color: cores.texto, fontWeight: '700', fontSize: 18, lineHeight: 23 },
  descricaoProduto: { color: cores.secundario, fontSize: 14, lineHeight: 21 },
  preco: { color: cores.principal, fontWeight: '700', fontSize: 18 },
  acoesProduto: {
    // Permito quebrar a linha quando os controles não cabem lado a lado.
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sucesso: { color: cores.sucesso, fontSize: 13 },
  itemPedido: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: cores.borda,
    gap: 10,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  nomeItem: { color: cores.texto, fontSize: 16, fontWeight: '600', flex: 1 },
  detalhe: { fontSize: 14, color: cores.secundario, lineHeight: 21 },
  subtotal: { color: cores.texto, fontSize: 16, fontWeight: '700' },
  total: { borderRadius: 16, backgroundColor: cores.suave, padding: 18, gap: 8 },
  rotuloTotal: { fontSize: 16, color: cores.texto, fontWeight: '600' },
  valorTotal: { color: cores.principal, fontSize: 28, fontWeight: '800' },
  vazio: { alignItems: 'center', paddingHorizontal: 24, paddingVertical: 42, gap: 14 },
  marcaVazio: { color: cores.principal, fontWeight: '800', fontSize: 40 },
  tituloVazio: {
    color: cores.texto,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  textoVazio: {
    color: cores.secundario,
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
  },
  limpeza: { gap: 12 },
});

export function estiloBotao(variante, desabilitado, pressionado) {
  // Parto do botão principal e acrescento os estilos de acordo com seu estado.
  const resultado = [estilos.botao];
  if (variante === 'secundario') {
    resultado.push(estilos.botaoSecundario);
  }
  if (variante === 'discreto') {
    resultado.push(estilos.botaoDiscreto);
  }
  if (desabilitado) {
    resultado.push(estilos.botaoDesabilitado);
  }
  if (pressionado) {
    // Acrescento uma mudança visual enquanto a pessoa mantém o botão pressionado.
    resultado.push(estilos.botaoPressionado);
  }
  return resultado;
}

export function estiloTextoBotao(variante) {
  // Ajusto a cor da legenda para ela continuar legível nos botões claros.
  if (variante === 'secundario' || variante === 'discreto') {
    return [estilos.textoBotao, estilos.textoBotaoSecundario];
  }
  return estilos.textoBotao;
}

export function estiloQuantidade(desabilitado) {
  if (desabilitado) {
    return [estilos.botaoQuantidade, estilos.botaoDesabilitado];
  }
  return estilos.botaoQuantidade;
}
