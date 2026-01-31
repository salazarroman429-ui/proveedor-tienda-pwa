// app.js - Versión completa actualizada (tienda)
const API_URL = 'https://proveedor-api-salazar.onrender.com/api';
let deferredPrompt;
let isAuthenticated = false;
let currentStore = null;
let authHeaders = {};

// Elementos del DOM
const loginContainer = document.getElementById('loginContainer');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');
const breadcrumb = document.getElementById('breadcrumb');
const mainContent = document.getElementById('mainContent');

// Login de la tienda
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch(`${API_URL}/tienda/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            isAuthenticated = true;
            currentStore = data.store;
            authHeaders = { 
                username: username, 
                password: password 
            };
            
            // Mostrar dashboard
            loginContainer.style.display = 'none';
            dashboard.style.display = 'block';
            
            // Cargar vista principal
            loadHomeView();
            checkConnection();
            
            // Iniciar actualizaciones periódicas
            startPeriodicUpdates();
            
            // Guardar credenciales en localStorage
            localStorage.setItem('tienda_credentials', JSON.stringify({
                username,
                password,
                store: currentStore
            }));
        } else {
            showError(loginError, data.error || 'Credenciales incorrectas');
        }
    } catch (error) {
        showError(loginError, 'Error de conexión con el servidor');
    }
});

// Logout
logoutBtn.addEventListener('click', () => {
    isAuthenticated = false;
    currentStore = null;
    authHeaders = {};
    dashboard.style.display = 'none';
    loginContainer.style.display = 'block';
    document.getElementById('loginPassword').value = '';
    
    // Limpiar contenido
    breadcrumb.innerHTML = '<span class="breadcrumb-item active" data-action="home">Inicio</span>';
    mainContent.innerHTML = '';
    
    // Limpiar localStorage
    localStorage.removeItem('tienda_credentials');
});

// Verificar conexión con proveedor
async function checkConnection() {
    if (!isAuthenticated) return;
    
    try {
        const response = await fetch(`${API_URL}/status`);
        const statusElement = document.getElementById('status');
        const statusText = statusElement.querySelector('span');
        
        if (response.ok) {
            statusElement.className = 'status-badge online';
            statusText.textContent = 'Conectado al Proveedor';
            return true;
        }
    } catch (error) {
        const statusElement = document.getElementById('status');
        const statusText = statusElement.querySelector('span');
        statusElement.className = 'status-badge offline';
        statusText.textContent = 'Desconectado del Proveedor';
        return false;
    }
}

// Función para mostrar errores
function showError(element, message) {
    element.textContent = message;
    element.style.display = 'block';
    setTimeout(() => {
        element.style.display = 'none';
    }, 3000);
}

// Cargar vista principal
function loadHomeView() {
    console.log('Cargando vista principal...');
    
    if (!breadcrumb || !mainContent) {
        console.error('Elementos del DOM no encontrados');
        return;
    }
    
    breadcrumb.innerHTML = '<span class="breadcrumb-item active" data-action="home">Inicio</span>';
    
    mainContent.innerHTML = `
        <div class="store-info-card">
            <div class="store-header">
                <h3><i class="fas fa-store-alt"></i> ${currentStore.storename}</h3>
                <div class="store-status active">Conectada</div>
            </div>
            <p><i class="fas fa-user"></i> Usuario: ${currentStore.username}</p>
            <p><i class="fas fa-calendar"></i> Último acceso: ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div class="grid-container">
            <div class="grid-card" data-action="mi-almacen" onclick="window.loadMiAlmacenView()">
                <i class="fas fa-warehouse"></i>
                <h3>Mi Almacén</h3>
                <p>Productos aprobados en tu inventario</p>
                <div class="card-badge">0 productos</div>
            </div>
            
            <div class="grid-card" data-action="almacen-central" onclick="window.loadAlmacenCentralView()">
                <i class="fas fa-building"></i>
                <h3>Almacén Central</h3>
                <p>Productos disponibles del proveedor</p>
                <div class="card-badge" id="centralBadge">Cargando...</div>
            </div>
            
            <div class="grid-card" data-action="registro">
                <i class="fas fa-history"></i>
                <h3>Registro de Actividades</h3>
                <p>Historial de movimientos</p>
                <span class="coming-soon">En desarrollo</span>
            </div>
            
            <div class="grid-card" data-action="solicitudes">
                <i class="fas fa-clipboard-list"></i>
                <h3>Solicitudes</h3>
                <p>Gestión de pedidos</p>
                <span class="coming-soon">En desarrollo</span>
            </div>
        </div>
    `;
    
    // Actualizar badge del almacén central
    updateCentralBadge();
}

// Funciones de navegación
window.loadHomeView = loadHomeView;

window.loadMiAlmacenView = function() {
    breadcrumb.innerHTML = `
        <span class="breadcrumb-item" onclick="window.loadHomeView()" style="cursor: pointer;">Inicio</span>
        <span class="breadcrumb-item active">Mi Almacén</span>
    `;
    
    mainContent.innerHTML = `
        <div class="section-header">
            <h2><i class="fas fa-warehouse"></i> Mi Almacén</h2>
            <div class="header-actions">
                <button class="btn-primary" onclick="window.solicitarProductos()" style="width: auto; padding: 10px 20px;">
                    <i class="fas fa-plus"></i> Solicitar Productos
                </button>
            </div>
        </div>
        
        <div class="empty-state" style="margin-top: 40px;">
            <i class="fas fa-warehouse"></i>
            <h3>Tu almacén está vacío</h3>
            <p>Aún no tienes productos aprobados en tu inventario.</p>
            <p>Solicita productos del Almacén Central para empezar.</p>
            <div style="margin-top: 20px;">
                <button class="btn-primary" onclick="window.loadAlmacenCentralView()" style="width: auto; margin: 10px; padding: 10px 20px;">
                    <i class="fas fa-building"></i> Ir al Almacén Central
                </button>
                <button class="btn-primary" onclick="window.solicitarProductos()" style="width: auto; margin: 10px; padding: 10px 20px; background: #10b981;">
                    <i class="fas fa-shopping-cart"></i> Hacer una Solicitud
                </button>
            </div>
        </div>
    `;
};

window.loadAlmacenCentralView = function() {
    breadcrumb.innerHTML = `
        <span class="breadcrumb-item" onclick="window.loadHomeView()" style="cursor: pointer;">Inicio</span>
        <span class="breadcrumb-item active">Almacén Central</span>
    `;
    
    mainContent.innerHTML = `
        <div class="section-header">
            <h2><i class="fas fa-building"></i> Almacén Central</h2>
            <div class="header-actions">
                <button class="btn-primary" onclick="window.loadProducts()" style="width: auto; padding: 10px 20px;">
                    <i class="fas fa-sync-alt"></i> Actualizar
                </button>
                <button class="btn-primary" onclick="window.solicitarProductos()" style="width: auto; padding: 10px 20px; background: #10b981;">
                    <i class="fas fa-shopping-cart"></i> Solicitar Productos
                </button>
            </div>
        </div>
        
        <div class="filters" style="margin-bottom: 20px;">
            <input type="text" id="searchInput" placeholder="Buscar productos..." style="width: 100%; padding: 12px; border-radius: 8px; border: 2px solid #e5e7eb;">
        </div>
        
        <div class="products-grid" id="productsGrid">
            <div class="empty-state">
                <i class="fas fa-spinner fa-spin"></i>
                <h3>Cargando productos...</h3>
            </div>
        </div>
        
        <div style="margin-top: 20px; text-align: center;">
            <button class="btn-primary" onclick="window.loadHomeView()" style="width: auto; padding: 10px 20px; background: #6b7280;">
                <i class="fas fa-arrow-left"></i> Volver al Inicio
            </button>
        </div>
    `;
    
    // Cargar productos
    loadProducts();
    
    // Configurar búsqueda
    setTimeout(() => {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', function(e) {
                filterProducts(e.target.value);
            });
        }
    }, 100);
};

// Función para cargar productos del almacén central
async function loadProducts() {
    if (!isAuthenticated || !authHeaders.username) return;
    
    const isConnected = await checkConnection();
    if (!isConnected) {
        showProductsError('No hay conexión con el proveedor');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/productos`, {
            headers: {
                'username': authHeaders.username,
                'password': authHeaders.password
            }
        });
        
        if (response.status === 401) {
            // Sesión expirada
            showError(null, 'Sesión expirada. Por favor, inicia sesión nuevamente.');
            logoutBtn.click();
            return;
        }
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const productos = await response.json();
        displayProducts(productos);
        updateCentralBadge(productos.length);
    } catch (error) {
        console.error('Error cargando productos:', error);
        showProductsError(error.message);
    }
}

// Mostrar productos
function displayProducts(productos) {
    const container = document.getElementById('productsGrid');
    if (!container) return;
    
    if (!productos || productos.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-box-open"></i>
                <h3>No hay productos disponibles</h3>
                <p>El almacén central no tiene productos en este momento</p>
                <button onclick="window.loadProducts()" class="btn-primary" style="width: auto; margin-top: 20px; padding: 10px 20px;">
                    <i class="fas fa-sync-alt"></i> Reintentar
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = productos.map(producto => {
        // Determinar el estado del stock
        let stockClass = 'stock-high';
        let stockText = 'Disponible';
        let stockIcon = 'fa-check-circle';
        const cantidad = producto.cantidad || 0;
        
        if (cantidad < 5) {
            stockClass = 'stock-low';
            stockText = 'Bajo Stock';
            stockIcon = 'fa-exclamation-triangle';
        } else if (cantidad < 10) {
            stockClass = 'stock-medium';
            stockText = 'Stock Medio';
            stockIcon = 'fa-exclamation-circle';
        }
        
        // Obtener nombre de categoría
        const categoryName = getCategoryName(producto.categoria);
        
        return `
            <div class="product-card" data-name="${producto.nombre.toLowerCase()}" data-category="${producto.categoria || ''}">
                <div class="product-category">
                    ${categoryName}
                </div>
                
                <div class="product-header">
                    <div class="product-name">${producto.nombre || 'Sin nombre'}</div>
                    <div class="product-price">$${producto.precio ? producto.precio.toFixed(2) : '0.00'}</div>
                </div>
                
                <div class="product-description">
                    ${producto.descripcion || 'Sin descripción disponible'}
                </div>
                
                <div class="product-meta">
                    <span>
                        <i class="fas fa-cube"></i>
                        ${cantidad} ${producto.unidad || 'unidades'}
                    </span>
                    <span class="${stockClass} stock-badge">
                        <i class="fas ${stockIcon}"></i>
                        ${stockText}
                    </span>
                    <span>
                        <i class="fas fa-calendar"></i>
                        ${producto.fecha ? new Date(producto.fecha).toLocaleDateString() : 'Sin fecha'}
                    </span>
                </div>
                
                <div class="product-actions">
                    <div class="quantity-selector">
                        <button class="qty-btn" onclick="decreaseQuantity('${producto.id}')">-</button>
                        <input type="number" id="qty-${producto.id}" value="1" min="1" max="${cantidad}" class="qty-input">
                        <button class="qty-btn" onclick="increaseQuantity('${producto.id}', ${cantidad})">+</button>
                    </div>
                    <button class="btn-small btn-primary" onclick="agregarASolicitud('${producto.id}', '${producto.nombre}')">
                        <i class="fas fa-cart-plus"></i> Agregar
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Función para filtrar productos
function filterProducts(searchTerm) {
    const products = document.querySelectorAll('.product-card');
    const term = searchTerm.toLowerCase().trim();
    
    products.forEach(product => {
        const productName = product.getAttribute('data-name') || '';
        const productCategory = product.getAttribute('data-category') || '';
        
        if (term === '' || 
            productName.includes(term) || 
            productCategory.includes(term)) {
            product.style.display = 'block';
        } else {
            product.style.display = 'none';
        }
    });
}

// Funciones para cantidad
window.decreaseQuantity = function(productId) {
    const input = document.getElementById(`qty-${productId}`);
    if (input && parseInt(input.value) > 1) {
        input.value = parseInt(input.value) - 1;
    }
};

window.increaseQuantity = function(productId, max) {
    const input = document.getElementById(`qty-${productId}`);
    if (input && parseInt(input.value) < max) {
        input.value = parseInt(input.value) + 1;
    }
};

// Función para agregar a solicitud
window.agregarASolicitud = function(productId, productName) {
    const input = document.getElementById(`qty-${productId}`);
    const quantity = input ? parseInt(input.value) : 1;
    
    // Aquí se implementaría la lógica para agregar a una solicitud
    alert(`Agregado a solicitud:\nProducto: ${productName}\nCantidad: ${quantity}`);
    
    // Resetear cantidad
    if (input) input.value = 1;
};

// Función para solicitar productos
window.solicitarProductos = function() {
    alert('Funcionalidad en desarrollo: Solicitud de productos\n\nAquí podrás seleccionar múltiples productos y enviar una solicitud al proveedor.');
};

// Mostrar error de productos
function showProductsError(message) {
    const container = document.getElementById('productsGrid');
    if (!container) return;
    
    container.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Error al cargar productos</h3>
            <p>${message || 'No se pudieron cargar los productos del almacén central'}</p>
            <button onclick="window.loadProducts()" class="btn-primary" style="width: auto; margin-top: 20px; padding: 10px 20px;">
                <i class="fas fa-sync-alt"></i> Reintentar
            </button>
        </div>
    `;
}

// Actualizar badge del almacén central
async function updateCentralBadge(count) {
    if (count === undefined) {
        // Obtener conteo actual
        try {
            const response = await fetch(`${API_URL}/productos`, {
                headers: authHeaders
            });
            
            if (response.ok) {
                const productos = await response.json();
                count = productos.length;
            }
        } catch (error) {
            console.error('Error obteniendo conteo:', error);
        }
    }
    
    const badge = document.getElementById('centralBadge');
    if (badge) {
        badge.textContent = count ? `${count} productos` : '0 productos';
    }
}

// Función auxiliar para obtener nombre de categoría
function getCategoryName(category) {
    const categories = {
        'confituras': 'Confituras',
        'alimentos': 'Alimentos',
        'utiles': 'Utiles del Hogar',
        'otros': 'Otros'
    };
    return categories[category] || 'Sin categoría';
}

// Intentar auto-login con credenciales guardadas
function tryAutoLogin() {
    const savedCredentials = localStorage.getItem('tienda_credentials');
    
    if (savedCredentials) {
        try {
            const credentials = JSON.parse(savedCredentials);
            document.getElementById('loginUsername').value = credentials.username || '';
        } catch (error) {
            console.error('Error al cargar credenciales:', error);
            localStorage.removeItem('tienda_credentials');
        }
    }
}

// Actualizaciones periódicas
function startPeriodicUpdates() {
    // Verificar conexión cada 15 segundos
    setInterval(async () => {
        await checkConnection();
        
        // Si estamos en la vista de almacén central, actualizar productos
        if (document.querySelector('.breadcrumb-item.active')?.textContent === 'Almacén Central') {
            await loadProducts();
        }
    }, 15000);
}

// PWA Installation
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const installBtn = document.getElementById('installBtn');
    if (installBtn) {
        installBtn.style.display = 'block';
        
        installBtn.addEventListener('click', () => {
            installBtn.style.display = 'none';
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then(() => {
                deferredPrompt = null;
            });
        });
    }
});

// Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
        .then(() => console.log('Service Worker registrado'))
        .catch(error => console.log('Error registrando SW:', error));
}

// Añadir estilos CSS dinámicamente
const style = document.createElement('style');
style.textContent = `
    .store-info-card {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        color: white;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 25px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    
    .store-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
    }
    
    .store-header h3 {
        font-size: 20px;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .store-status {
        background: rgba(255,255,255,0.2);
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
    }
    
    .store-info-card p {
        margin: 5px 0;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
    }
    
    .grid-container {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 25px;
        margin-top: 20px;
    }
    
    .grid-card {
        background: white;
        border-radius: 12px;
        padding: 25px;
        text-align: center;
        transition: all 0.3s ease;
        cursor: pointer;
        position: relative;
        overflow: hidden;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        border: 2px solid transparent;
    }
    
    .grid-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        border-color: #f5576c;
    }
    
    .grid-card i {
        font-size: 40px;
        margin-bottom: 15px;
        color: #f5576c;
    }
    
    .grid-card h3 {
        font-size: 18px;
        margin-bottom: 8px;
        color: #1f2937;
    }
    
    .grid-card p {
        color: #6b7280;
        font-size: 14px;
        line-height: 1.4;
        margin-bottom: 10px;
    }
    
    .card-badge {
        background: #e0f2fe;
        color: #0369a1;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        display: inline-block;
    }
    
    .coming-soon {
        position: absolute;
        top: 10px;
        right: 10px;
        background: #f59e0b;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;
    }
    
    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 2px solid #e5e7eb;
    }
    
    .section-header h2 {
        font-size: 24px;
        color: #1f2937;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .header-actions {
        display: flex;
        gap: 10px;
    }
    
    .products-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
        margin-top: 20px;
    }
    
    .product-card {
        background: white;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        border-left: 4px solid #f5576c;
        transition: all 0.3s ease;
    }
    
    .product-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 20px rgba(0,0,0,0.1);
    }
    
    .product-category {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        color: white;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        display: inline-block;
        margin-bottom: 15px;
    }
    
    .product-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 15px;
    }
    
    .product-name {
        font-size: 18px;
        font-weight: 600;
        color: #1f2937;
        flex: 1;
    }
    
    .product-price {
        color: #f5576c;
        font-weight: 600;
        font-size: 22px;
        white-space: nowrap;
        margin-left: 10px;
    }
    
    .product-description {
        color: #6b7280;
        margin-bottom: 20px;
        font-size: 14px;
        line-height: 1.5;
        min-height: 60px;
    }
    
    .product-meta {
        display: flex;
        justify-content: space-between;
        font-size: 13px;
        color: #888;
        margin-bottom: 15px;
        flex-wrap: wrap;
        gap: 10px;
    }
    
    .product-meta span {
        display: flex;
        align-items: center;
        gap: 5px;
    }
    
    .stock-badge {
        padding: 4px 12px;
        border-radius: 20px;
        font-weight: 600;
        font-size: 12px;
        display: flex;
        align-items: center;
        gap: 5px;
    }
    
    .stock-high {
        background: #d1fae5;
        color: #065f46;
    }
    
    .stock-medium {
        background: #fef3c7;
        color: #92400e;
    }
    
    .stock-low {
        background: #fee2e2;
        color: #991b1b;
    }
    
    .product-actions {
        display: flex;
        gap: 10px;
        align-items: center;
    }
    
    .quantity-selector {
        display: flex;
        align-items: center;
        gap: 5px;
        flex: 1;
    }
    
    .qty-btn {
        background: #e5e7eb;
        border: none;
        width: 32px;
        height: 32px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .qty-btn:hover {
        background: #d1d5db;
    }
    
    .qty-input {
        width: 50px;
        text-align: center;
        padding: 6px;
        border: 2px solid #e5e7eb;
        border-radius: 6px;
        font-size: 14px;
    }
    
    .btn-small {
        background: #6b7280;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: all 0.2s;
        white-space: nowrap;
    }
    
    .btn-small:hover {
        opacity: 0.9;
        transform: translateY(-2px);
    }
    
    .btn-small.btn-primary {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }
    
    .btn-primary {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 10px;
        transition: transform 0.2s;
    }
    
    .btn-primary:hover {
        transform: translateY(-2px);
    }
    
    .empty-state {
        text-align: center;
        padding: 60px 20px;
        color: #6b7280;
        grid-column: 1 / -1;
    }
    
    .empty-state i {
        font-size: 48px;
        margin-bottom: 20px;
        color: #e5e7eb;
    }
    
    .empty-state h3 {
        font-size: 18px;
        margin-bottom: 10px;
        color: #1f2937;
    }
    
    .breadcrumb {
        padding: 15px 30px;
        background: white;
        border-bottom: 1px solid #e5e7eb;
    }
    
    .breadcrumb-item {
        color: #6b7280;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 6px;
        transition: all 0.2s;
    }
    
    .breadcrumb-item:hover {
        background: #e5e7eb;
        color: #1f2937;
    }
    
    .breadcrumb-item.active {
        color: #f5576c;
        font-weight: 600;
    }
    
    .breadcrumb-item:not(:last-child)::after {
        content: "›";
        margin: 0 8px;
        color: #6b7280;
    }
    
    .status-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        margin-top: 8px;
    }
    
    .status-badge.online {
        background: #d1fae5;
        color: #065f46;
    }
    
    .status-badge.offline {
        background: #fee2e2;
        color: #991b1b;
    }
    
    .btn-logout {
        background: #ef4444;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: all 0.2s;
    }
    
    .btn-logout:hover {
        background: #dc2626;
    }
    
    .btn-install {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 1000;
    }
    
    @media (max-width: 768px) {
        .grid-container {
            grid-template-columns: 1fr;
            gap: 15px;
        }
        
        .products-grid {
            grid-template-columns: 1fr;
            gap: 15px;
        }
        
        .section-header {
            flex-direction: column;
            gap: 15px;
            align-items: flex-start;
        }
        
        .header-actions {
            width: 100%;
            justify-content: flex-start;
        }
        
        .product-actions {
            flex-direction: column;
            align-items: stretch;
        }
        
        .quantity-selector {
            justify-content: center;
        }
    }
`;
document.head.appendChild(style);

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    tryAutoLogin();
});
