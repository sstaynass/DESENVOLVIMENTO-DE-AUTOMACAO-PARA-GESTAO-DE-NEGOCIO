// api.js - Gerenciador de chamadas à API do backend

const API_BASE_URL = 'http://localhost:3333';

/**
 * Faz uma requisição POST para a API
 * @param {string} endpoint - Endpoint da API (ex: '/search', '/report')
 * @param {object} data - Dados a serem enviados (opcional)
 * @returns {Promise<object>} Resposta da API
 */
async function apiRequest(endpoint, data = null) {
    try {
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
            throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Erro na requisição para ${endpoint}:`, error);
        throw error;
    }
}

/**
 * Dispara uma automação de busca/scraping
 * @param {string[]} rotinas - Array com as rotinas selecionadas
 * @returns {Promise<object>} Resposta da API
 */
async function dispararAutomacao(rotinas) {
    return await apiRequest('/search', { rotinas });
}

/**
 * Busca o relatório de execução
 * @returns {Promise<object>} Dados do relatório
 */
async function buscarRelatorio() {
    return await apiRequest('/report');
}

// Exportar funções para uso global
window.API = {
    dispararAutomacao,
    buscarRelatorio,
    apiRequest
};

