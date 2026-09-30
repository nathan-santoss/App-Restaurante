import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Alert, Linking } from 'react-native';
import * as Location from 'expo-location';
import { obterLocalizacaoAtual } from '../services/localizacao.js';

export function useEntregaController(carrinhoId) {
  const [ponto, definirPonto] = useState(null);
  const [complemento, definirComplemento] = useState('');
  const [buscando, definirBuscando] = useState(false);
  const [erro, definirErro] = useState('');
  const [precisaAjustes, definirPrecisaAjustes] = useState(false);
  const tentativaAtual = useRef(0);
  const emAndamento = useRef(false);

  useFocusEffect(useCallback(() => {
    // Inicio a revisão com uma captura própria para este carrinho e esta visita.
    definirPonto(null);
    definirComplemento('');
    definirErro('');
    definirPrecisaAjustes(false);
    definirBuscando(false);
    emAndamento.current = false;
    return () => {
      // Invalido respostas atrasadas ao sair da tela ou trocar o carrinho.
      tentativaAtual.current += 1;
      emAndamento.current = false;
    };
  }, [carrinhoId]));

  async function capturar() {
    if (!carrinhoId || emAndamento.current) {
      return;
    }
    // Bloqueio toques repetidos imediatamente, antes da próxima atualização visual.
    emAndamento.current = true;
    const tentativa = ++tentativaAtual.current;
    definirBuscando(true);
    definirPonto(null);
    definirErro('');
    definirPrecisaAjustes(false);
    try {
      const local = await obterLocalizacaoAtual(Location);
      if (tentativa === tentativaAtual.current) {
        definirPonto({ ...local, carrinhoId });
      }
    } catch (falha) {
      // Traduzo a falha em uma orientação e mantenho a confirmação indisponível.
      if (tentativa === tentativaAtual.current) {
        definirErro(falha.message || 'Não foi possível obter a localização. Tente novamente.');
        definirPrecisaAjustes(Boolean(falha.abrirAjustes));
      }
    } finally {
      if (tentativa === tentativaAtual.current) {
        emAndamento.current = false;
        definirBuscando(false);
      }
    }
  }

  async function abrirAjustes() {
    try {
      // Encaminho a pessoa às permissões do aplicativo quando o sistema não pergunta mais.
      await Linking.openSettings();
    } catch {
      Alert.alert('Abra os ajustes do celular', 'Procure o Expo Go e permita o acesso à localização.');
    }
  }

  // Associo o ponto ao carrinho para impedir que uma nova compra herde a entrega anterior.
  let entrega = null;
  if (ponto) {
    if (ponto.carrinhoId === carrinhoId) {
      entrega = { ...ponto, complemento };
    }
  }

  return {
    entrega, complemento, definirComplemento, buscando, erro,
    precisaAjustes, capturar, abrirAjustes,
  };
}
