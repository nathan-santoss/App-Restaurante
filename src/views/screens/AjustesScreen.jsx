import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useApp } from '../../contexts/AppContext.jsx';
import { estilos } from '../../styles/telas.js';
import { cores, coresInterruptor } from '../../styles/cores.js';
import { formatarData } from '../../utils/formatacao.js';
import AcoesLimpeza from '../components/AcoesLimpeza.jsx';
import Botao from '../components/Botao.jsx';
import ItensPedido from '../components/ItensPedido.jsx';
import Tela from '../components/Tela.jsx';
import TotalPedido from '../components/TotalPedido.jsx';

export default function AjustesScreen({ navigation }) {
  const {
    usuario,
    sair,
    cliente,
    avisoCliente,
    preferencias,
    mudarPreferencias,
    salvarDadosCliente,
    esquecerCliente,
    consultarUltimoPedido,
    resumoUltimoPedido,
    bloqueado,
    ocupado,
  } = useApp();
  // Guardo a digitação no formulário até a pessoa escolher salvar os dados.
  const [nome, definirNome] = useState('');
  const [telefone, definirTelefone] = useState('');
  const [mostrarPedido, definirMostrarPedido] = useState(false);
  const [mensagem, definirMensagem] = useState('');
  const campoTelefone = useRef(null);

  let emailDaConta = '';
  let contaAdministradora = false;
  if (usuario) {
    emailDaConta = usuario.email;
    contaAdministradora = usuario.administrador;
  }

  useEffect(() => {
    // Quando os dados da conta mudam, atualizo também os campos do formulário.
    if (cliente) {
      definirNome(cliente.nome);
      definirTelefone(cliente.telefone);
    } else {
      definirNome('');
      definirTelefone('');
    }
  }, [cliente]);

  async function salvar() {
    // Fecho o teclado e espero a gravação antes de mostrar a mensagem de sucesso.
    Keyboard.dismiss();
    const sucesso = await salvarDadosCliente({ nome: nome, telefone: telefone });
    if (sucesso) {
      definirMensagem('Seus dados foram salvos no aparelho.');
    }
  }

  function confirmarEsquecimento() {
    // Peço confirmação para evitar que um toque sem querer apague nome e telefone.
    Alert.alert(
      'Esquecer meus dados?',
      'Seu nome e telefone serão apagados do armazenamento seguro.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Esquecer',
          style: 'destructive',
          onPress: async () => {
            const sucesso = await esquecerCliente();
            if (sucesso) {
              definirNome('');
              definirTelefone('');
              definirMensagem('Seus dados foram apagados.');
            }
          },
        },
      ],
    );
  }

  async function consultarPedido() {
    // Aguardo a leitura antes de abrir a consulta, inclusive quando ainda não há pedido salvo.
    const sucesso = await consultarUltimoPedido();
    if (sucesso) {
      definirMostrarPedido(true);
    }
  }

  function confirmarSaida() {
    Alert.alert('Sair da conta?', 'Seus dados ficarão salvos para o próximo acesso.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', onPress: sair },
    ]);
  }

  function focarTelefone() {
    if (campoTelefone.current) {
      campoTelefone.current.focus();
    }
  }

  function alterarDescricoes(mostrarDescricoes) {
    return mudarPreferencias({ mostrarDescricoes: mostrarDescricoes });
  }

  function fecharConsulta() {
    // Escondo os detalhes na tela sem apagar o pedido que ficou no aparelho.
    definirMostrarPedido(false);
  }

  function mostrarIdentificacaoAdmin() {
    // Acrescento esta identificação visual quando a conta conectada é a de demonstração.
    if (contaAdministradora) {
      return (
        <Text style={estilos.etiqueta}>Administrador</Text>
      );
    }

    return null;
  }

  function mostrarAvisoCliente() {
    // Mostro aqui a dificuldade ao salvar ou recuperar os dados pessoais desta conta.
    if (Boolean(avisoCliente)) {
      return (
        <View style={estilos.aviso}>
          <Text style={estilos.textoAviso}>{avisoCliente}</Text>
        </View>
      );
    }

    return null;
  }

  function mostrarMensagem() {
    // Deixo a confirmação visível quando uma ação do formulário preenche a mensagem.
    if (Boolean(mensagem)) {
      return (
        <Text accessibilityLiveRegion="polite" style={estilos.texto}>
          {mensagem}
        </Text>
      );
    }

    return null;
  }

  function mostrarConsultaVazia() {
    // Primeiro confiro se a consulta foi aberta; depois verifico se há um pedido salvo.
    if (mostrarPedido) {
      if (Boolean(resumoUltimoPedido) === false) {
        return (
          <Text style={estilos.texto}>Você ainda não tem um pedido salvo.</Text>
        );
      }
    }

    return null;
  }

  function mostrarPedidoConsultado() {
    // Exijo a consulta aberta e um pedido disponível antes de acessar seus itens e valores.
    if (mostrarPedido) {
      if (resumoUltimoPedido) {
        return (
          <>
            <Text selectable style={estilos.identificador}>
              {resumoUltimoPedido.id}
            </Text>
            <Text style={estilos.texto}>{formatarData(resumoUltimoPedido.data)}</Text>
            <ItensPedido itens={resumoUltimoPedido.itens} />
            <TotalPedido
              totalCentavos={resumoUltimoPedido.totalCentavos}
              totalUnidades={resumoUltimoPedido.totalUnidades}
            />
            <Text style={estilos.etiqueta}>
              Registrado localmente. Não enviado a um restaurante.
            </Text>
            <Botao
              titulo="Fechar consulta"
              variante="discreto"
              aoPressionar={fecharConsulta}
            />
          </>
        );
      }
    }

    // Devolvo null quando não há detalhes para apresentar, sem criar um cartão vazio.
    return null;
  }

  return (
    <Tela
      navigation={navigation}
      titulo="Do seu jeito"
      subtitulo="Seus dados e suas preferências, por aqui."
    >
      {/* Ajusto o espaço com KeyboardAvoidingView para acomodar o teclado durante a digitação. */}
      <KeyboardAvoidingView style={estilos.corpo} behavior="padding">
        <ScrollView
          contentContainerStyle={estilos.conteudo}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <View style={estilos.cartao}>
            <Text style={estilos.tituloSecao}>Sua conta</Text>
            <Text style={estilos.textoForte}>{emailDaConta}</Text>
            {mostrarIdentificacaoAdmin()}
            <Botao
              titulo="Sair da conta"
              aoPressionar={confirmarSaida}
              variante="secundario"
              desabilitado={ocupado}
            />
          </View>
          <View style={estilos.cartao}>
            <Text style={estilos.tituloSecao}>Seus dados</Text>
            <Text style={estilos.texto}>
              Nome e telefone são opcionais. Você pode fazer pedidos sem preencher.
            </Text>
            {mostrarAvisoCliente()}
            <View style={estilos.campo}>
              <Text style={estilos.rotulo}>Nome (opcional)</Text>
              {/* Ligo value ao nome atual e onChangeText à função que guarda cada alteração digitada. */}
              <TextInput
                accessibilityLabel="Nome (opcional)"
                style={estilos.entrada}
                value={nome}
                onChangeText={definirNome}
                placeholder="Como podemos chamar você?"
                placeholderTextColor={cores.secundario}
                maxLength={80}
                autoCapitalize="words"
                autoComplete="name"
                textContentType="name"
                returnKeyType="next"
                onSubmitEditing={focarTelefone}
                editable={ocupado === false}
              />
            </View>
            <View style={estilos.campo}>
              <Text style={estilos.rotulo}>Telefone (opcional)</Text>
              <TextInput
                ref={campoTelefone}
                accessibilityLabel="Telefone (opcional)"
                style={estilos.entrada}
                value={telefone}
                onChangeText={definirTelefone}
                placeholder="(11) 99999-9999"
                placeholderTextColor={cores.secundario}
                maxLength={25}
                keyboardType="phone-pad"
                autoComplete="tel"
                textContentType="telephoneNumber"
                editable={ocupado === false}
              />
            </View>
            <Botao
              titulo="Salvar meus dados"
              aoPressionar={salvar}
              desabilitado={ocupado}
            />
            <Botao
              titulo="Esquecer meus dados"
              variante="secundario"
              aoPressionar={confirmarEsquecimento}
              desabilitado={ocupado}
            />
            {mostrarMensagem()}
          </View>
          <View style={estilos.cartao}>
            <Text style={estilos.tituloSecao}>Cardápio</Text>
            <View style={estilos.opcao}>
              <View style={estilos.flexivel}>
                <Text style={estilos.textoForte}>Mostrar descrições</Text>
                <Text style={estilos.texto}>Veja os ingredientes de cada opção.</Text>
              </View>
              {/* Uso Switch como um interruptor: value indica a escolha atual e onValueChange recebe a nova. */}
              <Switch
                accessibilityLabel="Mostrar descrições dos produtos"
                value={preferencias.mostrarDescricoes}
                onValueChange={alterarDescricoes}
                disabled={bloqueado}
                trackColor={coresInterruptor}
                thumbColor={cores.superficie}
              />
            </View>
          </View>
          <View style={estilos.cartao}>
            <Text style={estilos.tituloSecao}>Último pedido</Text>
            <Text style={estilos.texto}>
              Só o pedido mais recente fica salvo neste aparelho.
            </Text>
            <Botao
              titulo="Consultar último pedido"
              variante="secundario"
              aoPressionar={consultarPedido}
              desabilitado={ocupado}
            />
            {mostrarConsultaVazia()}
            {/* Abro os detalhes somente depois que consigo consultar o pedido salvo. */}
            {mostrarPedidoConsultado()}
          </View>
          <View style={estilos.cartao}>
            <Text style={estilos.tituloSecao}>Limpar dados</Text>
            <Text style={estilos.texto}>
              As ações abaixo pedem confirmação antes de apagar.
            </Text>
            {/* Incluo meu componente AcoesLimpeza para reunir os botões e suas janelas de confirmação. */}
            <AcoesLimpeza />
          </View>
          <Text style={estilos.etiqueta}>
            iFome · Projeto acadêmico · Feito para aprender
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </Tela>
  );
}
