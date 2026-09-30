import { ActivityIndicator, Alert, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePreventRemove } from '@react-navigation/native';
import { useApp } from '../../contexts/AppContext.jsx';
import { estilos } from '../../styles/telas.js';
import { cores } from '../../styles/cores.js';
import Botao from './Botao.jsx';

export default function Tela({
  children,
  titulo,
  subtitulo,
  navigation,
  inicio = false,
}) {
  const { ocupado, limpezaPendente, concluirLimpeza } = useApp();
  // Seguro a navegação para trás enquanto ainda estou salvando alguma mudança.
  usePreventRemove(ocupado, () => {
    return Alert.alert('Aguarde um instante', 'Estamos terminando de salvar os dados.');
  },
  );
  function voltar() {
    navigation.goBack();
  }

  function abrirAjustes() {
    navigation.navigate('Ajustes');
  }

  function mostrarMarca() {
    // Escolho com if o conteúdo do cabeçalho conforme a tela que está aberta.
    if (inicio) {
      return (
        <View style={estilos.flexivel}>
          <Text style={estilos.marca}>iFome</Text>
          <Text style={estilos.assinatura}>FEITO PRA VOCÊ</Text>
        </View>
      );
    }

    return null;
  }

  function mostrarBotaoVoltar() {
    // Ofereço o retorno nas telas internas, pois no cardápio já estou no começo da navegação.
    if (inicio === false) {
      return (
        <Botao
          titulo="‹ Voltar"
          variante="discreto"
          aoPressionar={voltar}
          desabilitado={ocupado}
        />
      );
    }

    return null;
  }

  function mostrarBotaoAjustes() {
    // Deixo o acesso aos Ajustes no cabeçalho do cardápio.
    if (inicio) {
      return (
        <Botao
          titulo="Ajustes"
          variante="secundario"
          aoPressionar={abrirAjustes}
          desabilitado={ocupado}
        />
      );
    }

    return null;
  }

  function mostrarTitulo() {
    // Nas telas internas, apresento o título recebido no lugar da marca do início.
    if (inicio === false) {
      return (
        <Text accessibilityRole="header" style={estilos.titulo}>
          {titulo}
        </Text>
      );
    }

    return null;
  }

  function mostrarSubtitulo() {
    // Com Boolean, reconheço um texto vazio e evito montar uma legenda sem conteúdo.
    if (Boolean(subtitulo)) {
      return (
        <Text style={estilos.subtitulo}>{subtitulo}</Text>
      );
    }

    return null;
  }

  function mostrarLimpezaPendente() {
    // Mantenho este aviso até conseguir apagar o carrinho que pertence ao pedido já confirmado.
    if (limpezaPendente) {
      return (
        <View style={estilos.avisoGlobal}>
          <Text style={estilos.textoAviso}>
            Seu pedido já foi registrado. Conclua a limpeza do carrinho para começar
            outro, sem duplicar o pedido.
          </Text>
          <Botao
            titulo="Concluir limpeza do carrinho"
            aoPressionar={concluirLimpeza}
            desabilitado={ocupado}
          />
        </View>
      );
    }

    return null;
  }

  function mostrarBloqueio() {
    // Enquanto ocupado for verdadeiro, cubro a tela com o indicador de gravação.
    if (ocupado) {
      return (
        <View style={estilos.bloqueio} accessibilityViewIsModal>
          {/* Uso ActivityIndicator como a animação de espera enquanto a operação está em andamento. */}
          <ActivityIndicator size="large" color={cores.principal} />
          <Text accessibilityLiveRegion="polite" style={estilos.textoForte}>
            Salvando no aparelho…
          </Text>
        </View>
      );
    }

    return null;
  }

  // Com a área segura, mantenho o conteúdo longe do recorte e da barra do iPhone.
  return (
    <SafeAreaView style={estilos.segura}>
      {/* Reaproveito este cabeçalho nas telas; as funções abaixo escolhem seus textos e botões. */}
      <View style={estilos.cabecalho}>
        <View style={estilos.navegacaoTopo}>
          {mostrarMarca()}
          {mostrarBotaoVoltar()}
          {mostrarBotaoAjustes()}
        </View>
        {mostrarTitulo()}
        {mostrarSubtitulo()}
      </View>
      {/* Ofereço outra tentativa quando o pedido foi salvo, mas o carrinho ainda precisa ser apagado. */}
      {mostrarLimpezaPendente()}
      {/* Coloco neste espaço o conteúdo que recebi da tela atual. */}
      {/* Recebo em children tudo que foi escrito entre a abertura e o fechamento de Tela. */}
      <View style={estilos.corpo}>{children}</View>
      {/* Sobreponho a espera ao conteúdo para evitar toques durante uma gravação. */}
      {mostrarBloqueio()}
    </SafeAreaView>
  );
}
