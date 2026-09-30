import { ActivityIndicator, Text, TextInput, View } from 'react-native';
import { estilos } from '../../styles/telas.js';
import { cores } from '../../styles/cores.js';
import Botao from './Botao.jsx';
import LocalEntrega from './LocalEntrega.jsx';

export default function EntregaPedido({ localizacao, bloqueado }) {
  const {
    entrega, complemento, definirComplemento, buscando, erro,
    precisaAjustes, capturar, abrirAjustes,
  } = localizacao;

  // Ajusto a legenda quando já tenho um ponto e posso oferecer uma nova captura.
  let tituloLocalizacao = 'Usar minha localização atual';
  if (entrega) {
    tituloLocalizacao = 'Atualizar minha localização';
  }

  // Desabilito a digitação durante a captura ou enquanto o pedido está sendo salvo.
  let podeEditar = true;
  if (bloqueado || buscando) {
    podeEditar = false;
  }

  function mostrarBusca() {
    // Indico a espera somente enquanto consulto a posição do aparelho.
    if (buscando) {
      return (
        <View style={estilos.campo}>
          <ActivityIndicator color={cores.principal} />
          <Text accessibilityLiveRegion="polite" style={estilos.texto}>
            Buscando sua localização…
          </Text>
        </View>
      );
    }
    return null;
  }

  function mostrarErro() {
    // Exibo a mensagem da tentativa quando encontro uma dificuldade na captura.
    if (Boolean(erro)) {
      return (
        <Text accessibilityLiveRegion="polite" style={estilos.textoAviso}>{erro}</Text>
      );
    }
    return null;
  }

  function mostrarAjustes() {
    // Ofereço o atalho quando preciso que a permissão seja liberada no celular.
    if (precisaAjustes) {
      return (
        <Botao titulo="Abrir ajustes do celular" aoPressionar={abrirAjustes} variante="discreto" />
      );
    }
    return null;
  }

  function mostrarLocal() {
    // Apresento o mapa depois que recebo uma localização para este pedido.
    if (entrega) {
      return <LocalEntrega entrega={entrega} />;
    }
    return null;
  }

  return (
    <View style={estilos.cartao}>
      <Text style={estilos.tituloSecao}>Onde receber?</Text>
      <Text style={estilos.texto}>
        Use o GPS no local onde deseja receber o pedido. Confira o ponto no mapa antes de confirmar.
      </Text>
      {/* Peço a localização somente após este toque, quando fica claro para que vou usá-la. */}
      <Botao
        titulo={tituloLocalizacao}
        aoPressionar={capturar}
        desabilitado={bloqueado || buscando}
        variante="secundario"
      />
      {mostrarBusca()}
      {/* Mantenho a orientação perto do botão para facilitar uma nova tentativa. */}
      {mostrarErro()}
      {mostrarAjustes()}
      {mostrarLocal()}
      <View style={estilos.campo}>
        <Text style={estilos.rotulo}>Complemento ou referência (opcional)</Text>
        {/* Acrescento uma referência digitada porque o GPS não identifica apartamento ou portaria. */}
        <TextInput
          accessibilityLabel="Complemento ou referência da entrega"
          value={complemento}
          onChangeText={definirComplemento}
          editable={podeEditar}
          maxLength={200}
          placeholder="Ex.: apartamento 12, portaria azul"
          placeholderTextColor={cores.secundario}
          style={estilos.entrada}
          returnKeyType="done"
        />
      </View>
      <Text style={estilos.etiqueta}>
        A localização e o complemento serão salvos neste aparelho junto ao pedido.
      </Text>
    </View>
  );
}
