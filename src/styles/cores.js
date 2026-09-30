// Reúno as cores neste lugar para conseguir mudar o visual sem procurar em cada tela.
export const cores = {
  principal: '#B42332',
  principalEscura: '#871C28',
  suave: '#FBECEF',
  // Diferencio o fundo da página dos cartões brancos para separar os conteúdos.
  fundo: '#FAF8F5',
  superficie: '#FFFFFF',
  texto: '#292321',
  secundario: '#706562',
  borda: '#E9E1DC',
  // Reservo verde para sucesso e tons amarelados para os avisos das telas.
  sucesso: '#246348',
  sucessoSuave: '#EAF4EE',
  aviso: '#FFF4DF',
  textoAviso: '#765016',
};

// Distingo o interruptor desligado do ligado usando estas duas cores.
export const coresInterruptor = { false: cores.borda, true: cores.principal };
