// CONFIGURACIÓN GLOBAL - EL TRIUNFO
const CONFIG = {
    APP_NAME: 'El Triunfo Inventario',
    VERSION: '1.0.0',
    CATEGORIAS_DEFAULT: ['Bebidas', 'Lácteos', 'Frutas', 'Verduras', 'Carnes', 'Panadería', 'Abarrote'],
    STOCK_BAJO: 5,
    STOCK_CRITICO: 2,
    MAX_MOVIMIENTOS: 100
};

// Clase principal del sistema
class SistemaInventario {
    constructor() {
        this.rolActual = 'admin';
        this.categorias = CONFIG.CATEGORIAS_DEFAULT;
        this.init();
    }

    init() {
        Storage.loadAll();
        Auth.checkRol();
        Pages.initNavigation();
        this.updateUI();
    }

    updateUI() {
        Auth.updateBadge();
        Products.renderTable();
        Estadisticas.updateCards();
    }
}

// Instancia global
const App = new SistemaInventario();
