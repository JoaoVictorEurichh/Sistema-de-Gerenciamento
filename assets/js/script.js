// Função para gerenciar autenticação
function Autenticacao() {
    this.usuarioAtual = JSON.parse(localStorage.getItem('usuarioAtual')) || null;
    this.logoutBtn = document.getElementById('logoutBtn');
    this.userInfo = document.getElementById('userInfo');
    this.userName = document.getElementById('userName');
    this.addProdutoBtn = document.getElementById('addProdutoBtn');

    this.inicializarEventos();
    this.atualizarInterface();
}

Autenticacao.prototype.inicializarEventos = function() {
    this.logoutBtn.addEventListener('click', () => this.logout());
};

Autenticacao.prototype.logout = function() {
    this.usuarioAtual = null;
    localStorage.removeItem('usuarioAtual');
    this.atualizarInterface();
    window.location.href = 'login.html';
};

Autenticacao.prototype.atualizarInterface = function() {
    if (this.usuarioAtual) {
        this.userInfo.style.display = 'flex';
        this.userName.textContent = this.usuarioAtual.nome;
        this.addProdutoBtn.style.display = 'block';
    } else {
        this.userInfo.style.display = 'none';
        this.addProdutoBtn.style.display = 'none';
        window.location.href = 'login.html';
    }
};

// Função para gerenciar produtos
function GerenciadorProdutos() {
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
    this.filtroAtual = {
        categoria: 'todos',
        fabricante: 'todos'
    };

    // Modal de edição
    this.editarProdutoModal = document.getElementById('editarProdutoModal');
    this.editarProdutoForm = document.getElementById('editarProdutoForm');
    this.editarPreviewContainer = document.getElementById('editarPreviewContainer');

    this.vendaModal = document.getElementById('vendaModal');
    this.vendaForm = document.getElementById('vendaForm');
    this.vendas = JSON.parse(localStorage.getItem('vendas')) || [];

    this.inicializarEventos();
    this.atualizarListaProdutos();
}

GerenciadorProdutos.prototype.inicializarEventos = function() {
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
        e.preventDefault();
        e.stopPropagation();
        this.filtroDropdown.classList.toggle('show');
    });

    document.querySelectorAll('.filtro-option').forEach(option => {
        option.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const tipo = e.target.dataset.tipo;
            const valor = e.target.dataset.valor;
            this.filtrarProdutos(tipo, valor);
            this.filtroDropdown.classList.remove('show');
        });
    });

    // Fechar dropdown ao clicar fora
    document.addEventListener('click', (e) => {
        if (!this.filtroBtn.contains(e.target) && !this.filtroDropdown.contains(e.target)) {
            this.filtroDropdown.classList.remove('show');
        }
    });

    // Eventos do modal de venda
    this.vendaForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.confirmarVenda();
    });

    this.vendaModal.querySelector('.close').addEventListener('click', () => this.fecharModal(this.vendaModal));
    window.addEventListener('click', (e) => {
        if (e.target === this.vendaModal) {
            this.fecharModal(this.vendaModal);
        }
    });
};

GerenciadorProdutos.prototype.abrirModal = function(modal) {
    modal.style.display = 'block';
};

GerenciadorProdutos.prototype.fecharModal = function(modal) {
    modal.style.display = 'none';
    if (modal === this.produtoModal) {
        this.produtoForm.reset();
        this.previewContainer.innerHTML = '';
    }
    if (modal === this.editarProdutoModal) {
        this.editarProdutoForm.reset();
        this.editarPreviewContainer.innerHTML = '';
    }
};

GerenciadorProdutos.prototype.adicionarProduto = function() {
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
};

GerenciadorProdutos.prototype.validarProduto = function(nome, categoria, descricao, preco, quantidade) {
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
};

GerenciadorProdutos.prototype.buscarProdutos = function() {
    const termoBusca = this.searchInput.value.toLowerCase().trim();
    
    if (!termoBusca) {
        this.filtrarProdutos(this.filtroAtual.categoria, this.filtroAtual.fabricante);
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

        const matchCategoria = this.filtroAtual.categoria === 'todos' || 
                             produto.categoria === this.filtroAtual.categoria;

        const matchFabricante = this.filtroAtual.fabricante === 'todos' || 
                               produto.fabricante === this.filtroAtual.fabricante;

        return matchBusca && matchCategoria && matchFabricante;
    });

    this.atualizarListaProdutos(produtosFiltrados);
};

GerenciadorProdutos.prototype.filtrarProdutos = function(tipo, valor) {
    this.filtroAtual[tipo] = valor;
    
    // Atualizar botões ativos
    document.querySelectorAll('.filtro-option').forEach(option => {
        if (option.dataset.tipo === tipo) {
            option.classList.toggle('active', option.dataset.valor === valor);
        }
    });

    // Atualizar texto do botão de filtro
    const textoCategoria = this.filtroAtual.categoria === 'todos' ? 'Todas as Categorias' : 
        this.filtroAtual.categoria;
    const textoFabricante = this.filtroAtual.fabricante === 'todos' ? 'Todos os Fabricantes' : 
        this.filtroAtual.fabricante;
    
    this.filtroBtn.innerHTML = `<i class="fas fa-filter"></i> ${textoCategoria} | ${textoFabricante}`;

    // Filtrar produtos
    let produtosFiltrados = this.produtos;

    if (this.filtroAtual.categoria !== 'todos') {
        produtosFiltrados = produtosFiltrados.filter(produto => 
            produto.categoria === this.filtroAtual.categoria
        );
    }

    if (this.filtroAtual.fabricante !== 'todos') {
        produtosFiltrados = produtosFiltrados.filter(produto => 
            produto.fabricante === this.filtroAtual.fabricante
        );
    }

    this.atualizarListaProdutos(produtosFiltrados);
};

GerenciadorProdutos.prototype.atualizarListaProdutos = function(produtosParaExibir = null) {
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
                    <button class="btn-vender" onclick="gerenciadorProdutos.registrarVenda(${produto.id})">
                        <i class="fas fa-shopping-cart"></i> Vender
                    </button>
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
};

// Função para gerenciar relatórios
function RelatoriosEstoque() {
    this.relatoriosModal = document.getElementById('relatoriosModal');
    this.relatoriosBtn = document.getElementById('relatoriosBtn');
    this.gerenciadorProdutos = gerenciadorProdutos;

    this.inicializarEventos();
}

RelatoriosEstoque.prototype.inicializarEventos = function() {
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
};

RelatoriosEstoque.prototype.abrirModal = function() {
    this.relatoriosModal.style.display = 'block';
};

RelatoriosEstoque.prototype.fecharModal = function() {
    this.relatoriosModal.style.display = 'none';
};

RelatoriosEstoque.prototype.atualizarRelatorios = function() {
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
};

// Inicializar os gerenciadores
const autenticacao = new Autenticacao();
const gerenciadorProdutos = new GerenciadorProdutos();
const relatoriosEstoque = new RelatoriosEstoque(); 