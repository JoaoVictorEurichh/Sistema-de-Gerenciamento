// Classe para gerenciar autenticação
class Autenticacao {
    constructor() {
        this.usuarioAtual = JSON.parse(localStorage.getItem('usuarioAtual')) || null;
        this.logoutBtn = document.getElementById('logoutBtn');
        this.userInfo = document.getElementById('userInfo');
        this.userName = document.getElementById('userName');
        this.addProdutoBtn = document.getElementById('addProdutoBtn');

        this.inicializarEventos();
        this.atualizarInterface();
    }

    inicializarEventos() {
        this.logoutBtn.addEventListener('click', () => this.logout());
    }

    logout() {
        this.usuarioAtual = null;
        localStorage.removeItem('usuarioAtual');
        this.atualizarInterface();
        window.location.href = 'login.html';
    }

    atualizarInterface() {
        if (this.usuarioAtual) {
            this.userInfo.style.display = 'flex';
            this.userName.textContent = this.usuarioAtual.nome;
            this.addProdutoBtn.style.display = 'block';
        } else {
            this.userInfo.style.display = 'none';
            this.addProdutoBtn.style.display = 'none';
            window.location.href = 'login.html';
        }
    }
}

// Classe para gerenciar produtos
class GerenciadorProdutos {
    constructor() {
        this.produtos = JSON.parse(localStorage.getItem('produtos')) || [];
        this.produtoModal = document.getElementById('produtoModal');
        this.produtoForm = document.getElementById('produtoForm');
        this.listaProdutos = document.getElementById('produtosLista');
        this.addProdutoBtn = document.getElementById('addProdutoBtn');
        this.previewContainer = document.getElementById('previewContainer');
        this.searchInput = document.querySelector('.search-input');
        this.searchBtn = document.querySelector('.search-btn');
        this.filtroBtn = document.getElementById('filtroBtn');
        this.filtroDropdown = document.getElementById('filtroDropdown');
        this.categoriaAtual = 'todos';

        // Modal de edição
        this.editarProdutoModal = document.getElementById('editarProdutoModal');
        this.editarProdutoForm = document.getElementById('editarProdutoForm');
        this.editarPreviewContainer = document.getElementById('editarPreviewContainer');

        this.inicializarEventos();
        this.atualizarListaProdutos();
    }

    inicializarEventos() {
        this.addProdutoBtn.addEventListener('click', () => this.abrirModal(this.produtoModal));
        this.produtoForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.adicionarProduto();
        });

        // Preview da imagem de cadastro
        document.getElementById('foto').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.previewContainer.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                };
                reader.readAsDataURL(file);
            }
        });

        // Fechar modal de cadastro ao clicar no X
        this.produtoModal.querySelector('.close').addEventListener('click', () => this.fecharModal(this.produtoModal));
        window.addEventListener('click', (e) => {
            if (e.target === this.produtoModal) {
                this.fecharModal(this.produtoModal);
            }
        });

        // Modal de edição
        this.editarProdutoForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.salvarEdicaoProduto();
        });
        document.getElementById('editarFoto').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.editarPreviewContainer.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                };
                reader.readAsDataURL(file);
            }
        });
        this.editarProdutoModal.querySelector('.close').addEventListener('click', () => this.fecharModal(this.editarProdutoModal));
        window.addEventListener('click', (e) => {
            if (e.target === this.editarProdutoModal) {
                this.fecharModal(this.editarProdutoModal);
            }
        });

        // Eventos de busca
        this.searchInput.addEventListener('input', () => this.buscarProdutos());
        this.searchBtn.addEventListener('click', () => this.buscarProdutos());
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.buscarProdutos();
            }
        });

        // Eventos do filtro
        this.filtroBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.filtroDropdown.classList.toggle('show');
        });

        document.querySelectorAll('.filtro-option').forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const categoria = e.target.dataset.categoria;
                this.filtrarPorCategoria(categoria);
                this.filtroDropdown.classList.remove('show');
            });
        });

        // Fechar dropdown ao clicar fora
        document.addEventListener('click', () => {
            this.filtroDropdown.classList.remove('show');
        });
    }

    abrirModal(modal) {
        modal.style.display = 'block';
    }

    fecharModal(modal) {
        modal.style.display = 'none';
        if (modal === this.produtoModal) {
            this.produtoForm.reset();
            this.previewContainer.innerHTML = '';
        }
        if (modal === this.editarProdutoModal) {
            this.editarProdutoForm.reset();
            this.editarPreviewContainer.innerHTML = '';
        }
    }

    adicionarProduto() {
        const nome = document.getElementById('nome').value;
        const categoria = document.getElementById('categoria').value;
        const descricao = document.getElementById('descricao').value;
        const preco = parseFloat(document.getElementById('preco').value);
        const quantidade = parseInt(document.getElementById('quantidade').value);
        const fotoInput = document.getElementById('foto');
        const foto = fotoInput.files[0];

        if (!this.validarProduto(nome, categoria, descricao, preco, quantidade)) {
            return;
        }

        const produto = {
            id: Date.now(),
            nome,
            categoria,
            descricao,
            preco,
            quantidade,
            foto: foto ? URL.createObjectURL(foto) : null
        };

        this.produtos.push(produto);
        this.salvarProdutos();
        this.atualizarListaProdutos();
        this.fecharModal(this.produtoModal);
    }

    editarProduto(id) {
        const produto = this.produtos.find(p => p.id === id);
        if (!produto) return;
        document.getElementById('editarId').value = produto.id;
        document.getElementById('editarNome').value = produto.nome;
        document.getElementById('editarCategoria').value = produto.categoria;
        document.getElementById('editarDescricao').value = produto.descricao;
        document.getElementById('editarPreco').value = produto.preco;
        document.getElementById('editarQuantidade').value = produto.quantidade;
        this.editarPreviewContainer.innerHTML = produto.foto ? `<img src="${produto.foto}" alt="Preview">` : '';
        this.abrirModal(this.editarProdutoModal);
    }

    salvarEdicaoProduto() {
        const id = parseInt(document.getElementById('editarId').value);
        const nome = document.getElementById('editarNome').value;
        const categoria = document.getElementById('editarCategoria').value;
        const descricao = document.getElementById('editarDescricao').value;
        const preco = parseFloat(document.getElementById('editarPreco').value);
        const quantidade = parseInt(document.getElementById('editarQuantidade').value);
        const fotoInput = document.getElementById('editarFoto');
        const foto = fotoInput.files[0];

        if (!this.validarProduto(nome, categoria, descricao, preco, quantidade)) {
            return;
        }

        const produto = this.produtos.find(p => p.id === id);
        if (!produto) return;
        produto.nome = nome;
        produto.categoria = categoria;
        produto.descricao = descricao;
        produto.preco = preco;
        produto.quantidade = quantidade;
        if (foto) {
            produto.foto = URL.createObjectURL(foto);
        }
        this.salvarProdutos();
        this.atualizarListaProdutos();
        this.fecharModal(this.editarProdutoModal);
    }

    excluirProduto(id) {
        if (confirm('Tem certeza que deseja excluir este produto?')) {
            this.produtos = this.produtos.filter(p => p.id !== id);
            this.salvarProdutos();
            this.atualizarListaProdutos();
        }
    }

    salvarProdutos() {
        localStorage.setItem('produtos', JSON.stringify(this.produtos));
    }

    atualizarListaProdutos(produtosParaExibir = null) {
        this.listaProdutos.innerHTML = '';
        const produtos = produtosParaExibir || this.produtos;

        if (produtos.length === 0) {
            this.listaProdutos.innerHTML = `
                <div class="sem-produtos">
                    <i class="fas fa-search"></i>
                    <p>Nenhum produto encontrado</p>
                </div>
            `;
            return;
        }

        produtos.forEach(produto => {
            const card = document.createElement('div');
            card.className = 'produto-card';
            card.innerHTML = `
                <div class="produto-img">
                    <img src="${produto.foto || 'assets/img/no-image.png'}" alt="${produto.nome}">
                </div>
                <div class="produto-info">
                    <div class="produto-categoria">${produto.categoria}</div>
                    <h3 class="produto-title">${produto.nome}</h3>
                    <p class="produto-desc">${produto.descricao}</p>
                    <div class="produto-valor">
                        <p>Preço: R$ ${produto.preco.toFixed(2)}</p>
                        <p>Quantidade: ${produto.quantidade}</p>
                    </div>
                    <div class="produto-acoes">
                        <button class="btn-editar" onclick="gerenciadorProdutos.editarProduto(${produto.id})">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="btn-excluir" onclick="gerenciadorProdutos.excluirProduto(${produto.id})">
                            <i class="fas fa-trash"></i> Excluir
                        </button>
                    </div>
                </div>
            `;
            this.listaProdutos.appendChild(card);
        });
    }

    buscarProdutos() {
        const termoBusca = this.searchInput.value.toLowerCase().trim();
        
        if (!termoBusca) {
            this.filtrarPorCategoria(this.categoriaAtual);
            return;
        }

        const produtosFiltrados = this.produtos.filter(produto => {
            const matchBusca = (
                produto.nome.toLowerCase().includes(termoBusca) ||
                produto.categoria.toLowerCase().includes(termoBusca) ||
                produto.descricao.toLowerCase().includes(termoBusca) ||
                produto.preco.toString().includes(termoBusca) ||
                produto.quantidade.toString().includes(termoBusca)
            );

            const matchCategoria = this.categoriaAtual === 'todos' || 
                                 produto.categoria === this.categoriaAtual;

            return matchBusca && matchCategoria;
        });

        this.atualizarListaProdutos(produtosFiltrados);
    }

    filtrarPorCategoria(categoria) {
        this.categoriaAtual = categoria;
        
        // Atualizar botão ativo
        document.querySelectorAll('.filtro-option').forEach(option => {
            option.classList.toggle('active', option.dataset.categoria === categoria);
        });

        // Atualizar texto do botão de filtro
        const textoCategoria = categoria === 'todos' ? 'Todas as Categorias' : 
            categoria === 'Pistola' ? 'Pistolas' :
            categoria === 'Rifle' ? 'Rifles' :
            categoria === 'Acessório' ? 'Acessórios' : 'Outros';
        
        this.filtroBtn.innerHTML = `<i class="fas fa-filter"></i> ${textoCategoria}`;

        // Filtrar produtos
        if (categoria === 'todos') {
            this.atualizarListaProdutos();
        } else {
            const produtosFiltrados = this.produtos.filter(produto => 
                produto.categoria === categoria
            );
            this.atualizarListaProdutos(produtosFiltrados);
        }
    }

    validarProduto(nome, categoria, descricao, preco, quantidade) {
        if (!nome || !categoria || !descricao || !preco || !quantidade) {
            alert('Por favor, preencha todos os campos.');
            return false;
        }

        if (preco <= 0) {
            alert('O preço deve ser maior que zero.');
            return false;
        }

        if (quantidade < 0) {
            alert('A quantidade não pode ser negativa.');
            return false;
        }

        return true;
    }

    // Métodos para incremento/decremento do preço
    incrementarPreco() {
        const precoInput = document.getElementById('preco');
        const valorAtual = parseFloat(precoInput.value) || 0;
        precoInput.value = (valorAtual + 0.01).toFixed(2);
    }

    decrementarPreco() {
        const precoInput = document.getElementById('preco');
        const valorAtual = parseFloat(precoInput.value) || 0;
        if (valorAtual > 0.01) {
            precoInput.value = (valorAtual - 0.01).toFixed(2);
        }
    }

    // Métodos para incremento/decremento da quantidade
    incrementarQuantidade() {
        const quantidadeInput = document.getElementById('quantidade');
        const valorAtual = parseInt(quantidadeInput.value) || 0;
        quantidadeInput.value = valorAtual + 1;
    }

    decrementarQuantidade() {
        const quantidadeInput = document.getElementById('quantidade');
        const valorAtual = parseInt(quantidadeInput.value) || 0;
        if (valorAtual > 0) {
            quantidadeInput.value = valorAtual - 1;
        }
    }

    // Métodos para incremento/decremento do preço na edição
    incrementarPrecoEdicao() {
        const precoInput = document.getElementById('editarPreco');
        const valorAtual = parseFloat(precoInput.value) || 0;
        precoInput.value = (valorAtual + 0.01).toFixed(2);
    }

    decrementarPrecoEdicao() {
        const precoInput = document.getElementById('editarPreco');
        const valorAtual = parseFloat(precoInput.value) || 0;
        if (valorAtual > 0.01) {
            precoInput.value = (valorAtual - 0.01).toFixed(2);
        }
    }

    // Métodos para incremento/decremento da quantidade na edição
    incrementarQuantidadeEdicao() {
        const quantidadeInput = document.getElementById('editarQuantidade');
        const valorAtual = parseInt(quantidadeInput.value) || 0;
        quantidadeInput.value = valorAtual + 1;
    }

    decrementarQuantidadeEdicao() {
        const quantidadeInput = document.getElementById('editarQuantidade');
        const valorAtual = parseInt(quantidadeInput.value) || 0;
        if (valorAtual > 0) {
            quantidadeInput.value = valorAtual - 1;
        }
    }
}

class RelatoriosEstoque {
    constructor() {
        this.relatoriosModal = document.getElementById('relatoriosModal');
        this.relatoriosBtn = document.getElementById('relatoriosBtn');
        this.gerenciadorProdutos = gerenciadorProdutos;

        this.inicializarEventos();
    }

    inicializarEventos() {
        this.relatoriosBtn.addEventListener('click', () => {
            this.abrirModal();
            this.atualizarRelatorios();
        });

        this.relatoriosModal.querySelector('.close').addEventListener('click', () => this.fecharModal());
        window.addEventListener('click', (e) => {
            if (e.target === this.relatoriosModal) {
                this.fecharModal();
            }
        });
    }

    abrirModal() {
        this.relatoriosModal.style.display = 'block';
    }

    fecharModal() {
        this.relatoriosModal.style.display = 'none';
    }

    atualizarRelatorios() {
        const produtos = this.gerenciadorProdutos.produtos;
        const categorias = {
            'Pistola': { total: 0, valor: 0 },
            'Rifle': { total: 0, valor: 0 },
            'Acessório': { total: 0, valor: 0 },
            'outros': { total: 0, valor: 0 }
        };

        produtos.forEach(produto => {
            const categoria = produto.categoria;
            if (categorias[categoria]) {
                categorias[categoria].total += produto.quantidade;
                categorias[categoria].valor += produto.quantidade * produto.preco;
            }
        });

        // Atualizar os totais por categoria
        document.getElementById('totalPistolas').textContent = categorias['Pistola'].total;
        document.getElementById('valorPistolas').textContent = categorias['Pistola'].valor.toFixed(2);
        
        document.getElementById('totalRifles').textContent = categorias['Rifle'].total;
        document.getElementById('valorRifles').textContent = categorias['Rifle'].valor.toFixed(2);
        
        document.getElementById('totalAcessorios').textContent = categorias['Acessório'].total;
        document.getElementById('valorAcessorios').textContent = categorias['Acessório'].valor.toFixed(2);
        
        document.getElementById('totalOutros').textContent = categorias['outros'].total;
        document.getElementById('valorOutros').textContent = categorias['outros'].valor.toFixed(2);

        // Calcular e atualizar totais gerais
        const totalGeral = Object.values(categorias).reduce((acc, cat) => acc + cat.total, 0);
        const valorGeral = Object.values(categorias).reduce((acc, cat) => acc + cat.valor, 0);

        document.getElementById('totalGeral').textContent = totalGeral;
        document.getElementById('valorGeral').textContent = valorGeral.toFixed(2);
    }
}

// Inicializar os gerenciadores
const autenticacao = new Autenticacao();
const gerenciadorProdutos = new GerenciadorProdutos();
const relatoriosEstoque = new RelatoriosEstoque(); 