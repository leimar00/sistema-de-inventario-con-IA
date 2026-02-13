// NAVEGACIÓN ENTRE PÁGINAS
const Pages = {
    initNavigation() {
        // Actualizar todas las tablas al cargar
        document.addEventListener('DOMContentLoaded', () => {
            Products.renderTable();
            Movimientos.renderTable();
            Estadisticas.update();
        });

        // Pestañas
        document.querySelectorAll('.nav-link').forEach(tab => {
            tab.addEventListener('shown.bs.tab', (e) => {
                const target = e.target.getAttribute('data-bs-target');
                if (target === '#inventario') Products.renderTable();
                if (target === '#movimientos') Movimientos.renderTable();
                if (target === '#estadisticas') Estadisticas.update();
            });
        });

        // Formularios
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => e.preventDefault());
        });
    },

    updateVisibility() {
        document.querySelectorAll('[data-rol]').forEach(el => {
            el.style.display = Auth.can(el.dataset.rol) ? 'block' : 'none';
        });
    }
};
