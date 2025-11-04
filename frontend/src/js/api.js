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

        // Sempre enviar body, mesmo que vazio (Fastify requer body para POST)
        options.body = data ? JSON.stringify(data) : JSON.stringify({});

        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

        if (!response.ok) {
            let errorMessage = `Erro HTTP: ${response.status}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorMessage;
            } catch (e) {
                // Se não conseguir parsear JSON, usar mensagem padrão
                const text = await response.text().catch(() => '');
                errorMessage = text || errorMessage;
            }
            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error) {
        console.error(`Erro na requisição para ${endpoint}:`, error);
        throw error;
    }
}

/**
 * Dispara uma automação de busca/scraping (Follow Up)
 * @param {string[]} rotinas - Array com as rotinas selecionadas
 * @returns {Promise<object>} Resposta da API
 */
async function dispararAutomacao(rotinas) {
    return await apiRequest('/search', { rotinas });
}

/**
 * Dispara uma automação de registro de notas fiscais
 * @param {string[]} rotinas - Array com as rotinas selecionadas
 * @returns {Promise<object>} Resposta da API
 */
async function dispararReader(rotinas) {
    return await apiRequest('/reader', { rotinas });
}

/**
 * Busca o relatório de execução
 * @returns {Promise<object>} Dados do relatório
 */
async function buscarRelatorio() {
    // Usar GET para buscar relatório (não precisa enviar dados)
    try {
        const response = await fetch(`${API_BASE_URL}/report`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            let errorMessage = `Erro HTTP: ${response.status}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorMessage;
            } catch (e) {
                const text = await response.text().catch(() => '');
                errorMessage = text || errorMessage;
            }
            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error) {
        console.error('Erro na requisição para /report:', error);
        throw error;
    }
}

// Exportar funções para uso global
window.API = {
    dispararAutomacao,
    dispararReader,
    buscarRelatorio,
    apiRequest
};

