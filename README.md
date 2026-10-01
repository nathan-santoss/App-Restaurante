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

## Pedido com localização (aula DM9)

A aula apresenta permissões, coordenadas e mapas. Neste projeto aplico esses
conceitos ao ponto de entrega do pedido com apenas `expo-location` e
`react-native-maps`. A permissão é solicitada ao tocar no botão de localização,
durante a revisão da compra.

### Testar no Expo Go

1. Execute `npm ci` e `npm start` (no PowerShell, use `npm.cmd` se a política de
   scripts bloquear `npm.ps1`).
2. Abra no Expo Go compatível com o SDK 57 em um celular Android ou iPhone.
3. Entre na conta, adicione produtos e abra **Carrinho → Finalizar · Revisar pedido**.
4. No local onde deseja receber, toque em **Usar minha localização atual**.
5. Autorize a localização durante o uso. Confira o marcador, latitude, longitude,
   precisão estimada e horário da captura.
6. Preencha o complemento opcional, como apartamento ou portaria, e confirme.
7. Confira a localização no pedido registrado e em **Ajustes → Consultar último pedido**.
   Feche e reabra o app, entre na mesma conta e consulte novamente.

A captura é pontual: não acompanha deslocamentos nem usa localização em segundo
plano. Para atualizar o ponto, toque em **Atualizar minha localização**. Ao sair
da revisão, a captura ainda não confirmada é descartada; ao retornar, capture de
novo. O GPS indica o ponto onde o aparelho estava; não pesquisa outro endereço,
não identifica número de apartamento e não calcula rotas ou frete.

O mapa usa o provedor padrão do aparelho. No Expo Go não é necessário cadastrar
uma chave de mapas. O carregamento do mapa depende de conexão; as coordenadas
também aparecem em texto. A leitura da localização depende dos serviços e das
permissões do celular. A mensagem personalizada de permissão do `app.json` vale
para um aplicativo compilado; no Expo Go, a permissão pertence ao próprio Expo Go.

### Recuperação e armazenamento

- Permissão negada: o carrinho é mantido e a tela orienta uma nova tentativa.
  Se o sistema não puder perguntar novamente, aparece **Abrir ajustes do celular**.
- GPS desligado: ative a localização nos ajustes do aparelho e capture novamente.
- Demora: após 25 segundos de espera pela posição, a tela permite tentar de novo.
  Uma resposta atrasada não altera o ponto exibido.
- Precisão baixa: confira o aviso, habilite a localização precisa e tente em um
  local aberto. A precisão mostrada é uma estimativa do sistema.
- Um novo pedido exige coordenadas válidas. Pedidos anteriores a esta alteração
  continuam disponíveis, identificados como sem localização.
- Coordenadas, precisão, horário e complemento ficam no AsyncStorage junto ao
  último pedido da conta. **Limpar dados do iFome** remove esse registro.
  Nome e telefone continuam separados no SecureStore.
- Se a gravação falhar, os itens permanecem no carrinho. Se apenas a limpeza
  falhar, o pedido já salvo é preservado e não é registrado novamente.

Os pedidos continuam sendo uma demonstração local, sem envio a restaurante ou
entregador, cobrança ou rastreamento de entrega.

### Código e verificações

- `src/services/localizacao.js`: permissão, GPS e limite de espera.
- `src/controllers/useEntregaController.js`: estado da captura e descarte de
  respostas atrasadas ao sair da revisão.
- `src/models/entrega.js`: validação dos dados que serão salvos.
- `src/views/components/EntregaPedido.jsx` e `LocalEntrega.jsx`: formulário,
  mapa e consulta do destino.
- `npm test`: testes das regras, permissões simuladas e falhas de armazenamento.
- `npx expo install --check`: compatibilidade das dependências.
- `npx expo export --platform all`: compilação dos bundles Android e iOS.

Os testes automatizados simulam o GPS. Permissões nativas, precisão real e
renderização do mapa devem ser conferidas no celular pelo roteiro acima.

Referências oficiais: [Expo Location](https://docs.expo.dev/versions/latest/sdk/location/)
e [react-native-maps no Expo](https://docs.expo.dev/versions/latest/sdk/map-view/).

## Build iOS pelo GitHub Actions

Este fluxo gera um app **Release para iPhone físico (iphoneos / arm64)**, com o
JavaScript incorporado. Depois da instalação, não precisa de Expo Go nem do
servidor de desenvolvimento no computador.

**Pré-requisitos:** repositório público com Actions habilitado, iPhone com iOS
16.4 ou superior e AltServer no Windows / AltStore Classic no iPhone. O runner
padrão de repositório público é gratuito; o workflow não executa em repositório
privado. A Apple ID gratuita é usada apenas no sideload, fora do GitHub.

### Executar e baixar

1. Abra **Actions → Build iOS unsigned → Run workflow**.
2. Selecione a branch com esta configuração e confirme **Run workflow**.
3. Aguarde o job terminar com sucesso.
4. Em **Artifacts**, baixe **iFome-iOS** e extraia o ZIP do GitHub.
5. Localize o arquivo `.ipa` (o nome vem do produto gerado pelo Xcode).
6. Envie o IPA para o app Arquivos do iPhone. No AltStore Classic, use
   **My Apps → +** para selecioná-lo, com o AltServer disponível no computador.

**Primeira execução em uma branch:** o GitHub só habilita o disparo manual depois
que este workflow estiver também na branch padrão (`main`). Antes dessa
integração, inicie intencionalmente um build criando uma tag no commit desejado:

```sh
git tag ios-test-20261001-1
git push origin ios-test-20261001-1
```

Use um nome novo a cada teste. Pushes comuns de código não disparam builds.
Também é possível usar **Re-run jobs** em uma execução existente para repetir
o mesmo commit. O artifact fica disponível por 3 dias; baixe-o nesse período.

### O que o build faz

A configuração atual usa Expo 57.0.26, React Native 0.86.3 e React 19.2.3.
O workflow utiliza Node 22 (compatível com `engines`), `npm ci`, o runner
`macos-26` e Xcode 26.6, disponível nessa imagem. O CocoaPods vem do runner,
e sua versão aparece nos logs.

A pasta `ios/` é gerada por `expo prebuild --platform ios --clean --no-install`
a partir do template do Expo instalado. Em seguida, executo `pod install`.
Não é necessário versionar código nativo manualmente. Workspace, scheme,
produto e caminho do app são descobertos no projeto gerado.

O script `scripts/build-ios.py` confere executável, Info.plist, identificador,
arquitetura, plataforma de dispositivo, JavaScript incorporado e estrutura ZIP
`Payload/Nome.app`. O artifact **iFome-iOS-diagnostico** guarda logs e o
`Podfile.lock` resolvido nessa execução, úteis se o build falhar.

### Assinatura e teste no aparelho

O IPA **não está assinado para instalação direta ou App Store**. O AltStore/
AltServer precisa reassiná-lo e criar o provisionamento com sua conta gratuita.
Nenhuma senha, certificado Apple, conta EAS ou segredo Apple é usado no workflow.

Instale o AltServer, iTunes e iCloud seguindo o
[guia oficial para Windows](https://faq.altstore.io/altstore-classic/how-to-install-altstore-windows).
Confie no computador/perfil e habilite o Modo de Desenvolvedor do iPhone quando
solicitado. A conta gratuita permite até 3 apps ativos (incluindo AltStore) e exige
renovação a cada 7 dias pelo AltServer. Consulte as
[limitações do AltStore](https://faq.altstore.io/altstore-classic/your-altstore).

Após instalar, abra o iFome pela tela inicial, entre na conta, adicione produtos,
capture a localização e confirme um pedido. Os dados ficam na instalação nova;
os registros do Expo Go não são transferidos automaticamente. Teste também
fechar/reabrir o app e consultar o último pedido. Mudanças no código exigem novo
build e nova instalação.

Uma execução verde comprova compilação e empacotamento; não comprova a
reassinatura nem o funcionamento no seu iPhone. Essas etapas precisam ser
validadas no dispositivo.

Referências: [runner macOS](https://github.com/actions/runner-images/blob/main/images/macos/macos-26-arm64-Readme.md),
[execução manual](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow)
e [uso gratuito de Actions](https://docs.github.com/en/billing/concepts/product-billing/github-actions).
