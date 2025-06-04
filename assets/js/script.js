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

        // Eventos das abas do relatório
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                this.trocarAbaRelatorio(tab);
            });
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
    }

    buscarProdutos() {
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
    }

    filtrarProdutos(tipo, valor) {
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

    registrarVenda(id) {
        const produto = this.produtos.find(p => p.id === id);
        if (!produto) return;

        document.getElementById('vendaProdutoId').value = id;
        document.getElementById('vendaQuantidade').value = 1;
        document.getElementById('vendaValor').value = produto.preco;
        document.getElementById('vendaTotal').value = produto.preco;

        this.abrirModal(this.vendaModal);
    }

    incrementarQuantidadeVenda() {
        const input = document.getElementById('vendaQuantidade');
        const valorAtual = parseInt(input.value) || 0;
        const produto = this.produtos.find(p => p.id === parseInt(document.getElementById('vendaProdutoId').value));
        
        if (valorAtual < produto.quantidade) {
            input.value = valorAtual + 1;
            this.atualizarValorTotalVenda();
        }
    }

    decrementarQuantidadeVenda() {
        const input = document.getElementById('vendaQuantidade');
        const valorAtual = parseInt(input.value) || 0;
        if (valorAtual > 1) {
            input.value = valorAtual - 1;
            this.atualizarValorTotalVenda();
        }
    }

    atualizarValorTotalVenda() {
        const quantidade = parseInt(document.getElementById('vendaQuantidade').value) || 0;
        const valorUnitario = parseFloat(document.getElementById('vendaValor').value) || 0;
        document.getElementById('vendaTotal').value = (quantidade * valorUnitario).toFixed(2);
    }

    confirmarVenda() {
        const id = parseInt(document.getElementById('vendaProdutoId').value);
        const quantidade = parseInt(document.getElementById('vendaQuantidade').value);
        const valorUnitario = parseFloat(document.getElementById('vendaValor').value);
        const valorTotal = parseFloat(document.getElementById('vendaTotal').value);

        const produto = this.produtos.find(p => p.id === id);
        if (!produto || produto.quantidade < quantidade) {
            alert('Quantidade insuficiente em estoque!');
            return;
        }

        // Atualizar estoque
        produto.quantidade -= quantidade;
        this.salvarProdutos();

        // Registrar venda
        const venda = {
            id: Date.now(),
            produtoId: id,
            produtoNome: produto.nome,
            quantidade,
            valorUnitario,
            valorTotal,
            data: new Date().toISOString()
        };
        this.vendas.push(venda);
        localStorage.setItem('vendas', JSON.stringify(this.vendas));

        this.fecharModal(this.vendaModal);
        this.atualizarListaProdutos();
        alert('Venda registrada com sucesso!');
    }

    trocarAbaRelatorio(tab) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });

        document.querySelectorAll('.relatorio-tab').forEach(tabEl => {
            tabEl.classList.toggle('active', tabEl.id === `relatorio${tab.charAt(0).toUpperCase() + tab.slice(1)}`);
        });

        if (tab === 'vendas') {
            this.atualizarRelatorioVendas();
        }
    }

    atualizarRelatorioVendas() {
        const hoje = new Date();
        const inicioDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
        const inicioSemana = new Date(hoje.setDate(hoje.getDate() - hoje.getDay()));
        const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

        const vendasDia = this.vendas.filter(v => new Date(v.data) >= inicioDia);
        const vendasSemana = this.vendas.filter(v => new Date(v.data) >= inicioSemana);
        const vendasMes = this.vendas.filter(v => new Date(v.data) >= inicioMes);

        // Atualizar totais
        document.getElementById('totalVendasDia').textContent = vendasDia.reduce((acc, v) => acc + v.quantidade, 0);
        document.getElementById('valorVendasDia').textContent = vendasDia.reduce((acc, v) => acc + v.valorTotal, 0).toFixed(2);

        document.getElementById('totalVendasSemana').textContent = vendasSemana.reduce((acc, v) => acc + v.quantidade, 0);
        document.getElementById('valorVendasSemana').textContent = vendasSemana.reduce((acc, v) => acc + v.valorTotal, 0).toFixed(2);

        document.getElementById('totalVendasMes').textContent = vendasMes.reduce((acc, v) => acc + v.quantidade, 0);
        document.getElementById('valorVendasMes').textContent = vendasMes.reduce((acc, v) => acc + v.valorTotal, 0).toFixed(2);

        // Atualizar produtos mais vendidos
        const produtosMaisVendidos = this.vendas.reduce((acc, venda) => {
            const index = acc.findIndex(p => p.produtoId === venda.produtoId);
            if (index === -1) {
                acc.push({
                    produtoId: venda.produtoId,
                    nome: venda.produtoNome,
                    quantidade: venda.quantidade,
                    valorTotal: venda.valorTotal
                });
            } else {
                acc[index].quantidade += venda.quantidade;
                acc[index].valorTotal += venda.valorTotal;
            }
            return acc;
        }, []).sort((a, b) => b.quantidade - a.quantidade).slice(0, 5);

        const produtosMaisVendidosHtml = produtosMaisVendidos.map(produto => `
            <div class="produto-vendido">
                <div class="produto-vendido-info">
                    <span class="produto-vendido-nome">${produto.nome}</span>
                    <span class="produto-vendido-quantidade">Quantidade: ${produto.quantidade}</span>
                </div>
                <span class="produto-vendido-valor">R$ ${produto.valorTotal.toFixed(2)}</span>
            </div>
        `).join('');

        document.getElementById('produtosMaisVendidos').innerHTML = produtosMaisVendidosHtml;
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