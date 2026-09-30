import { Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { estilos } from '../../styles/telas.js';
import { cores } from '../../styles/cores.js';
import { formatarData } from '../../utils/formatacao.js';

export default function LocalEntrega({ entrega }) {
  if (!entrega) {
    // Reconheço os pedidos antigos, que foram registrados antes da inclusão do GPS.
    return <Text style={estilos.texto}>Este pedido não possui localização registrada.</Text>;
  }

  // Informo a estimativa em metros quando o aparelho consegue fornecer a precisão.
  let textoPrecisao = 'Precisão não informada pelo aparelho.';
  if (entrega.precisaoMetros !== null) {
    textoPrecisao = 'Precisão estimada: ' + Math.ceil(entrega.precisaoMetros) + ' m.';
  }

  function mostrarAvisoPrecisao() {
    // Recomendo outra captura quando a margem de erro ultrapassa cem metros.
    if (entrega.precisaoMetros > 100) {
      return (
        <Text style={estilos.textoAviso}>
          A localização está aproximada. Ative a localização precisa e tente capturar em um local aberto.
        </Text>
      );
    }
    return null;
  }

  function mostrarComplemento() {
    // Incluo a referência somente se a pessoa preencheu esse campo opcional.
    if (Boolean(entrega.complemento)) {
      return <Text style={estilos.texto}>Complemento: {entrega.complemento}</Text>;
    }
    return null;
  }

  const coordenada = { latitude: entrega.latitude, longitude: entrega.longitude };
  return (
    <View style={estilos.campo}>
      <Text style={estilos.textoForte}>Ponto de entrega</Text>
      {/* Centralizo o mapa no ponto capturado e preservo as coordenadas ao consultar o pedido. */}
      <View style={estilos.molduraMapa}>
        <MapView
          style={estilos.mapa}
          region={{ ...coordenada, latitudeDelta: 0.006, longitudeDelta: 0.006 }}
          scrollEnabled={false}
          zoomEnabled={false}
          rotateEnabled={false}
          pitchEnabled={false}
          toolbarEnabled={false}
          accessibilityLabel="Mapa do ponto de entrega capturado pelo GPS"
        >
          {/* Marco o destino do pedido com uma descrição que aparece ao tocar no pino. */}
          <Marker
            coordinate={coordenada}
            title="Entrega do pedido"
            description={entrega.complemento || 'Localização capturada no celular'}
            pinColor={cores.principal}
          />
        </MapView>
      </View>
      {/* Apresento os números também em texto para permitir a consulta sem os blocos do mapa. */}
      <Text selectable style={estilos.texto}>
        Latitude: {entrega.latitude.toFixed(6)}{'\n'}
        Longitude: {entrega.longitude.toFixed(6)}
      </Text>
      <Text style={estilos.etiqueta}>{textoPrecisao}</Text>
      <Text style={estilos.etiqueta}>Capturada em {formatarData(entrega.capturadaEm)}</Text>
      {mostrarAvisoPrecisao()}
      {mostrarComplemento()}
    </View>
  );
}
