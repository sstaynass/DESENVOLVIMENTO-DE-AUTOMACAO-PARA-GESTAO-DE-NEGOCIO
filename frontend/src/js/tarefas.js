// tarefas.js - Script para a página de tarefas

document.addEventListener('DOMContentLoaded', () => {
    // Navegação do menu
    document.querySelectorAll('button[data-nav]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const page = btn.getAttribute('data-nav');
            if (page && page !== 'tarefas.html') {
                window.location.href = page;
            }
        });
    });

    const btnLimpar = document.getElementById('btn-limpar');
    const btnDisparar = document.getElementById('btn-disparar');
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notification-message');
    const container = document.querySelector('main');
    const progressContainer = document.getElementById('progress-container');
    const progressSteps = document.getElementById('progress-steps');

    // Mapeamento de rotinas para etapas
    const rotinasSteps = {
        'follow-up': [
            '🔍 Iniciando automação de follow up',
            '📡 Conectando ao sistema',
            '📝 Processando dados',
            '✅ Follow up concluído com sucesso'
        ],
        'notas-fiscais': [
            '🔍 Iniciando registro de notas fiscais',
            '📡 Conectando ao sistema',
            '📄 Validando notas fiscais',
            '💾 Salvando registros',
            '✅ Notas fiscais registradas com sucesso'
        ],
        'automacao-extra': [
            '🔍 Iniciando automação extra',
            '📡 Conectando ao sistema',
            '⚙️ Executando processos',
            '✅ Automação extra concluída com sucesso'
        ]
    };

    // Botão limpar seleção
    btnLimpar.addEventListener('click', () => {
        const checkboxes = document.querySelectorAll('input[name="rotinas"]');
        checkboxes.forEach(chk => {
            chk.checked = false;
            const rotinaItem = chk.closest('.rotina-item');
            if (rotinaItem) {
                rotinaItem.classList.remove('running', 'completed', 'error');
                const statusDiv = rotinaItem.querySelector('.rotina-status');
                if (statusDiv) {
                    statusDiv.style.display = 'none';
                    statusDiv.textContent = '';
                }
            }
        });
        notification.classList.remove('show');
        progressContainer.classList.remove('active');
        progressSteps.innerHTML = '';
    });

    // Botão disparar automações
    btnDisparar.addEventListener('click', async () => {
        const selected = [];
        document.querySelectorAll('input[name="rotinas"]:checked').forEach(chk => {
            selected.push(chk.value);
        });

        if (selected.length === 0) {
            showNotification('Selecione ao menos uma rotina para disparar a automação.', 'is-warning');
            return;
        }

        // Desabilitar botões
        btnDisparar.disabled = true;
        btnLimpar.disabled = true;
        container.classList.add('loading');

        // Limpar estado anterior
        progressContainer.classList.add('active');
        progressSteps.innerHTML = '';
        
        // Resetar status das rotinas
        selected.forEach(rotina => {
            const rotinaItem = document.querySelector(`.rotina-item[data-rotina="${rotina}"]`);
            if (rotinaItem) {
                rotinaItem.classList.remove('completed', 'error');
                rotinaItem.classList.add('running');
                const statusDiv = rotinaItem.querySelector('.rotina-status');
                if (statusDiv) {
                    statusDiv.style.display = 'block';
                    statusDiv.innerHTML = '<span class="spinner"></span> Executando...';
                }
            }
        });

        // Executar cada rotina sequencialmente
        let successCount = 0;
        let errorCount = 0;

        for (const rotina of selected) {
            try {
                await executarRotina(rotina);
                successCount++;
                
                const rotinaItem = document.querySelector(`.rotina-item[data-rotina="${rotina}"]`);
                if (rotinaItem) {
                    rotinaItem.classList.remove('running');
                    rotinaItem.classList.add('completed');
                    const statusDiv = rotinaItem.querySelector('.rotina-status');
                    if (statusDiv) {
                        statusDiv.innerHTML = '✅ Concluída com sucesso';
                    }
                }
            } catch (error) {
                errorCount++;
                console.error(`Erro na rotina ${rotina}:`, error);
                
                const rotinaItem = document.querySelector(`.rotina-item[data-rotina="${rotina}"]`);
                if (rotinaItem) {
                    rotinaItem.classList.remove('running');
                    rotinaItem.classList.add('error');
                    const statusDiv = rotinaItem.querySelector('.rotina-status');
                    if (statusDiv) {
                        statusDiv.innerHTML = '❌ Erro: ' + error.message;
                    }
                }
            }
        }

        // Mensagem final
        if (errorCount === 0) {
            showNotification(`✅ Todas as automações foram concluídas com sucesso! (${successCount} rotina${successCount > 1 ? 's' : ''})`, 'is-success');
        } else if (successCount > 0) {
            showNotification(`⚠️ ${successCount} automação${successCount > 1 ? 'ões' : ''} concluída${successCount > 1 ? 's' : ''}, ${errorCount} com erro.`, 'is-warning');
        } else {
            showNotification(`❌ Todas as automações falharam. Verifique os erros acima.`, 'is-danger');
        }

        // Reabilitar botões
        btnDisparar.disabled = false;
        btnLimpar.disabled = false;
        container.classList.remove('loading');
    });

    // Função para executar uma rotina com loading dinâmico
    async function executarRotina(rotina) {
        const steps = rotinasSteps[rotina] || [
            '🔍 Iniciando automação',
            '📡 Processando',
            '✅ Concluído'
        ];

        // Criar container de progresso para esta rotina
        const rotinaProgressDiv = document.createElement('div');
        rotinaProgressDiv.className = 'mb-4';
        rotinaProgressDiv.innerHTML = `<h4 class="is-size-6 mb-2">📋 ${getRotinaNome(rotina)}</h4>`;
        
        const stepsContainer = document.createElement('div');
        rotinaProgressDiv.appendChild(stepsContainer);
        progressSteps.appendChild(rotinaProgressDiv);

        // Criar steps
        const stepElements = steps.map((step, index) => {
            const stepDiv = document.createElement('div');
            stepDiv.className = 'progress-step';
            stepDiv.id = `step-${rotina}-${index}`;
            stepDiv.innerHTML = `<span class="spinner" style="display: none;"></span> ${step}`;
            stepsContainer.appendChild(stepDiv);
            return stepDiv;
        });

        // Determinar qual rota chamar baseado na rotina selecionada
        let requestPromise;
        if (rotina === 'follow-up') {
            // Chamar rota /search para Follow Up
            requestPromise = window.API.dispararAutomacao([rotina]);
        } else if (rotina === 'notas-fiscais') {
            // Chamar rota /reader para Notas Fiscais
            requestPromise = window.API.dispararReader([rotina]);
        } else {
            // Para outras rotinas, usar a rota padrão
            requestPromise = window.API.dispararAutomacao([rotina]);
        }

        // Simular progresso das etapas enquanto a requisição está rodando
        let requestCompleted = false;
        requestPromise.then(() => {
            requestCompleted = true;
        }).catch(() => {
            requestCompleted = true;
        });

        // Animar etapas
        // Ativar primeira etapa
        if (stepElements.length > 0) {
            stepElements[0].classList.add('active');
            const firstSpinner = stepElements[0].querySelector('.spinner');
            if (firstSpinner) firstSpinner.style.display = 'inline-block';
        }

        for (let i = 1; i < stepElements.length - 1; i++) {
            // Completar etapa anterior
            const prevStep = stepElements[i - 1];
            prevStep.classList.remove('active');
            prevStep.classList.add('completed');
            const prevSpinner = prevStep.querySelector('.spinner');
            if (prevSpinner) prevSpinner.style.display = 'none';
            prevStep.innerHTML = '✅ ' + prevStep.innerHTML.replace(/<span[^>]*>.*?<\/span>/, '').trim();

            // Ativar etapa atual
            const stepElement = stepElements[i];
            stepElement.classList.add('active');
            const spinner = stepElement.querySelector('.spinner');
            if (spinner) spinner.style.display = 'inline-block';

            // Tempo de cada etapa
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Aguardar requisição completar
        try {
            const response = await requestPromise;
            
            // Completar penúltima etapa (se houver)
            if (stepElements.length > 1) {
                const prevStep = stepElements[stepElements.length - 2];
                prevStep.classList.remove('active');
                prevStep.classList.add('completed');
                const prevSpinner = prevStep.querySelector('.spinner');
                if (prevSpinner) prevSpinner.style.display = 'none';
                prevStep.innerHTML = '✅ ' + prevStep.innerHTML.replace(/<span[^>]*>.*?<\/span>/, '').trim();
            }
            
            // Completar última etapa
            const lastStep = stepElements[stepElements.length - 1];
            if (lastStep) {
                lastStep.classList.remove('active');
                lastStep.classList.add('completed');
                const spinner = lastStep.querySelector('.spinner');
                if (spinner) spinner.style.display = 'none';
                lastStep.innerHTML = '✅ ' + lastStep.innerHTML.replace(/<span[^>]*>.*?<\/span>/, '').trim();
            }
            
            return response;
        } catch (error) {
            // Completar penúltima etapa antes de marcar erro na última
            if (stepElements.length > 1) {
                const prevStep = stepElements[stepElements.length - 2];
                prevStep.classList.remove('active');
                prevStep.classList.add('completed');
                const prevSpinner = prevStep.querySelector('.spinner');
                if (prevSpinner) prevSpinner.style.display = 'none';
                prevStep.innerHTML = '✅ ' + prevStep.innerHTML.replace(/<span[^>]*>.*?<\/span>/, '').trim();
            }
            
            // Marcar último step como erro se falhar
            const lastStep = stepElements[stepElements.length - 1];
            if (lastStep) {
                lastStep.classList.remove('completed', 'active');
                lastStep.classList.add('error');
                const spinner = lastStep.querySelector('.spinner');
                if (spinner) spinner.style.display = 'none';
                lastStep.innerHTML = '❌ Erro: ' + error.message;
            }
            throw error;
        }
    }

    function getRotinaNome(rotina) {
        const nomes = {
            'follow-up': 'Fazer Follow Up',
            'notas-fiscais': 'Registrar Notas Fiscais',
            'automacao-extra': 'Automação Extra'
        };
        return nomes[rotina] || rotina;
    }

    function showNotification(message, type) {
        notification.className = `notification ${type} show`;
        notificationMessage.innerHTML = message;
        
        // Auto-ocultar após 5 segundos para mensagens de sucesso
        if (type === 'is-success') {
            setTimeout(() => {
                notification.classList.remove('show');
            }, 5000);
        }
    }
});

