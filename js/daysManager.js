// ==========================================
// 📅 GESTOR DE REINICIO DE DÍAS - EL TRIUNFO
// ==========================================
// Permite al admin guardar estadísticas del día
// y reiniciar el contador de ventas/movimientos

const DaysManager = {
    // Obtener todos los registros de días anteriores
    getAllDays() {
        try {
            const historiaDias = localStorage.getItem('historial_dias_el_triunfo');
            return historiaDias ? JSON.parse(historiaDias) : [];
        } catch (e) {
            console.error('❌ Error leyendo historial días:', e);
            return [];
        }
    },

    // Obtener el registro del día especificado (formato: 2026-02-12)
    getDayByDate(fecha) {
        const dias = this.getAllDays();
        return dias.find(d => d.fecha === fecha);
    },

    // Calcular estadísticas del día actual
    calculateTodayStats() {
        // 📚 Leer datos del localStorage
        const inventario = JSON.parse(localStorage.getItem('inventario_el_triunfo')) || [];
        const ventasRegistradas = JSON.parse(localStorage.getItem('ventas_el_triunfo')) || [];
        
        const hoy = new Date().toISOString().split('T')[0]; // Formato: 2026-02-12
        
        console.log('📅 DaysManager.calculateTodayStats()');
        console.log('   Inventario:', inventario.length, 'productos');
        console.log('   Ventas registradas:', ventasRegistradas.length);
        
        // 📊 Filtrar ventas de hoy
        const ventasHoy = ventasRegistradas.filter(v => {
            const fechaVenta = new Date(v.fecha).toISOString().split('T')[0];
            return fechaVenta === hoy;
        });

        console.log('   Ventas de hoy (' + hoy + '):', ventasHoy.length);

        // 💰 Calcular totales
        let totalVentasHoy = 0;
        let gananciasHoy = 0;
        const productosPorVender = {};

        ventasHoy.forEach(venta => {
            totalVentasHoy += venta.total || 0;
            const ganancia = (venta.total || 0) - (venta.cantidad * venta.precioCompra);
            gananciasHoy += ganancia;

            // Agrupar productos vendidos
            if (!productosPorVender[venta.productoId]) {
                productosPorVender[venta.productoId] = {
                    id: venta.productoId,
                    nombre: venta.productoNombre,
                    cantidadVendida: 0,
                    totalVendido: 0
                };
            }
            productosPorVender[venta.productoId].cantidadVendida += venta.cantidad;
            productosPorVender[venta.productoId].totalVendido += (venta.total || 0);
        });

        const stats = {
            fecha: hoy,
            totalVentas: totalVentasHoy,
            ganancias: gananciasHoy,
            cantidadTransacciones: ventasHoy.length,
            totalProductosVendidos: Object.values(productosPorVender).reduce((sum, p) => sum + p.cantidadVendida, 0),
            productosVendidos: Object.values(productosPorVender),
            productosMasVendidosPorCategoria: this.calcularMasVendidosPorCategoria(ventasHoy, inventario),
            registradoEn: new Date().toISOString()
        };
        
        console.log('✅ Stats calculados:', stats);
        return stats;
    },

    // Calcular producto más vendido por cada categoría
    calcularMasVendidosPorCategoria(ventasHoy, inventario) {
        // Agrupar ventas por categoría y producto
        const productosPorCategoria = {};

        ventasHoy.forEach(venta => {
            const producto = inventario.find(p => p.id === venta.productoId);
            if (producto) {
                const categoria = producto.categoria;
                
                // Crear categoría si no existe
                if (!productosPorCategoria[categoria]) {
                    productosPorCategoria[categoria] = {};
                }
                
                // Crear producto en categoría si no existe
                if (!productosPorCategoria[categoria][venta.productoId]) {
                    productosPorCategoria[categoria][venta.productoId] = {
                        nombre: venta.productoNombre,
                        cantidad: 0,
                        total: 0
                    };
                }
                
                // Acumular ventas del producto
                productosPorCategoria[categoria][venta.productoId].cantidad += venta.cantidad;
                productosPorCategoria[categoria][venta.productoId].total += venta.total || 0;
            }
        });

        // Buscar el producto MÁS VENDIDO de cada categoría
        const resultado = [];
        Object.entries(productosPorCategoria).forEach(([categoria, productos]) => {
            // Encontrar el producto con mayor cantidad vendida
            let productoMasVendido = null;
            let maxCantidad = 0;
            
            Object.entries(productos).forEach(([prodId, prodData]) => {
                if (prodData.cantidad > maxCantidad) {
                    maxCantidad = prodData.cantidad;
                    productoMasVendido = prodData;
                }
            });
            
            if (productoMasVendido) {
                resultado.push({
                    categoria,
                    producto: productoMasVendido.nombre,
                    cantidad: productoMasVendido.cantidad,
                    total: productoMasVendido.total
                });
            }
        });

        // Ordenar por cantidad vendida descendente
        return resultado.sort((a, b) => b.cantidad - a.cantidad);
    },

    // 🔄 REINICIAR EL DÍA - Guardar stats y limpiar movimientos
    reiniciarDia() {
        console.log('🔄 reiniciarDia() iniciado...');
        
        // Verificar permisos
        const userRol = localStorage.getItem('userRol');
        console.log('   User rol:', userRol);
        
        if (userRol !== 'admin') {
            alert('❌ Solo el administrador puede reiniciar el día');
            console.warn('❌ Intento de reinicio sin permisos admin');
            return false;
        }

        // Confirmar operación crítica
        const hoy = new Date().toLocaleDateString('es-CO', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        if (!confirm(`⚠️ ¿REINICIAR DÍA: ${hoy}?\n\n✅ MANTIENE: Productos y Stocks\n❌ LIMPIA: Movimientos y Ventas del día\n\n¿Deseas continuar?`)) {
            console.log('❌ Reinicio cancelado por usuario');
            return false;
        }

        try {
            // 1️⃣ Calcular y guardar estadísticas del día actual
            console.log('1️⃣ Calculando estadísticas...');
            const statsHoy = this.calculateTodayStats();
            
            let historiaDias = this.getAllDays();
            console.log('   Días en historial:', historiaDias.length);
            
            // No guardar si ya existe el día (evitar duplicados)
            if (!this.getDayByDate(statsHoy.fecha)) {
                historiaDias.unshift(statsHoy);
                historiaDias = historiaDias.slice(0, 365);
                
                // ✅ GUARDAR EN LOCALSTORAGE
                localStorage.setItem('historial_dias_el_triunfo', JSON.stringify(historiaDias));
                console.log('✅ Historial guardado. Total días: ' + historiaDias.length);
            } else {
                console.log('⚠️ Este día ya fue registrado');
            }

            // 2️⃣ Limpiar ventas y movimientos del día
            console.log('2️⃣ Limpiando ventas y movimientos...');
            localStorage.setItem('ventas_el_triunfo', JSON.stringify([]));
            localStorage.setItem('movimientos_el_triunfo', JSON.stringify([]));
            console.log('✅ Ventas y movimientos limpiados');

            // 3️⃣ Guardar fecha de reinicio
            console.log('3️⃣ Registrando fecha de reinicio...');
            localStorage.setItem('fecha_ultimo_reinicio_el_triunfo', new Date().toISOString());
            console.log('✅ Fecha guardada');

            // 4️⃣ Mostrar confirmación
            alert(`✅ DÍA REINICIADO EXITOSAMENTE\n\nVentas: $${statsHoy.totalVentas.toLocaleString()}\nGanancias: $${statsHoy.ganancias.toLocaleString()}\nTransacciones: ${statsHoy.cantidadTransacciones}`);
            console.log('📅 Estadísticas finales:', statsHoy);
            
            // Recargar página para reflejar cambios
            console.log('🔄 Recargando página...');
            setTimeout(() => window.location.href = 'dashboard.html', 1000);
            
            return true;
        } catch (error) {
            console.error('❌ Error en reiniciarDia:', error);
            alert('❌ Error: ' + error.message);
            return false;
        }
    },

    // 📊 Obtener estadísticas del día anterior
    getYesterdayStats() {
        const historiaDias = this.getAllDays();
        if (historiaDias.length === 0) return null;
        
        return historiaDias[0]; // Primer elemento es el más reciente
    },

    // 📈 Obtener top productos del día anterior
    getTopProductsYesterday(limit = 5) {
        const stats = this.getYesterdayStats();
        if (!stats || stats.productosVendidos.length === 0) return [];
        
        return stats.productosVendidos
            .sort((a, b) => b.cantidadVendida - a.cantidadVendida)
            .slice(0, limit);
    }
};
