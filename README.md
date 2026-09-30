# iFome

Aplicativo de restaurante em React Native com Expo, JavaScript e dados locais.
Possui Cardápio, Carrinho, Resumo do pedido e Ajustes.

## Executar

Com as dependências instaladas, execute na pasta do projeto:

```sh
npm start
```

Leia o QR code com a câmera do iPhone e abra no Expo Go atualizado.
O computador e o iPhone devem estar na mesma rede.

Para instalar as dependências em outro computador, use `npm ci` antes de iniciar.
Requer Node.js 22.13 ou superior e Expo Go compatível com o SDK 57.
O simulador iOS só funciona no macOS; no Windows, use o iPhone físico.

## Login e cadastro

O app abre na tela de login. Use a conta de demonstração:

- E-mail: `admin@teste.com`
- Senha: `admin`

Para criar outra conta, toque em **Criar uma conta** e informe somente e-mail e
senha (mínimo de 4 caracteres). Após cadastrar, entre com os dados informados.
E-mails repetidos não são aceitos. Use **Ajustes → Sair da conta** para trocar de
usuário. Uma nova abertura do app pede login novamente.

Os cadastros são locais, guardados no SecureStore, sem servidor. Cada conta tem
seu próprio carrinho, preferências, último pedido e dados pessoais. O administrador
mantém acesso aos dados que já estavam salvos antes da inclusão do login.
Limpar os dados de pedidos não exclui o cadastro de acesso. O administrador usa
as mesmas telas de pedidos; não há um painel administrativo separado.

## Organização

- `App.jsx` e `index.js`: entrada do aplicativo.
- `app.json`: configuração do Expo.
- `src`: telas, componentes, estilos, navegação, Context, regras e armazenamento.
- `package.json` e `package-lock.json`: dependências e comando de inicialização.

O Context compartilha um único carrinho. As telas chamam o Controller, que usa
os Models para cálculos e os Services para persistência. O AsyncStorage guarda
carrinho, preferências e último pedido; o SecureStore guarda nome e telefone.

**Os pedidos são registrados somente no aparelho, sem envio ao restaurante.**

Teste diretamente no Expo Go: adicione produtos, altere quantidades, revise e
confirme um pedido. Nos Ajustes, confira os dados opcionais, as preferências,
o último pedido e as ações de limpeza. Reabra o aplicativo para conferir os
dados salvos.
