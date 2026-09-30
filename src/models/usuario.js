// Reservo este e-mail para a conta de demonstração pedida na atividade.
export const emailAdministrador = 'admin@teste.com';

export function validarCredenciais(email, senha) {
  if (typeof email !== 'string' || typeof senha !== 'string') {
    throw new Error('Informe seu e-mail e sua senha.');
  }

  // Retiro os espaços nas pontas e trato letras maiúsculas como minúsculas.
  const emailSemEspacos = email.trim();
  const emailNormalizado = emailSemEspacos.toLowerCase();
  const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Uso esta expressão para conferir a estrutura básica do e-mail, sem espaços no meio.
  const emailTemFormatoValido = formatoEmail.test(emailNormalizado);
  if (
    emailNormalizado.length > 254 ||
    !emailTemFormatoValido
  ) {
    throw new Error('Informe um e-mail válido.');
  }
  if (!senha.trim() || senha.length > 128) {
    throw new Error('Informe uma senha de até 128 caracteres.');
  }

  // Preservo a senha como foi digitada, porque espaços e maiúsculas fazem parte dela.
  return { email: emailNormalizado, senha: senha };
}

export function validarCadastro(email, senha) {
  const credenciais = validarCredenciais(email, senha);
  if (credenciais.senha.length < 4) {
    throw new Error('Crie uma senha com pelo menos 4 caracteres.');
  }
  return credenciais;
}

export function criarUsuario(email) {
  if (email === emailAdministrador) {
    return { id: 'admin', email: email, administrador: true };
  }

  // Separo com Array.from os caracteres completos, inclusive os que ocupam duas posições no texto.
  const caracteres = Array.from(email);
  // Transformo cada letra em um código para montar uma chave aceita pelo SecureStore.
  const codigos = caracteres.map((letra) => {
    const codigoDaLetra = letra.codePointAt(0);
    const codigoEmHexadecimal = codigoDaLetra.toString(16);
    // Completo cada código até seis posições para manter a separação entre os caracteres.
    return codigoEmHexadecimal.padStart(6, '0');
  });
  // Uno os códigos com join, sem separadores, para preservar a identificação das contas existentes.
  const identificador = codigos.join('');

  return { id: 'u-' + identificador, email: email, administrador: false };
}
