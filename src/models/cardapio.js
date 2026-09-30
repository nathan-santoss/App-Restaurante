// Separo estas categorias para usar os mesmos nomes nos filtros do app.
export const categorias = ['Todos', 'Comidas', 'Bebidas'];

// Deixo o cardápio no próprio projeto e escrevo os preços em centavos.
export const produtos = [
  {
    id: 'comida-01',
    nome: 'Burger da casa',
    descricao: 'Pão brioche, hambúrguer, queijo e molho da casa.',
    categoria: 'Comidas',
    precoCentavos: 2890,
    disponivel: true,
  },
  {
    id: 'comida-02',
    nome: 'Prato feito',
    descricao: 'Arroz, feijão, bife grelhado e salada fresca.',
    categoria: 'Comidas',
    precoCentavos: 3290,
    disponivel: true,
  },
  {
    id: 'comida-03',
    nome: 'Massa ao sugo',
    descricao: 'Penne com molho de tomate e manjericão.',
    categoria: 'Comidas',
    precoCentavos: 2690,
    disponivel: true,
  },
  {
    id: 'comida-04',
    nome: 'Salada colorida',
    descricao: 'Folhas, tomate, cenoura, grão-de-bico e molho de limão.',
    categoria: 'Comidas',
    precoCentavos: 2290,
    disponivel: true,
  },
  {
    id: 'comida-05',
    nome: 'Batata crocante',
    descricao: 'Porção de batatas fritas com um toque de páprica.',
    categoria: 'Comidas',
    precoCentavos: 1690,
    disponivel: true,
  },
  {
    id: 'comida-06',
    nome: 'Sanduíche de frango',
    descricao: 'Frango grelhado, alface e creme de ricota no pão integral.',
    categoria: 'Comidas',
    precoCentavos: 2490,
    disponivel: true,
  },
  {
    id: 'bebida-01',
    nome: 'Suco de laranja',
    descricao: 'Suco natural de laranja, copo de 300 ml.',
    categoria: 'Bebidas',
    precoCentavos: 990,
    disponivel: true,
  },
  {
    id: 'bebida-02',
    nome: 'Limonada',
    descricao: 'Limão espremido na hora, copo de 300 ml.',
    categoria: 'Bebidas',
    precoCentavos: 890,
    disponivel: true,
  },
  {
    id: 'bebida-03',
    nome: 'Refrigerante',
    descricao: 'Refrigerante de cola, lata de 350 ml.',
    categoria: 'Bebidas',
    precoCentavos: 690,
    disponivel: true,
  },
  {
    id: 'bebida-04',
    nome: 'Água mineral',
    descricao: 'Água sem gás, garrafa de 500 ml.',
    categoria: 'Bebidas',
    precoCentavos: 490,
    disponivel: true,
  },
];

export function buscarProduto(id) {
  // Procuro pelo ID, pois o nome exibido não é a identificação usada no carrinho.
  for (const produto of produtos) {
    if (produto.id === id && produto.disponivel) {
      return produto;
    }
  }

  // Devolvo undefined quando não encontro uma opção disponível com esse ID.
  return undefined;
}

export function filtrarProdutos(categoria) {
  const produtosFiltrados = [];

  // Acrescento à lista apenas o que está disponível na categoria escolhida.
  for (const produto of produtos) {
    if (produto.disponivel) {
      if (categoria === 'Todos') {
        // Nesta opção, incluo tanto as comidas quanto as bebidas disponíveis.
        produtosFiltrados.push(produto);
      } else if (produto.categoria === categoria) {
        produtosFiltrados.push(produto);
      }
    }
  }

  return produtosFiltrados;
}
