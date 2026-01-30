// app.js - Versión completa actualizada (tienda)
const API_URL = 'http://localhost:3000/api';
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
const storeNameElement = document.getElementById('storeName');
const storeUserElement = document.getElementById('storeUser');
const mainContent = document.getElementById('mainContent');
const productsGrid = document.getElementById('productsGrid');
const statusElement = document.getElementById('status');
const errorContainer = document.getElementById('errorContainer');

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
            
            // Actualizar información de la tienda
            if (storeNameElement) {
                storeNameElement.textContent = `Tienda: ${currentStore.storename}`;
            }
            if (storeUserElement) {
                storeUserElement.textContent = `Usuario: ${currentStore.username}`;
            }
            
            // Mostrar dashboard
            loginContainer.style.display = 'none';
            dashboard.style.display = 'block';
            
            // Cargar productos y verificar conexión
            loadProducts();
            checkConnection();
            
            // Iniciar actualizaciones periódicas
            startPeriodicUpdates();
            
            // Guardar credenciales en localStorage (opcional)
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
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        isAuthenticated = false;
        currentStore = null;
        authHeaders = {};
        dashboard.style.display = 'none';
        loginContainer.style.display = 'block';
        
        // Limpiar campos
        document.getElementById('loginPassword').value = '';
        
        // Limpiar localStorage
        localStorage.removeItem('tienda_credentials');
        
        // Limpiar contenido
        if (productsGrid) {
            productsGrid.innerHTML = '';
        }
    });
}

// Verificar conexión con proveedor
async function checkConnection() {
    if (!isAuthenticated || !statusElement) return;
    
    const statusText = statusElement.querySelector('span');
    
    try {
        const response = await fetch(`${API_URL}/status`);
        
        if (response.ok) {
            statusElement.className = 'status-badge online';
            statusText.textContent = 'Conectado al Proveedor';
            
            // Ocultar contenedor de error si existe
            if (errorContainer) {
                errorContainer.style.display = 'none';
            }
            return true;
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (error) {
        statusElement.className = 'status-badge offline';
        statusText.textContent = 'Desconectado del Proveedor';
        
        // Mostrar contenedor de error si existe
        if (errorContainer) {
            errorContainer.style.display = 'block';
        }
        return false;
    }
}

// Función para mostrar errores
function showError(element, message) {
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
        setTimeout(() => {
            element.style.display = 'none';
        }, 3000);
    }
}

// Cargar productos del proveedor
async function loadProducts() {
    if (!isAuthenticated || !authHeaders.username || !productsGrid) return;
    
    const isConnected = await checkConnection();
    if (!isConnected) {
        // Mostrar mensaje de error si no hay conexión
        showConnectionError();
        return;
    }
    
    // Mostrar indicador de carga
    productsGrid.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-spinner fa-spin"></i>
            <h3>Cargando productos...</h3>
        </div>
    `;
    
    try {
        const response = await fetch(`${API_URL}/productos`, {
            headers: {
                'username': authHeaders.username,
                'password': authHeaders.password
            }
        });
        
        if (response.status === 401) {
            // Sesión expirada o credenciales inválidas
            showError(null, 'Sesión expirada. Por favor, inicia sesión nuevamente.');
            logoutBtn.click();
            return;
        }
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const productos = await response.json();
        displayProducts(productos);
    } catch (error) {
        console.error('Error cargando productos:', error);
        showProductsError(error.message);
    }
}

// Mostrar productos
function displayProducts(productos) {
    if (!productsGrid) return;
    
    if (!productos || productos.length === 0) {
        productsGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-box-open"></i>
                <h3>No hay productos disponibles</h3>
                <p>El proveedor no tiene productos publicados</p>
                <button onclick="window.loadProducts()" class="refresh-btn">
                    <i class="fas fa-sync-alt"></i> Actualizar
                </button>
            </div>
        `;
        return;
    }
    
    // Ordenar productos por categoría y fecha (más recientes primero)
    const productosOrdenados = [...productos].sort((a, b) => {
        // Primero por categoría
        if (a.categoria !== b.categoria) {
            return a.categoria?.localeCompare(b.categoria) || 0;
        }
        // Luego por fecha (más recientes primero)
        return new Date(b.fecha || 0) - new Date(a.fecha || 0);
    });
    
    productsGrid.innerHTML = productosOrdenados.map(producto => {
        // Determinar el estado del stock
        let stockClass = 'stock-high';
        let stockText = 'Disponible';
        const cantidad = producto.cantidad || 0;
        
        if (cantidad < 5) {
            stockClass = 'stock-low';
            stockText = 'Bajo Stock';
        } else if (cantidad < 10) {
            stockClass = 'stock-medium';
            stockText = 'Stock Medio';
        }
        
        // Obtener nombre de categoría
        const categoryName = getCategoryName(producto.categoria);
        
        // Formatear fecha
        const fechaFormateada = producto.fecha 
            ? new Date(producto.fecha).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            })
            : 'Sin fecha';
        
        return `
            <div class="product-card">
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
                        <i class="fas ${stockClass === 'stock-high' ? 'fa-check-circle' : stockClass === 'stock-medium' ? 'fa-exclamation-circle' : 'fa-exclamation-triangle'}"></i>
                        ${stockText}
                    </span>
                    <span>
                        <i class="fas fa-calendar"></i>
                        ${fechaFormateada}
                    </span>
                </div>
                
                <div class="product-actions">
                    <button class="btn-small" onclick="showProductDetails('${producto.id}')" title="Ver detalles">
                        <i class="fas fa-info-circle"></i> Detalles
                    </button>
                    <button class="btn-small btn-primary" onclick="solicitarProducto('${producto.id}')" title="Solicitar producto">
                        <i class="fas fa-shopping-cart"></i> Solicitar
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Mostrar error de productos
function showProductsError(message) {
    if (!productsGrid) return;
    
    productsGrid.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Error al cargar productos</h3>
            <p>${message || 'No se pudieron cargar los productos'}</p>
            <div style="margin-top: 20px;">
                <button onclick="window.loadProducts()" class="refresh-btn">
                    <i class="fas fa-sync-alt"></i> Reintentar
                </button>
                <button onclick="window.checkConnection()" class="refresh-btn" style="background: #6b7280;">
                    <i class="fas fa-wifi"></i> Verificar Conexión
                </button>
            </div>
        </div>
    `;
}

// Mostrar error de conexión
function showConnectionError() {
    if (!productsGrid) return;
    
    productsGrid.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-wifi-slash"></i>
            <h3>Sin conexión al proveedor</h3>
            <p>No se puede acceder a los productos. Verifica tu conexión.</p>
            <button onclick="window.loadProducts()" class="refresh-btn">
                <i class="fas fa-sync-alt"></i> Reintentar
            </button>
        </div>
    `;
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

// Función para mostrar detalles del producto
window.showProductDetails = function(productId) {
    alert(`Funcionalidad en desarrollo: Detalles del producto ${productId}`);
    // Aquí podrías implementar un modal con más información
};

// Función para solicitar producto
window.solicitarProducto = function(productId) {
    alert(`Funcionalidad en desarrollo: Solicitar producto ${productId}`);
    // Aquí podrías implementar un formulario para solicitar cantidades
};

// Intentar auto-login con credenciales guardadas
function tryAutoLogin() {
    const savedCredentials = localStorage.getItem('tienda_credentials');
    
    if (savedCredentials) {
        try {
            const credentials = JSON.parse(savedCredentials);
            
            // Rellenar formulario automáticamente
            document.getElementById('loginUsername').value = credentials.username || '';
            
            // No rellenamos la contraseña por seguridad
            // Podríamos intentar auto-login aquí si quisieramos
        } catch (error) {
            console.error('Error al cargar credenciales guardadas:', error);
            localStorage.removeItem('tienda_credentials');
        }
    }
}

// Actualizaciones periódicas
function startPeriodicUpdates() {
    // Verificar conexión cada 15 segundos
    setInterval(async () => {
        await checkConnection();
        
        // Si hay conexión y estamos autenticados, actualizar productos
        if (isAuthenticated && await checkConnection()) {
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
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('Usuario aceptó instalar la PWA');
                } else {
                    console.log('Usuario rechazó instalar la PWA');
                }
                deferredPrompt = null;
            });
        });
    }
});

// Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('ServiceWorker registrado exitosamente:', registration.scope);
                
                // Verificar actualizaciones del Service Worker
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    console.log('Nueva versión del Service Worker encontrada:', newWorker);
                });
            })
            .catch(error => {
                console.log('Error registrando ServiceWorker:', error);
            });
    });
}

// Evento para refrescar productos (si existe el botón en el HTML)
if (document.querySelector('.refresh-btn')) {
    document.querySelector('.refresh-btn').addEventListener('click', () => {
        loadProducts();
    });
}

// Añadir estilos CSS dinámicamente
const style = document.createElement('style');
style.textContent = `
    .product-card {
        background: white;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        border-left: 4px solid #f5576c;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
    }
    
    .product-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        border-color: #f093fb;
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
        padding-bottom: 15px;
        border-bottom: 1px solid #e5e7eb;
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
        margin-top: 15px;
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
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: all 0.2s;
    }
    
    .btn-small:hover {
        opacity: 0.9;
        transform: translateY(-2px);
    }
    
    .btn-small.btn-primary {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }
    
    .products-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 25px;
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
    
    .refresh-btn {
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
        margin: 10px auto;
        transition: transform 0.2s;
    }
    
    .refresh-btn:hover {
        transform: translateY(-2px);
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
    
    .store-info-badge {
        background: #e0f2fe;
        color: #0369a1;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 14px;
        font-weight: 600;
        margin-top: 5px;
        display: inline-block;
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
    
    /* Responsive */
    @media (max-width: 768px) {
        .products-grid {
            grid-template-columns: 1fr;
            gap: 15px;
        }
        
        .product-card {
            padding: 15px;
        }
        
        .product-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
        }
        
        .product-price {
            margin-left: 0;
        }
        
        .product-meta {
            flex-direction: column;
            gap: 8px;
        }
        
        .product-actions {
            flex-direction: column;
        }
    }
    
    /* Animación de carga */
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .fa-spinner {
        animation: spin 1s linear infinite;
    }
`;
document.head.appendChild(style);

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    console.log('Tienda PWA cargada');
    
    // Intentar auto-login
    tryAutoLogin();
    
    // Configurar botones de recarga si existen
    const refreshButtons = document.querySelectorAll('[onclick*="loadProducts"]');
    refreshButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            loadProducts();
        });
    });
});

// Exportar funciones para uso global
window.loadProducts = loadProducts;
window.checkConnection = checkConnection;

// Función para probar conexión (útil para debugging)
window.testConnection = async function() {
    console.log('=== Probando conexión con el servidor ===');
    
    try {
        const response = await fetch(`${API_URL}/status`);
        console.log(`Status del servidor: ${response.status} ${response.statusText}`);
        
        if (isAuthenticated && currentStore) {
            console.log('Tienda autenticada:', currentStore);
            console.log('Credenciales disponibles:', authHeaders.username ? 'Sí' : 'No');
        }
        
        return response.ok;
    } catch (error) {
        console.error('Error probando conexión:', error);
        return false;
    }
};