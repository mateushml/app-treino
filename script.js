document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-exercicio');
    const exercicioInput = document.getElementById('exercicio');
    const detalhesInput = document.getElementById('detalhes');
    const listaTreinoHoje = document.getElementById('lista-treino-hoje');
    const historicoTreinosDiv = document.getElementById('historico-treinos');
    const dataAtualEl = document.getElementById('data-atual');
    const limparTudoBtn = document.getElementById('limpar-tudo');

    const hoje = new Date();
    const hojeString = hoje.toLocaleDateString('pt-BR');
    dataAtualEl.textContent = hojeString;

    // Carrega os treinos salvos do localStorage
    const carregarTreinos = () => {
        const treinos = JSON.parse(localStorage.getItem('diarioDeTreino')) || {};
        
        // Limpa as listas antes de recarregar
        listaTreinoHoje.innerHTML = '';
        historicoTreinosDiv.innerHTML = '';

        // Separa treino de hoje e histórico
        const treinoDeHoje = treinos[hojeString] || [];
        
        // Renderiza o treino de hoje
        if (treinoDeHoje.length > 0) {
            treinoDeHoje.forEach(ex => {
                const li = document.createElement('li');
                li.innerHTML = `<strong>${ex.nome}:</strong> ${ex.detalhes}`;
                listaTreinoHoje.appendChild(li);
            });
        } else {
            listaTreinoHoje.innerHTML = '<li>Nenhum exercício registrado hoje.</li>';
        }

        // Renderiza o histórico (outras datas)
        Object.keys(treinos).filter(data => data !== hojeString).forEach(data => {
            const treinosDoDia = treinos[data];
            if (treinosDoDia.length > 0) {
                const diaHeader = document.createElement('h3');
                diaHeader.textContent = data;
                historicoTreinosDiv.appendChild(diaHeader);

                const lista = document.createElement('ul');
                treinosDoDia.forEach(ex => {
                    const li = document.createElement('li');
                    li.innerHTML = `<strong>${ex.nome}:</strong> ${ex.detalhes}`;
                    lista.appendChild(li);
                });
                historicoTreinosDiv.appendChild(lista);
            }
        });
    };

    // Salva um novo exercício
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const nomeExercicio = exercicioInput.value.trim();
        const detalhesExercicio = detalhesInput.value.trim();

        if (nomeExercicio === '' || detalhesExercicio === '') {
            alert('Por favor, preencha todos os campos.');
            return;
        }

        const treinos = JSON.parse(localStorage.getItem('diarioDeTreino')) || {};
        
        if (!treinos[hojeString]) {
            treinos[hojeString] = [];
        }

        treinos[hojeString].push({ nome: nomeExercicio, detalhes: detalhesExercicio });
        localStorage.setItem('diarioDeTreino', JSON.stringify(treinos));

        form.reset();
        carregarTreinos();
    });

    // Limpa todo o histórico
    limparTudoBtn.addEventListener('click', () => {
        if (confirm('Tem certeza que deseja apagar TODO o seu histórico de treinos? Esta ação não pode ser desfeita.')) {
            localStorage.removeItem('diarioDeTreino');
            carregarTreinos();
        }
    });
    
    // Registra o Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/app-treino/service-worker.js') // ATENÇÃO AQUI
                .then(registration => console.log('Service Worker registrado com sucesso:', registration))
                .catch(err => console.error('Erro ao registrar Service Worker:', err));
        });
    }

    // Carrega os treinos ao iniciar a página
    carregarTreinos();
});