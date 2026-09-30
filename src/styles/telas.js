import { StyleSheet } from 'react-native';
import { cores } from './cores.js';

// Organizo os espaços, os textos e os fundos que uso nas telas do aplicativo.
export const estilos = StyleSheet.create({
  segura: { flex: 1, backgroundColor: cores.fundo },
  // Com flex: 1, ocupo o espaço que sobra depois do cabeçalho e do rodapé.
  corpo: { flex: 1 },
  cabecalho: {
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: cores.borda,
    gap: 10,
  },
  navegacaoTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  marca: { color: cores.principal, fontSize: 32, fontWeight: '900', letterSpacing: -1.6 },
  assinatura: {
    fontSize: 10,
    letterSpacing: 1.6,
    color: cores.secundario,
    fontWeight: '700',
  },
  titulo: { color: cores.texto, fontWeight: '800', fontSize: 28, letterSpacing: -0.6 },
  subtitulo: { fontSize: 14, color: cores.secundario, lineHeight: 21 },
  conteudo: { padding: 22, gap: 18, paddingBottom: 28 },
  lista: { paddingHorizontal: 22, paddingTop: 6, paddingBottom: 24, gap: 14 },
  introducao: { paddingVertical: 18, gap: 16 },
  destaque: { borderRadius: 20, backgroundColor: cores.principal, padding: 21, gap: 8 },
  destaqueEtiqueta: {
    color: '#FFE4DD',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
  },
  destaqueTitulo: {
    color: cores.superficie,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 29,
  },
  destaqueTexto: { color: '#FFE4DD', fontSize: 14, lineHeight: 21 },
  filtros: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  // Arredondo os filtros e mantenho uma área de toque maior que o texto.
  filtro: {
    paddingHorizontal: 20,
    paddingVertical: 13,
    minHeight: 46,
    borderRadius: 24,
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
    justifyContent: 'center',
  },
  filtroAtivo: { backgroundColor: cores.principal, borderColor: cores.principal },
  textoFiltro: { color: cores.secundario, fontSize: 14, fontWeight: '600' },
  textoFiltroAtivo: { color: cores.superficie },
  secaoLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  tituloSecao: { fontSize: 20, fontWeight: '700', color: cores.texto },
  etiqueta: { fontSize: 12, color: cores.secundario },
  rodape: {
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 12,
    backgroundColor: cores.superficie,
    borderTopWidth: 1,
    borderTopColor: cores.borda,
    gap: 12,
  },
  cartao: {
    backgroundColor: cores.superficie,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: cores.borda,
    gap: 14,
  },
  texto: { color: cores.secundario, fontSize: 15, lineHeight: 23 },
  textoForte: { color: cores.texto, fontWeight: '600', fontSize: 16, lineHeight: 23 },
  rotulo: { color: cores.texto, fontSize: 14, fontWeight: '600' },
  entrada: {
    // Reaproveito estas medidas nos campos de login, cadastro e dados pessoais.
    color: cores.texto,
    backgroundColor: cores.fundo,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 12,
    minHeight: 52,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  campo: { gap: 8 },
  opcao: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  aviso: { backgroundColor: cores.aviso, borderRadius: 14, padding: 16, gap: 12 },
  avisoGlobal: {
    marginHorizontal: 22,
    marginTop: 12,
    backgroundColor: cores.aviso,
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },
  textoAviso: { color: cores.textoAviso, lineHeight: 21, fontSize: 14 },
  confirmado: {
    backgroundColor: cores.sucessoSuave,
    borderRadius: 20,
    padding: 24,
    gap: 12,
  },
  tituloConfirmado: { color: cores.sucesso, fontSize: 26, fontWeight: '800' },
  identificador: { fontSize: 12, color: cores.secundario },
  centralizado: { flexGrow: 1, padding: 24, justifyContent: 'center', gap: 20 },
  // Cubro a tela durante a gravação para impedir novos toques nos botões.
  bloqueio: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
    backgroundColor: '#FAF8F5D9',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  flexivel: { flex: 1 },
});

// Prefiro o cabeçalho que montei e desativo o gesto de voltar neste projeto.
export const opcoesNavegacao = {
  headerShown: false,
  gestureEnabled: false,
  contentStyle: estilos.segura,
};

export function estiloFiltro(ativo) {
  // Destaco a categoria selecionada com o fundo vermelho.
  if (ativo) {
    return [estilos.filtro, estilos.filtroAtivo];
  }
  return estilos.filtro;
}

export function estiloTextoFiltro(ativo) {
  // Troco também a cor do texto para acompanhar o fundo da categoria selecionada.
  if (ativo) {
    return [estilos.textoFiltro, estilos.textoFiltroAtivo];
  }
  return estilos.textoFiltro;
}
