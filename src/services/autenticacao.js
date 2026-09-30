import * as SecureStore from 'expo-secure-store';
import {
  criarUsuario,
  emailAdministrador,
  validarCadastro,
  validarCredenciais,
} from '../models/usuario.js';

async function verificarArmazenamento() {
  // Antes de ler um cadastro, confiro se o aparelho oferece armazenamento seguro.
  const disponivel = await SecureStore.isAvailableAsync();
  if (!disponivel) {
    throw new Error('O armazenamento seguro de cadastros não está disponível neste aparelho.');
  }
}

async function carregarConta(usuario) {
  await verificarArmazenamento();
  const texto = await SecureStore.getItemAsync('ifome_conta_' + usuario.id);
  if (texto === null) {
    // Considero a conta inexistente quando ainda não há conteúdo nesta chave.
    return null;
  }

  try {
    // Leio o texto e verifico se ele pertence ao e-mail que estou procurando.
    const dados = JSON.parse(texto);
    if (!dados || dados.email !== usuario.email) {
      throw new Error('Cadastro inválido.');
    }
    return validarCadastro(dados.email, dados.senha);
  } catch {
    throw new Error('Não foi possível ler este cadastro. Os dados salvos foram preservados.');
  }
}

export async function cadastrarUsuario(email, senha) {
  // Valido os campos antes de consultar ou gravar qualquer cadastro no aparelho.
  const credenciais = validarCadastro(email, senha);
  const usuario = criarUsuario(credenciais.email);
  if (usuario.administrador) {
    throw new Error('Este e-mail já está cadastrado. Faça login.');
  }
  const existente = await carregarConta(usuario);
  // Evito substituir uma conta quando alguém tenta cadastrar o mesmo e-mail.
  if (existente) {
    throw new Error('Este e-mail já está cadastrado. Faça login.');
  }

  // Salvo as credenciais no SecureStore para mantê-las criptografadas neste aparelho.
  const chaveConta = 'ifome_conta_' + usuario.id;
  const textoCredenciais = JSON.stringify(credenciais);
  // Aguardo a gravação terminar para que a tela só anuncie sucesso com a conta salva.
  await SecureStore.setItemAsync(
    chaveConta,
    textoCredenciais,
  );
}

export async function autenticarUsuario(email, senha) {
  const credenciais = validarCredenciais(email, senha);
  const usuario = criarUsuario(credenciais.email);

  // Trato separadamente a conta de demonstração combinada para a atividade.
  if (credenciais.email === emailAdministrador) {
    if (credenciais.senha !== 'admin') {
      throw new Error('E-mail ou senha incorretos.');
    }
    return usuario;
  }

  // Para as demais contas, comparo a senha informada com o cadastro salvo.
  const conta = await carregarConta(usuario);
  if (!conta || conta.senha !== credenciais.senha) {
    throw new Error('E-mail ou senha incorretos.');
  }
  // Retorno apenas a identificação da conta; não incluo a senha nos dados da sessão.
  return usuario;
}
