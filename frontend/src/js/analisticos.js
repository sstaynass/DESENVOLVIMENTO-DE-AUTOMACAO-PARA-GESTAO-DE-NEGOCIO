// analisticos.js - Script para a página de analíticos/relatórios

document.addEventListener('DOMContentLoaded', async () => {
    // Navegação do menu
    document.querySelectorAll('button[data-nav]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const page = btn.getAttribute('data-nav');
            if (page && page !== 'analisticos.html') {
                window.location.href = page;
            }
        });
    });

    const btnCarregar = document.getElementById('btn-carregar-relatorio');
    const reportContainer = document.getElementById('report-container');
    const loadingMessage = document.getElementById('loading-message');
    const errorMessage = document.getElementById('error-message');

    // Carregar relatório automaticamente ao abrir a página
    await carregarRelatorio();

    btnCarregar.addEventListener('click', carregarRelatorio);

    async function carregarRelatorio() {
        btnCarregar.disabled = true;
        loadingMessage.style.display = 'block';
        errorMessage.style.display = 'none';
        reportContainer.innerHTML = '';

        try {
            const data = await window.API.buscarRelatorio();
            loadingMessage.style.display = 'none';
            exibirRelatorio(data);
        } catch (error) {
            console.error('Erro ao carregar relatório:', error);
            loadingMessage.style.display = 'none';
            errorMessage.innerHTML = `❌ Erro ao carregar relatório: ${error.message}`;
            errorMessage.style.display = 'block';
        } finally {
            btnCarregar.disabled = false;
        }
    }

    function exibirRelatorio(data) {
        if (!data || Object.keys(data).length === 0) {
            reportContainer.innerHTML = '<div class="message is-info"><div class="message-body">Nenhum relatório disponível ainda. Execute algumas automações primeiro.</div></div>';
            return;
        }

        let html = '<div class="report-container">';

        // Se for um array de itens
        if (Array.isArray(data)) {
            data.forEach((item, index) => {
                html += criarItemRelatorio(item, index);
            });
        } else {
            // Se for um objeto, exibir cada propriedade
            Object.entries(data).forEach(([key, value], index) => {
                html += criarItemRelatorio({ key, value }, index);
            });
        }

        html += '</div>';
        reportContainer.innerHTML = html;
    }

    function criarItemRelatorio(item, index) {
        const tipo = item.status || item.tipo || 'info';
        const titulo = item.titulo || item.name || item.key || `Item ${index + 1}`;
        const conteudo = item.conteudo || item.message || item.value || JSON.stringify(item, null, 2);

        return `
            <div class="report-item ${tipo}">
                <strong>${titulo}</strong>
                ${typeof conteudo === 'object' 
                    ? `<pre>${JSON.stringify(conteudo, null, 2)}</pre>` 
                    : `<p style="margin-top: 0.5rem;">${conteudo}</p>`
                }
                ${item.timestamp ? `<small style="color: #666;">${new Date(item.timestamp).toLocaleString('pt-BR')}</small>` : ''}
            </div>
        `;
    }
});

