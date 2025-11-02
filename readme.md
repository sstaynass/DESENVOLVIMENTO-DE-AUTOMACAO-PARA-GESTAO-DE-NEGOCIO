Bot Employee - Plugin Chrome para Automação Operacional e BI
Este projeto implementa um plugin para navegador Chrome capaz de automatizar tarefas operacionais, manipular formulários web via Selenium, e gerar relatórios de execução para atividades de BI, com tolerância a falhas e política de retry.

Funcionalidades Principais
Automação de envio de formulários: Preenche campos automaticamente em sistemas web corporativos ou Google Forms, utilizando Selenium WebDriver.

Arquitetura tolerante a falhas: Implementa múltiplas tentativas (retry) em cada etapa do fluxo, reduzindo falhas devido à latência, conexões instáveis ou manutenção dos sites-alvo.

Relatórios detalhados: Gera relatórios JSON completos a cada tarefa, registrando sucesso, falhas e tentativas.

Integração backend: Backend Fastify para expor rotas REST, viabilizando integração com outras aplicações.

Seleção de elementos via JSON: Customização dos seletores dos elementos a serem manipulados, facilitando manutenção e evolução do fluxo.

Estrutura do Projeto
text
├── backend/
│   ├── class/
│   │   ├── primitive.ts
│   │   ├── retryToolkit.ts
│   │   ├── retryToolkitWithReport.ts
│   │   ├── seleniumSingleton.ts
│   │   ├── loadSelector.ts
│   ├── routes/
│   │   ├── search.ts
│   │   ├── report.ts
│   ├── src/
│   │   ├── server.ts
│   │   ├── biome.json
│   ├── map.json
├── frontend/
│   ├── src/
│   │   ├── asset/
│   │   ├── html/
│   │   │   ├── index.html
│   │   ├── js/
│   ├── manifest.json
│   ├── package.json
└── README.md

backend/: Lógica de negócios, automações e API REST.

frontend/: Interface do plugin, arquivos HTML, JS e manifest Chrome.

map.json: Configuração dos seletores dos elementos manipulados.

README.md: Esta documentação.

Instalação e Execução
Requisitos
Node.js >= 20.x

Navegador Chrome ou Microsoft Edge

Docker (opcional, recomendado para ambiente padronizado)

Instalação local
bash
git clone https://github.com/seuusuario/nome-do-repositorio.git
cd nome-do-repositorio
cd backend
npm install
npm run build
npm start
# Para usar Docker (opcional)
docker-compose up --build
Instalação como Plugin Chrome
Abra o Chrome em chrome://extensions.

Ative o modo "Desenvolvedor".

Clique em "Carregar sem compactação" e selecione a pasta frontend/src.

Uso
Após instalar o plugin, você verá o menu principal (index.html) com opções de navegação e instruções para operação. As tarefas podem ser disparadas manualmente ou automatizadas via backend Fastify.

Requisitos mínimos para execução:

Conexão com a internet de pelo menos 10MB.

Sites-alvo sem manutenção no momento da execução.

API Backend
Exemplo de rota de automação:
POST /search
Dispara um fluxo de preenchimento e envio de formulário, retorna mensagem e relatório de resultado (scraper).

Exemplo de rota de relatório:
POST /report
Retorna último relatório de execução gerado.

Arquitetura Técnica
Selenium WebDriver: Usado para manipulação dos elementos no navegador, via classe Primitive.

Retry Toolkit: Políticas de tentativas automáticas configurable via retryToolkit.ts e retryToolkitWithReport.ts.

Fastify: Framework do Node para rotas backend.

Seletores de Elementos: Configurados via map.json, carregados dinamicamente por loadSelector.ts.

Customização
Seletores: Editar map.json para atualizar os campos que o robô deve manipular.

Fluxo de Tarefas: Modificar os arquivos de classe (primitive.ts, search.ts, etc.).

Relatórios: Output configurável em JSON para facilitar integração com BI.

Contribuição
Sugestões de melhoria, bug reports e pull requests são bem-vindos.
Para colaboração, seguir boas práticas de Git e abrir issues detalhadas.

Contato
Problemas ou dúvidas?
Email para suporte: vinifreitass20@gmail.com

Licença
Esse projeto está sob os termos da licença MIT.