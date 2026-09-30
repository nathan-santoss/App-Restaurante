import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../contexts/AppContext.jsx';
import { cores } from '../../styles/cores.js';
import { estilos } from '../../styles/telas.js';
import Botao from '../components/Botao.jsx';

export default function AutenticacaoScreen({ navigation, route }) {
  const { entrar, cadastrar, ocupado } = useApp();
  let emailRecebido = '';
  if (route.params) {
    // Confiro primeiro se recebi parâmetros para só então procurar o e-mail.
    if (route.params.email) {
      emailRecebido = route.params.email;
    }
  }

  // Preencho o e-mail recebido do cadastro, mas começo sempre com a senha vazia.
  const [email, definirEmail] = useState(emailRecebido);
  const [senha, definirSenha] = useState('');
  const campoSenha = useRef(null);
  // Identifico a tela pela rota para reaproveitar os mesmos campos no login e no cadastro.
  const cadastro = route.name === 'Cadastro';

  useEffect(() => {
    // No Android, bloqueio o botão de voltar enquanto aguardo a resposta do cadastro.
    const evento = BackHandler.addEventListener('hardwareBackPress', () => {
      return ocupado;
    });
    return () => {
      // Retiro o evento anterior ao refazer este efeito ou sair da tela.
      evento.remove();
    };
  }, [ocupado]);

  useEffect(() => {
    if (emailRecebido) {
      definirEmail(emailRecebido);
    }
  }, [emailRecebido]);

  useEffect(() => {
    // Ao trocar de tela, retiro a senha digitada deste formulário.
    return navigation.addListener('blur', () => {
      definirSenha('');
    });
  }, [navigation]);

  let titulo = 'Que bom ter você aqui';
  let descricao = 'Entre para escolher seu próximo pedido.';
  let tituloBotao = 'Entrar';
  let tituloAlternativo = 'Criar uma conta';
  let textoAguarde = 'Entrando…';
  let preenchimentoSenha = 'current-password';
  let tipoSenha = 'password';

  // Reaproveito o formulário e escolho os textos de acordo com a tela aberta.
  if (cadastro) {
    titulo = 'Crie sua conta';
    descricao = 'Você só precisa de um e-mail e uma senha.';
    tituloBotao = 'Cadastrar';
    tituloAlternativo = 'Já tenho uma conta';
    textoAguarde = 'Criando sua conta…';
    preenchimentoSenha = 'new-password';
    tipoSenha = 'newPassword';
  }

  async function enviar() {
    if (ocupado) {
      // Encerro esta tentativa para não enviar os mesmos campos durante outra operação.
      return;
    }
    Keyboard.dismiss();

    if (cadastro) {
      const sucesso = await cadastrar(email, senha);
      if (sucesso) {
        // Volto ao login com o e-mail preenchido e peço a senha novamente.
        definirSenha('');
        const emailSemEspacos = email.trim();
        const emailDoCadastro = emailSemEspacos.toLowerCase();
        navigation.navigate('Login', { email: emailDoCadastro });
        Alert.alert('Conta criada', 'Agora entre com seu e-mail e sua senha.');
      }
      // Paro depois do cadastro para não executar também o login neste mesmo envio.
      return;
    }

    await entrar(email, senha);
  }

  function trocarTela() {
    definirSenha('');
    if (cadastro) {
      navigation.navigate('Login');
      return;
    }
    navigation.navigate('Cadastro');
  }

  function focarSenha() {
    // Uso a referência do campo para levar o cursor à senha ao tocar em Próximo.
    if (campoSenha.current) {
      campoSenha.current.focus();
    }
  }

  function mostrarOrientacaoSenha() {
    // Exibo a orientação no cadastro e devolvo null quando ela não precisa aparecer.
    if (cadastro) {
      return (
        <Text style={estilos.etiqueta}>Use pelo menos 4 caracteres.</Text>
      );
    }

    return null;
  }

  function mostrarEspera() {
    // Apresento a animação e o texto da operação enquanto aguardo a resposta do Controller.
    if (ocupado) {
      return (
        <View style={estilos.opcao}>
          <ActivityIndicator color={cores.principal} />
          <Text accessibilityLiveRegion="polite" style={estilos.texto}>
            {textoAguarde}
          </Text>
        </View>
      );
    }

    return null;
  }

  function mostrarAvisoCadastro() {
    // Lembro onde a conta será guardada somente na tela em que a pessoa está se cadastrando.
    if (cadastro) {
      return (
        <Text style={estilos.texto}>
          Sua conta ficará salva neste aparelho.
        </Text>
      );
    }

    return null;
  }

  return (
    <SafeAreaView style={estilos.segura}>
      {/* Desloco o formulário quando o teclado abre para continuar vendo os campos. */}
      <KeyboardAvoidingView style={estilos.corpo} behavior="padding">
        {/* Organizo o conteúdo rolável com ScrollView e seus espaços internos com contentContainerStyle. */}
        <ScrollView
          contentContainerStyle={estilos.centralizado}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <View style={estilos.introducao}>
            <Text style={estilos.marca}>iFome</Text>
            <Text style={estilos.assinatura}>FEITO PRA VOCÊ</Text>
            <Text accessibilityRole="header" style={estilos.titulo}>
              {titulo}
            </Text>
            <Text style={estilos.subtitulo}>{descricao}</Text>
          </View>

          <View style={estilos.cartao}>
            <View style={estilos.campo}>
              <Text style={estilos.rotulo}>E-mail</Text>
              {/* Ligo o texto ao estado: cada alteração no campo atualiza a variável email. */}
              {/* Permito editar enquanto ocupado for false para preservar os campos durante o envio. */}
              {/* Uso TextInput para receber a digitação; keyboardType escolhe um teclado adequado ao e-mail. */}
              <TextInput
                accessibilityLabel="E-mail"
                style={estilos.entrada}
                value={email}
                onChangeText={definirEmail}
                placeholder="seu@email.com"
                placeholderTextColor={cores.secundario}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                maxLength={254}
                returnKeyType="next"
                submitBehavior="submit"
                onSubmitEditing={focarSenha}
                editable={ocupado === false}
              />
            </View>

            <View style={estilos.campo}>
              <Text style={estilos.rotulo}>Senha</Text>
              {/* Escondo os caracteres com secureTextEntry e desativo correções na senha. */}
              <TextInput
                ref={campoSenha}
                accessibilityLabel="Senha"
                style={estilos.entrada}
                value={senha}
                onChangeText={definirSenha}
                placeholder="Digite sua senha"
                placeholderTextColor={cores.secundario}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete={preenchimentoSenha}
                textContentType={tipoSenha}
                maxLength={128}
                returnKeyType="done"
                onSubmitEditing={enviar}
                editable={ocupado === false}
              />
              {mostrarOrientacaoSenha()}
            </View>

            <Botao
              titulo={tituloBotao}
              aoPressionar={enviar}
              desabilitado={ocupado}
            />
            <Botao
              titulo={tituloAlternativo}
              aoPressionar={trocarTela}
              variante="secundario"
              desabilitado={ocupado}
            />
            {mostrarEspera()}
          </View>
          {mostrarAvisoCadastro()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
