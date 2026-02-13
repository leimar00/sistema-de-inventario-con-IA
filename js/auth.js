// AUTENTICACIÓN Y ROLES
const Auth = {
    checkRol() {
        const rol = localStorage.getItem('userRol') || 'admin';
        App.rolActual = rol;
    },

    cambiarRol() {
        App.rolActual = App.rolActual === 'admin' ? 'empleado' : 'admin';
        localStorage.setItem('userRol', App.rolActual);
        Notificaciones.show(`Rol: ${App.rolActual.toUpperCase()}`, 'success');
        Auth.updateBadge();
        Pages.updateVisibility();
    },

    updateBadge() {
        const badge = document.getElementById('rolBadge');
        if (badge) {
            badge.textContent = App.rolActual.toUpperCase();
            badge.className = `badge bg-${App.rolActual === 'admin' ? 'success' : 'info'}`;
        }
    },

    can(action) {
        const permisos = {
            admin: ['create', 'edit', 'delete', 'config'],
            empleado: ['read', 'movements']
        };
        return permisos[App.rolActual].includes(action) || App.rolActual === 'admin';
    }
};

function cambiarRol() { Auth.cambiarRol(); }
