// GESTIÓN LOCALSTORAGE
const Storage = {
    KEYS: {
        INVENTARIO: 'inventario_el_triunfo',
        MOVIMIENTOS: 'movimientos_el_triunfo',
        CATEGORIAS: 'categorias_el_triunfo',
        USER_ROL: 'userRol',
        VENTAS: 'ventas_el_triunfo',
        HISTORIAL_DIAS: 'historial_dias_el_triunfo',
        FECHA_ULTIMO_DIA: 'fecha_ultimo_dia_el_triunfo'
    },

    save(key, data) {
        try {
            localStorage.setItem(this.KEYS[key], JSON.stringify(data));
            return true;
        } catch (e) {
            Notificaciones.show('Error guardando datos', 'danger');
            return false;
        }
    },

    load(key) {
        try {
            const data = localStorage.getItem(this.KEYS[key]);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            return null;
        }
    },

    loadAll() {
        App.categorias = this.load('CATEGORIAS') || CONFIG.CATEGORIAS_DEFAULT;
        Storage.save('CATEGORIAS', App.categorias);
    },

    clearAll() {
        Object.values(this.KEYS).forEach(key => localStorage.removeItem(key));
        location.reload();
    }
};
