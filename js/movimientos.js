// MOVIMIENTOS DE INVENTARIO
const Movimientos = {
    getAll() {
        return Storage.load('MOVIMIENTOS') || [];
    },

    registrar(tipo, idProducto, nombreProducto, cantidad, motivo = '') {
        const inventario = Products.getAll();
        const productoIndex = inventario.findIndex(p => p.id === idProducto);
        
        if (productoIndex === -1) return false;

        // Validar stock salida
        if (tipo === 'salida' && inventario[productoIndex].cantidad < cantidad) {
            Notificaciones.show('¡Stock insuficiente!', 'danger');
            return false;
        }

        // Actualizar stock
        inventario[productoIndex].cantidad += tipo === 'entrada' ? cantidad : -cantidad;
        Products.save(inventario[productoIndex]);

        // Guardar movimiento
        const movimiento = {
            id: Date.now().toString(),
            productoId: idProducto,
            productoNombre: nombreProducto,
            tipo,
            cantidad,
            motivo,
            usuario: App.rolActual,
            fecha: new Date().toISOString()
        };

        let movimientos = this.getAll();
        movimientos.unshift(movimiento);
        movimientos = movimientos.slice(0, CONFIG.MAX_MOVIMIENTOS);
        
        Storage.save('INVENTARIO', inventario);
        Storage.save('MOVIMIENTOS', movimientos);
        
        Notificaciones.show(`${tipo.toUpperCase()} registrada`, 'success');
        return true;
    },

    abrir(idProducto, nombreProducto) {
        document.getElementById('movProductoId').value = idProducto;
        document.getElementById('movProductoNombre').value = nombreProducto;
        new bootstrap.Modal(document.getElementById('modalMovimiento')).show();
    },

    renderTable() {
        const movimientos = this.getAll();
        const tbody = document.querySelector('#tablaMovimientos tbody');
        if (!tbody) return;

        tbody.innerHTML = movimientos.slice(0, 50).map(mov => {
            const fecha = new Date(mov.fecha).toLocaleString('es-CO');
            return `
                <tr>
                    <td>${fecha}</td>
                    <td><span class="badge bg-${mov.tipo === 'entrada' ? 'success' : 'danger'}">${mov.tipo.toUpperCase()}</span></td>
                    <td>${mov.productoNombre}</td>
                    <td>${mov.cantidad}</td>
                    <td><span class="badge bg-${mov.usuario === 'admin' ? 'dark' : 'info'}">${mov.usuario}</span></td>
                </tr>
            `;
        }).join('');
    }
};

function guardarMovimiento() {
    const tipo = document.getElementById('tipoMovimiento').value;
    const cantidad = parseInt(document.getElementById('cantidadMovimiento').value);
    const idProducto = document.getElementById('movProductoId').value;
    const nombreProducto = document.getElementById('movProductoNombre').value;
    
    Movimientos.registrar(tipo, idProducto, nombreProducto, cantidad);
    
    bootstrap.Modal.getInstance(document.getElementById('modalMovimiento')).hide();
    document.getElementById('formMovimiento').reset();
    
    Products.renderTable();
    Movimientos.renderTable();
    Estadisticas.update();
}
