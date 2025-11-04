// analisticos.js - Script para a página de analíticos/relatórios

let donutChart = null;
let lineChart = null;
let barChart = null;

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
    const chartsSection = document.getElementById('charts-section');

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
            
            // Processar dados para gráficos
            const reports = Array.isArray(data) ? data : (data ? [data] : []);
            
            if (reports.length > 0) {
                chartsSection.style.display = 'block';
                processarDadosParaGraficos(reports);
            } else {
                chartsSection.style.display = 'none';
            }
            
            exibirRelatorio(data);
        } catch (error) {
            console.error('Erro ao carregar relatório:', error);
            loadingMessage.style.display = 'none';
            errorMessage.innerHTML = `❌ Erro ao carregar relatório: ${error.message}`;
            errorMessage.style.display = 'block';
            chartsSection.style.display = 'none';
        } finally {
            btnCarregar.disabled = false;
        }
    }

    function processarDadosParaGraficos(reports) {
        // Processar dados cumulativos
        let totalSucesso = 0;
        let totalFalha = 0;
        const funcoesTentativas = {};
        const evolucaoTempo = [];
        
        reports.forEach((report, index) => {
            // Acumular sucessos e falhas
            totalSucesso += report.resumo?.funcoesSucesso || 0;
            totalFalha += report.resumo?.funcoesFalha || 0;
            
            // Acumular tentativas por função
            if (report.funcoes) {
                Object.values(report.funcoes).forEach(funcao => {
                    if (!funcoesTentativas[funcao.nome]) {
                        funcoesTentativas[funcao.nome] = 0;
                    }
                    funcoesTentativas[funcao.nome] += funcao.tentativas || 0;
                });
            }
            
            // Dados para gráfico de linha (evolução ao longo do tempo)
            const dataHora = report.dataHora ? new Date(report.dataHora) : new Date();
            evolucaoTempo.push({
                data: dataHora,
                label: `Execução ${index + 1}`,
                sucesso: report.resumo?.funcoesSucesso || 0,
                falha: report.resumo?.funcoesFalha || 0
            });
        });

        // Ordenar por data
        evolucaoTempo.sort((a, b) => a.data - b.data);

        // Criar gráficos
        criarGraficoDonut(totalSucesso, totalFalha);
        criarGraficoLinha(evolucaoTempo);
        criarGraficoBarras(funcoesTentativas);
    }

    function criarGraficoDonut(sucesso, falha) {
        const ctx = document.getElementById('donutChart');
        if (!ctx) return;

        // Destruir gráfico anterior se existir
        if (donutChart) {
            donutChart.destroy();
        }

        donutChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Sucesso', 'Falha'],
                datasets: [{
                    data: [sucesso, falha],
                    backgroundColor: ['#48c774', '#f14668'],
                    borderColor: ['#3aa85e', '#e8375f'],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: {
                                size: 12,
                                family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"
                            },
                            padding: 15
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed * 100) / total).toFixed(1);
                                return `${context.label}: ${context.parsed} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    function criarGraficoLinha(evolucao) {
        const ctx = document.getElementById('lineChart');
        if (!ctx) return;

        // Destruir gráfico anterior se existir
        if (lineChart) {
            lineChart.destroy();
        }

        const labels = evolucao.map((item, index) => `Exec ${index + 1}`);
        const sucessos = evolucao.map(item => item.sucesso);
        const falhas = evolucao.map(item => item.falha);

        lineChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Sucessos',
                    data: sucessos,
                    borderColor: '#48c774',
                    backgroundColor: 'rgba(72, 199, 116, 0.1)',
                    tension: 0.4,
                    fill: true
                }, {
                    label: 'Falhas',
                    data: falhas,
                    borderColor: '#f14668',
                    backgroundColor: 'rgba(241, 70, 104, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: {
                                size: 12,
                                family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"
                            },
                            padding: 15
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    function criarGraficoBarras(funcoesTentativas) {
        const ctx = document.getElementById('barChart');
        if (!ctx) return;

        // Destruir gráfico anterior se existir
        if (barChart) {
            barChart.destroy();
        }

        const funcoes = Object.keys(funcoesTentativas);
        const tentativas = Object.values(funcoesTentativas);

        barChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: funcoes,
                datasets: [{
                    label: 'Total de Tentativas',
                    data: tentativas,
                    backgroundColor: '#3273dc',
                    borderColor: '#2360d4',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Tentativas: ${context.parsed.y}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    },
                    x: {
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45,
                            font: {
                                size: 10
                            }
                        }
                    }
                }
            }
        });
    }

    function exibirRelatorio(data) {
        if (!data || (Array.isArray(data) && data.length === 0) || (!Array.isArray(data) && Object.keys(data).length === 0)) {
            reportContainer.innerHTML = '<div class="message is-info"><div class="message-body">Nenhum relatório disponível ainda. Execute algumas automações primeiro.</div></div>';
            return;
        }

        let html = '<div class="report-container">';
        const reports = Array.isArray(data) ? data : [data];

        reports.forEach((report, index) => {
            html += criarItemRelatorio(report, index);
        });

        html += '</div>';
        reportContainer.innerHTML = html;
    }

    function criarItemRelatorio(item, index) {
        const tipo = item.status || 'info';
        const dataHora = item.dataHora ? new Date(item.dataHora).toLocaleString('pt-BR') : 'Data não disponível';
        
        let funcoesHtml = '';
        if (item.funcoes) {
            funcoesHtml = '<ul style="margin-left: 1.5rem; margin-top: 0.5rem;">';
            Object.values(item.funcoes).forEach(funcao => {
                const statusIcon = funcao.status === 'sucesso' ? '✅' : '❌';
                funcoesHtml += `<li>${statusIcon} ${funcao.nome}: ${funcao.tentativas} tentativa(s)</li>`;
            });
            funcoesHtml += '</ul>';
        }

        return `
            <div class="report-item ${tipo}">
                <strong>${item.task || `Relatório ${index + 1}`}</strong>
                <p style="margin-top: 0.5rem;"><strong>Status:</strong> ${item.status === 'sucesso' ? '✅ Sucesso' : '❌ Falha'}</p>
                <p><strong>Data/Hora:</strong> ${dataHora}</p>
                ${item.resumo ? `
                    <p><strong>Resumo:</strong> ${item.resumo.funcoesSucesso || 0} sucesso(s), ${item.resumo.funcoesFalha || 0} falha(s)</p>
                ` : ''}
                ${funcoesHtml}
            </div>
        `;
    }
});

