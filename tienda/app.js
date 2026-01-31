// app.js - Versión completa actualizada (tienda)
const API_URL = 'https://proveedor-api-salazar.onrender.com/api';
let deferredPrompt;
let isAuthenticated = false;
let currentStore = null;

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
    if (!isAuthenticated) return;
    
    try {
        console.log('📦 Cargando productos del almacén central...');
        
        // USAR ESTA RUTA (NO requiere autenticación por headers)
        const response = await fetch(`${API_URL}/tienda/productos`);
        
        console.log('📤 Respuesta productos:', response.status);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
        }
        
        const productos = await response.json();
        console.log('✅ Productos obtenidos:', productos.length);
        displayProducts(productos);
        updateCentralBadge(productos.length);
    } catch (error) {
        console.error('❌ Error cargando productos:', error);
        showProductsError('Error: ' + error.message);
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
        try {
            // USAR ESTA RUTA
            const response = await fetch(`${API_URL}/tienda/productos`);
            
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

document.head.appendChild(style);

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    tryAutoLogin();
});
