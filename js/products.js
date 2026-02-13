// GESTIÓN DE PRODUCTOS
const Products = {
    getAll() {
        return Storage.load('INVENTARIO') || [];
    },

    save(producto) {
        let productos = this.getAll();
        const existe = productos.find(p => p.id === producto.id);
        
        if (existe) {
            const index = productos.findIndex(p => p.id === producto.id);
            productos[index] = { ...productos[index], ...producto };
        } else {
            productos.push(producto);
        }
        
        return Storage.save('INVENTARIO', productos);
    },

    delete(id) {
        let productos = this.getAll();
        productos = productos.filter(p => p.id !== id);
        return Storage.save('INVENTARIO', productos);
    },

    nuevo() {
        if (!Auth.can('create')) return;
        
        const form = document.getElementById('formProducto');
        const data = {
            id: Date.now().toString(),
            nombre: form.nombreProducto.value,
            categoria: form.categoriaProducto.value,
            cantidad: parseInt(form.cantidadProducto.value),
            fechaCreacion: new Date().toISOString()
        };

        if (this.save(data)) {
            Notificaciones.show('Producto creado', 'success');
            form.reset();
            Products.renderTable();
            document.getElementById('formProductoContainer').style.display = 'none';
            Estadisticas.update();
        }
    },

    renderTable() {
        const productos = this.getAll();
        const tbody = document.querySelector('#tablaInventario tbody') || document.querySelector('#productosTable tbody');
        if (!tbody) return;

        tbody.innerHTML = productos.map(producto => {
            const bajoStock = producto.cantidad <= CONFIG.STOCK_BAJO;
            const critico = producto.cantidad <= CONFIG.STOCK_CRITICO;
            
            return `
                <tr class="${critico ? 'stock-critico' : bajoStock ? 'stock-bajo' : ''}">
                    <td>${producto.id.slice(-6)}</td>
                    <td>${producto.nombre}</td>
                    <td><span class="badge bg-secondary">${producto.categoria}</span></td>
                    <td>
                        <strong class="${critico ? 'text-danger' : bajoStock ? 'text-warning' : 'text-success'}">
                            ${producto.cantidad}
                        </strong>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary me-1" onclick="Movimientos.abrir('${producto.id}', '${producto.nombre}')">
                            📊
                        </button>
                        ${Auth.can('edit') ? `
                            <button class="btn btn-sm btn-warning me-1" onclick="Products.editar('${producto.id}')">
                                ✏️
                            </button>
                        ` : ''}
                        ${Auth.can('delete') ? `
                            <button class="btn btn-sm btn-danger" onclick="Products.eliminar('${producto.id}', '${producto.nombre}')">
                                🗑️
                            </button>
                        ` : ''}
                    </td>
                </tr>
            `;
        }).join('');
    },

    editar(id) {
        const producto = this.getAll().find(p => p.id === id);
        if (!producto) return;

        document.getElementById('editId').value = id;
        document.getElementById('nombreProducto').value = producto.nombre;
        document.getElementById('categoriaProducto').value = producto.categoria;
        document.getElementById('cantidadProducto').value = producto.cantidad;
        document.getElementById('formProductoContainer').style.display = 'block';
    },

    eliminar(id, nombre) {
        if (confirm(`Eliminar "${nombre}"?`)) {
            this.delete(id);
            Notificaciones.show('Producto eliminado', 'warning');
            this.renderTable();
            Estadisticas.update();
        }
    }
};

function nuevoProducto() { Products.nuevo(); }
function editarProducto(id) { Products.editar(id); }
function eliminarProducto(id, nombre) { Products.eliminar(id, nombre); }
