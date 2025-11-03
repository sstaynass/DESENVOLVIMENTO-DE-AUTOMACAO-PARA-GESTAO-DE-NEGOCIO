// navigation.js - Script comum para navegação entre páginas

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('button[data-nav]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const page = btn.getAttribute('data-nav');
            if (!page) return;
            
            // Detectar página atual
            const currentPath = window.location.pathname;
            const currentPage = currentPath.split('/').pop() || 'index.html';
            const currentHash = window.location.hash;
            
            // Se a página destino é diferente da atual, navegar
            if (page !== currentPage) {
                window.location.href = page + currentHash;
            }
        });
    });
});

