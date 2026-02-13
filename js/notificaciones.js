// SISTEMA DE NOTIFICACIONES
const Notificaciones = {
    show(mensaje, tipo = 'info') {
        const toast = document.createElement('div');
        toast.className = `alert alert-${tipo} alert-dismissible fade show position-fixed`;
        toast.style.cssText = 'top: 100px; right: 20px; z-index: 9999; min-width: 300px;';
        toast.innerHTML = `
            ${mensaje}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 5000);
    }
};

function mostrarMensaje(msg, tipo) {
    Notificaciones.show(msg, tipo);
}
