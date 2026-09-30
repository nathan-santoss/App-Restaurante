import * as SecureStore from 'expo-secure-store';

function obterChaveCliente(usuarioId) {
  // Uso uma chave por usuário para separar os dados pessoais de cada conta.
  if (!usuarioId) {
    throw new Error('Faça login para acessar seus dados.');
  }
  if (usuarioId === 'admin') {
    return 'ifome_cliente';
  }
  return 'ifome_cliente_' + usuarioId;
}

export function validarCliente(dados) {
  // Aceito os campos vazios, mas confiro o tipo e o tamanho antes de salvá-los.
  if (
    !dados ||
    typeof dados.nome !== 'string' ||
    typeof dados.telefone !== 'string' ||
    dados.nome.length > 80 ||
    dados.telefone.length > 25
  ) {
    throw new Error(
      'Informe um nome de até 80 caracteres e um telefone de até 25 caracteres.',
    );
  }
  // Retiro os espaços das pontas antes de devolver os campos que vou salvar.
  return { nome: dados.nome.trim(), telefone: dados.telefone.trim() };
}

export async function verificarDisponibilidade() {
  const disponivel = await SecureStore.isAvailableAsync();
  if (!disponivel) {
    throw new Error(
      'O armazenamento seguro não está disponível neste aparelho. Você pode continuar fazendo pedidos.',
    );
  }
}

export async function carregarCliente(usuarioId) {
  const chaveCliente = obterChaveCliente(usuarioId);
  await verificarDisponibilidade();
  const texto = await SecureStore.getItemAsync(chaveCliente);
  if (texto === null) {
    // Deixo o cliente vazio quando a pessoa ainda não preencheu os dados opcionais.
    return null;
  }
  let dados;
  try {
    // Recupero o objeto com nome e telefone a partir do texto guardado.
    dados = JSON.parse(texto);
  } catch {
    throw new Error(
      'Os dados do cliente não puderam ser lidos. Você pode apagá-los nos Ajustes.',
    );
  }
  return validarCliente(dados);
}

export async function salvarCliente(dados, usuarioId) {
  const chaveCliente = obterChaveCliente(usuarioId);
  const cliente = validarCliente(dados);
  await verificarDisponibilidade();
  // Mantenho nome e telefone somente no SecureStore, separados dos pedidos.
  const textoCliente = JSON.stringify(cliente);
  await SecureStore.setItemAsync(chaveCliente, textoCliente);
  // Devolvo os campos já tratados para o Controller atualizar o formulário.
  return cliente;
}

export async function apagarCliente(usuarioId) {
  // Apago os dados pessoais desta conta sem excluir seu cadastro de acesso.
  const chaveCliente = obterChaveCliente(usuarioId);
  await verificarDisponibilidade();
  await SecureStore.deleteItemAsync(chaveCliente);
}
