document.addEventListener('DOMContentLoaded', () => {
    // Elementos do formulário
    const form = document.getElementById('form-treino');
    const formTitle = document.getElementById('form-title');
    const treinoIdInput = document.getElementById('treino-id');
    const dataInput = document.getElementById('treino-data');
    const tipoInput = document.getElementById('treino-tipo');
    const tempoInput = document.getElementById('treino-tempo');
    const saveBtn = document.getElementById('save-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');

    // Elemento do histórico
    const historicoDiv = document.getElementById('historico-treinos');

    // Define a data de hoje como padrão no campo de data
    dataInput.valueAsDate = new Date();

    // Função para carregar treinos do localStorage
    const getTreinos = () => JSON.parse(localStorage.getItem('calendarioDeTreino')) || [];

    // Função para salvar treinos no localStorage
    const saveTreinos = (treinos) => localStorage.setItem('calendarioDeTreino', JSON.stringify(treinos));

    // Função para renderizar/mostrar os treinos na tela
    const renderizarTreinos = () => {
        const treinos = getTreinos();
        // Ordena os treinos pela data, do mais recente para o mais antigo
        treinos.sort((a, b) => new Date(b.data) - new Date(a.data));

        historicoDiv.innerHTML = ''; // Limpa a visualização atual

        if (treinos.length === 0) {
            historicoDiv.innerHTML = '<p>Nenhum treino registrado ainda.</p>';
            return;
        }

        treinos.forEach(treino => {
            const dataFormatada = new Date(treino.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
            
            const logItem = document.createElement('div');
            logItem.className = 'log-item';
            logItem.innerHTML = `
                <div class="log-date">${dataFormatada}</div>
                <div class="log-details">
                    <span class="log-tipo" data-tipo="${treino.tipo}">${treino.tipo}</span>
                    <span>${treino.tempo} min</span>
                </div>
                <div class="log-actions">
                    <button class="edit-btn" data-id="${treino.id}">✏️</button>
                    <button class="delete-btn" data-id="${treino.id}">🗑️</button>
                </div>
            `;
            historicoDiv.appendChild(logItem);
        });
    };

    // Função para entrar no modo de edição
    const entrarModoEdicao = (id) => {
        const treinos = getTreinos();
        const treinoParaEditar = treinos.find(t => t.id === id);

        if (treinoParaEditar) {
            treinoIdInput.value = treinoParaEditar.id;
            dataInput.value = treinoParaEditar.data;
            tipoInput.value = treinoParaEditar.tipo;
            tempoInput.value = treinoParaEditar.tempo;
            
            formTitle.textContent = "Editar Treino";
            saveBtn.textContent = "Atualizar";
            cancelEditBtn.classList.remove('hidden');
            
            // Rola a tela para o topo para ver o formulário
            window.scrollTo(0, 0);
        }
    };

    // Função para sair do modo de edição
    const sairModoEdicao = () => {
        form.reset();
        dataInput.valueAsDate = new Date(); // Reseta para a data de hoje
        treinoIdInput.value = '';
        formTitle.textContent = "Registrar Treino";
        saveBtn.textContent = "Salvar Treino";
        cancelEditBtn.classList.add('hidden');
    };

    // Evento de envio do formulário (para salvar ou atualizar)
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const id = treinoIdInput.value;
        const treino = {
            data: dataInput.value,
            tipo: tipoInput.value,
            tempo: tempoInput.value
        };

        let treinos = getTreinos();

        if (id) { // Se tem ID, está atualizando
            treinos = treinos.map(t => t.id === Number(id) ? { ...t, ...treino } : t);
        } else { // Senão, está criando um novo
            treino.id = Date.now(); // Cria um ID único baseado no tempo
            treinos.push(treino);
        }

        saveTreinos(treinos);
        sairModoEdicao();
        renderizarTreinos();
    });

    // Eventos para os botões de editar e deletar
    historicoDiv.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        if (!id) return;

        if (e.target.classList.contains('delete-btn')) {
            if (confirm('Tem certeza que deseja apagar este registro?')) {
                let treinos = getTreinos();
                treinos = treinos.filter(t => t.id !== Number(id));
                saveTreinos(treinos);
                renderizarTreinos();
            }
        } else if (e.target.classList.contains('edit-btn')) {
            entrarModoEdicao(Number(id));
        }
    });

    // Evento para o botão de cancelar edição
    cancelEditBtn.addEventListener('click', sairModoEdicao);

    // Registra o Service Worker (não precisa alterar)
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/app-treino/service-worker.js')
                .then(r => console.log('Service worker registrado'))
                .catch(e => console.error('Erro no registro do SW:', e));
        });
    }

    // Renderiza os treinos quando a página carrega
    renderizarTreinos();
});