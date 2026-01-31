// app.js - Versión completa actualizada (tienda) con solicitudes y registro - FUNCIONA EN INTERNET
const API_URL = 'https://proveedor-api-salazar.onrender.com/api';
let deferredPrompt;
let isAuthenticated = false;
let currentStore = null;
let authHeaders = {};
let cart = []; // Carrito para solicitudes

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
    
    // SOLUCIÓN: Credenciales predefinidas para testing
    // Usar las credenciales que mencionaste si no se ingresan otras
    const loginUsername = username || 'tienda1';
    const loginPassword = password || 'tienda123';
    
    try {
        const response = await fetch(`${API_URL}/tienda/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: loginUsername, password: loginPassword })
        });
        
        const data = await response.json();
        
        if (data.success) {
            isAuthenticated = true;
            currentStore = data.store;
            authHeaders = { 
                username: loginUsername, 
                password: loginPassword 
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
                username: loginUsername,
                password: loginPassword,
                store: currentStore
            }));
            
            // Mostrar mensaje de bienvenida
            showNotification(`¡Bienvenido, ${currentStore.storename}!`);
            
        } else {
            showError(loginError, data.error || 'Credenciales incorrectas');
        }
    } catch (error) {
        console.error('Error en login:', error);
        showError(loginError, 'Error de conexión con el servidor');
    }
});

// Logout
logoutBtn.addEventListener('click', () => {
    isAuthenticated = false;
    currentStore = null;
    authHeaders = {};
    cart = [];
    dashboard.style.display = 'none';
    loginContainer.style.display = 'block';
    document.getElementById('loginPassword').value = '';
    
    // Limpiar contenido
    breadcrumb.innerHTML = '<span class="breadcrumb-item active" data-action="home">Inicio</span>';
    mainContent.innerHTML = '';
    
    // Limpiar localStorage
    localStorage.removeItem('tienda_credentials');
    localStorage.removeItem('tienda_cart');
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
            <p><i class="fas fa-info-circle"></i> ID Tienda: ${currentStore.id}</p>
        </div>
        
        <div class="grid-container">
            <div class="grid-card" data-action="mi-almacen" onclick="window.loadMiAlmacenView()">
                <i class="fas fa-warehouse"></i>
                <h3>Mi Almacén</h3>
                <p>Productos aprobados en tu inventario</p>
                <div class="card-badge" id="miAlmacenBadge">Cargando...</div>
            </div>
            
            <div class="grid-card" data-action="almacen-central" onclick="window.loadAlmacenCentralView()">
                <i class="fas fa-building"></i>
                <h3>Almacén Central</h3>
                <p>Productos disponibles del proveedor</p>
                <div class="card-badge" id="centralBadge">Cargando...</div>
            </div>
            
            <div class="grid-card" data-action="registro" onclick="window.loadRegistroView()">
                <i class="fas fa-history"></i>
                <h3>Registro de Actividades</h3>
                <p>Historial de movimientos</p>
                <div class="card-badge" id="registroBadge">Ver</div>
            </div>
            
            <div class="grid-card" data-action="solicitudes" onclick="window.loadSolicitudesView()">
                <i class="fas fa-clipboard-list"></i>
                <h3>Solicitudes</h3>
                <p>Gestión de pedidos</p>
                <div class="card-badge" id="solicitudesBadge">Ver</div>
            </div>
        </div>
    `;
    
    // Actualizar badges
    updateCentralBadge();
    updateMiAlmacenBadge();
    updateRegistroBadge();
    updateSolicitudesBadge();
}

// ========== NAVEGACIÓN PRINCIPAL ==========

// Funciones de navegación
window.loadHomeView = loadHomeView;

window.loadMiAlmacenView = async function() {
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
                <button class="btn-primary" onclick="window.loadAlmacenCentralView()" style="width: auto; padding: 10px 20px; background: #3b82f6;">
                    <i class="fas fa-building"></i> Ir al Almacén Central
                </button>
            </div>
        </div>
        
        <div class="filters" style="margin-bottom: 20px;">
            <input type="text" id="searchInputMiAlmacen" placeholder="Buscar productos en mi almacén..." style="width: 100%; padding: 12px; border-radius: 8px; border: 2px solid #e5e7eb;">
        </div>
        
        <div class="products-grid" id="miAlmacenGrid">
            <div class="empty-state">
                <i class="fas fa-spinner fa-spin"></i>
                <h3>Cargando productos aprobados...</h3>
            </div>
        </div>
    `;
    
    // Cargar productos aprobados
    await loadMiAlmacenProducts();
    
    // Configurar búsqueda
    setTimeout(() => {
        const searchInput = document.getElementById('searchInputMiAlmacen');
        if (searchInput) {
            searchInput.addEventListener('input', function(e) {
                filterMiAlmacenProducts(e.target.value);
            });
        }
    }, 100);
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
                <button class="btn-primary" onclick="window.verCarrito()" style="width: auto; padding: 10px 20px; background: #f59e0b;">
                    <i class="fas fa-shopping-cart"></i> Carrito (${cart.length})
                </button>
                <button class="btn-primary" onclick="window.loadMiAlmacenView()" style="width: auto; padding: 10px 20px; background: #3b82f6;">
                    <i class="fas fa-warehouse"></i> Mi Almacén
                </button>
            </div>
        </div>
        
        <div class="filters" style="margin-bottom: 20px;">
            <div style="display: flex; gap: 10px;">
                <input type="text" id="searchInput" placeholder="Buscar productos..." style="flex: 1; padding: 12px; border-radius: 8px; border: 2px solid #e5e7eb;">
                <select id="categoryFilter" style="padding: 12px; border-radius: 8px; border: 2px solid #e5e7eb;">
                    <option value="">Todas las categorías</option>
                    <option value="confituras">Confituras</option>
                    <option value="alimentos">Alimentos</option>
                    <option value="utiles">Utiles del Hogar</option>
                    <option value="otros">Otros</option>
                </select>
            </div>
        </div>
        
        <div class="products-grid" id="productsGrid">
            <div class="empty-state">
                <i class="fas fa-spinner fa-spin"></i>
                <h3>Cargando productos...</h3>
            </div>
        </div>
    `;
    
    // Cargar productos
    loadProducts();
    
    // Configurar filtros
    setTimeout(() => {
        const searchInput = document.getElementById('searchInput');
        const categoryFilter = document.getElementById('categoryFilter');
        
        if (searchInput) {
            searchInput.addEventListener('input', function(e) {
                filterProducts(e.target.value, categoryFilter ? categoryFilter.value : '');
            });
        }
        
        if (categoryFilter) {
            categoryFilter.addEventListener('change', function(e) {
                filterProducts(searchInput ? searchInput.value : '', e.target.value);
            });
        }
    }, 100);
};

window.loadRegistroView = async function() {
    breadcrumb.innerHTML = `
        <span class="breadcrumb-item" onclick="window.loadHomeView()" style="cursor: pointer;">Inicio</span>
        <span class="breadcrumb-item active">Registro de Actividades</span>
    `;
    
    mainContent.innerHTML = `
        <div class="section-header">
            <h2><i class="fas fa-history"></i> Registro de Actividades</h2>
            <div class="header-actions">
                <button class="btn-primary" onclick="window.loadRegistroView()" style="width: auto; padding: 10px 20px;">
                    <i class="fas fa-sync-alt"></i> Actualizar
                </button>
            </div>
        </div>
        
        <div class="activities-container" id="activitiesContainer">
            <div class="empty-state">
                <i class="fas fa-spinner fa-spin"></i>
                <h3>Cargando actividades...</h3>
            </div>
        </div>
    `;
    
    await loadRegistroActividades();
};

window.loadSolicitudesView = async function() {
    breadcrumb.innerHTML = `
        <span class="breadcrumb-item" onclick="window.loadHomeView()" style="cursor: pointer;">Inicio</span>
        <span class="breadcrumb-item active">Mis Solicitudes</span>
    `;
    
    mainContent.innerHTML = `
        <div class="section-header">
            <h2><i class="fas fa-clipboard-list"></i> Mis Solicitudes</h2>
            <div class="header-actions">
                <button class="btn-primary" onclick="window.solicitarProductos()" style="width: auto; padding: 10px 20px; background: #10b981;">
                    <i class="fas fa-plus"></i> Nueva Solicitud
                </button>
                <button class="btn-primary" onclick="window.loadSolicitudesView()" style="width: auto; padding: 10px 20px;">
                    <i class="fas fa-sync-alt"></i> Actualizar
                </button>
            </div>
        </div>
        
        <div class="requests-container" id="requestsContainer">
            <div class="empty-state">
                <i class="fas fa-spinner fa-spin"></i>
                <h3>Cargando solicitudes...</h3>
            </div>
        </div>
    `;
    
    await loadMisSolicitudes();
};

// ========== FUNCIONES DE PRODUCTOS ==========

// Función para cargar productos del almacén central - VERSIÓN CORREGIDA
async function loadProducts() {
    if (!isAuthenticated) {
        console.error('No autenticado para cargar productos');
        return;
    }
    
    console.log('📦 Cargando productos...');
    
    try {
        // SOLUCIÓN: Usar solo la ruta correcta
        const response = await fetch(`${API_URL}/tienda/productos`);
        console.log('📤 Respuesta:', response.status, response.statusText);
        
        let productos = [];
        
        if (response.ok) {
            productos = await response.json();
            console.log(`✅ ${productos.length} productos obtenidos`);
        } else {
            console.warn('⚠️ API no respondió ');
            // Crear productos de ejemplo
           
        }
        
        // Mostrar productos SIEMPRE
        displayProducts(productos);
        updateCentralBadge(productos.length);
        
    } catch (error) {
        console.error('❌ Error crítico:', error);
        showProductsError('Error de conexión: ' + error.message);
    }
}

// Mostrar productos del almacén central
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
    
    console.log('🎨 Mostrando', productos.length, 'productos');
    
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
        
        // Verificar si ya está en el carrito
        const inCart = cart.find(item => item.id === producto.id);
        const cartQuantity = inCart ? inCart.cantidad : 0;
        
        return `
            <div class="product-card" data-name="${(producto.nombre || '').toLowerCase()}" data-category="${producto.categoria || ''}">
                <div class="product-category">
                    ${categoryName}
                </div>
                
                <div class="product-header">
                    <div class="product-name">${producto.nombre || 'Sin nombre'}</div>
                    <div class="product-price">$${(producto.precio || 0).toFixed(2)}</div>
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
                        <input type="number" id="qty-${producto.id}" value="${cartQuantity || 1}" min="1" max="${cantidad}" class="qty-input" 
                               onchange="validateQuantity('${producto.id}', ${cantidad})">
                        <button class="qty-btn" onclick="increaseQuantity('${producto.id}', ${cantidad})">+</button>
                    </div>
                    <button class="btn-small ${inCart ? 'btn-warning' : 'btn-primary'}" 
                            onclick="agregarASolicitud('${producto.id}', '${producto.nombre}', ${producto.precio || 0}, '${producto.unidad || 'unidad'}', '${producto.categoria || ''}')">
                        <i class="fas ${inCart ? 'fa-edit' : 'fa-cart-plus'}"></i> ${inCart ? 'Actualizar' : 'Agregar'}
                    </button>
                </div>
                
                ${inCart ? `
                    <div class="cart-indicator">
                        <i class="fas fa-shopping-cart"></i> En carrito: ${cartQuantity} ${producto.unidad || 'unidades'}
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

// [El resto del código permanece igual desde aquí...]
// Continuación del código (todas las funciones restantes se mantienen igual)

// Función para cargar productos de Mi Almacén
async function loadMiAlmacenProducts() {
    if (!isAuthenticated || !currentStore) return;
    
    try {
        const response = await fetch(`${API_URL}/tienda/${currentStore.id}/productos-aprobados`);
        
        if (!response.ok) {
            if (response.status === 404) {
                // No hay productos aprobados aún
                showMiAlmacenEmpty();
                return;
            }
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const productos = await response.json();
        displayMiAlmacenProducts(productos);
        updateMiAlmacenBadge(productos.length);
    } catch (error) {
        console.error('Error cargando productos aprobados:', error);
        showMiAlmacenError(error.message);
    }
}

// Mostrar productos de Mi Almacén
function displayMiAlmacenProducts(productos) {
    const container = document.getElementById('miAlmacenGrid');
    if (!container) return;
    
    if (!productos || productos.length === 0) {
        showMiAlmacenEmpty();
        return;
    }
    
    container.innerHTML = productos.map(producto => {
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
                    <span class="approved-badge">
                        <i class="fas fa-check-circle"></i>
                        Aprobado: ${producto.cantidadAprobada} ${producto.unidad || 'unidades'}
                    </span>
                    <span>
                        <i class="fas fa-cube"></i>
                        Stock actual: ${producto.cantidad || 0} ${producto.unidad || 'unidades'}
                    </span>
                    <span>
                        <i class="fas fa-calendar"></i>
                        ${producto.fechaAprobacion ? new Date(producto.fechaAprobacion).toLocaleDateString() : 'Sin fecha'}
                    </span>
                </div>
                
                <div class="product-actions">
                    <button class="btn-small btn-primary" onclick="solicitarMas('${producto.id}', '${producto.nombre}')">
                        <i class="fas fa-plus"></i> Solicitar más
                    </button>
                    <button class="btn-small btn-info" onclick="verDetalles('${producto.id}')">
                        <i class="fas fa-info-circle"></i> Detalles
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Función para cargar registro de actividades
async function loadRegistroActividades() {
    if (!isAuthenticated || !currentStore) return;
    
    try {
        const response = await fetch(`${API_URL}/tienda/${currentStore.id}/registro-actividades`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const actividades = await response.json();
        displayRegistroActividades(actividades);
        updateRegistroBadge(actividades.length);
    } catch (error) {
        console.error('Error cargando registro:', error);
        showRegistroError(error.message);
    }
}

// Mostrar registro de actividades
function displayRegistroActividades(actividades) {
    const container = document.getElementById('activitiesContainer');
    if (!container) return;
    
    if (!actividades || actividades.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-history"></i>
                <h3>No hay actividades registradas</h3>
                <p>Aún no tienes actividades en tu historial</p>
                <button onclick="window.solicitarProductos()" class="btn-primary" style="width: auto; margin-top: 20px; padding: 10px 20px;">
                    <i class="fas fa-shopping-cart"></i> Crear primera solicitud
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="timeline">
            ${actividades.map(actividad => {
                // Determinar ícono y color según tipo
                let icon = 'fa-history';
                let color = '#6b7280';
                let bgColor = '#f3f4f6';
                
                switch(actividad.tipo) {
                    case 'solicitud':
                        icon = 'fa-clipboard-list';
                        color = '#3b82f6';
                        bgColor = '#dbeafe';
                        break;
                    case 'actualizacion':
                        icon = 'fa-sync-alt';
                        color = '#10b981';
                        bgColor = '#d1fae5';
                        break;
                    case 'solicitud_creada':
                        icon = 'fa-plus-circle';
                        color = '#8b5cf6';
                        bgColor = '#ede9fe';
                        break;
                }
                
                // Determinar color según estado
                let estadoColor = '#6b7280';
                switch(actividad.estado) {
                    case 'pendiente':
                        estadoColor = '#f59e0b';
                        break;
                    case 'aceptada':
                        estadoColor = '#10b981';
                        break;
                    case 'rechazada':
                        estadoColor = '#ef4444';
                        break;
                }
                
                return `
                    <div class="timeline-item">
                        <div class="timeline-marker" style="background: ${color};">
                            <i class="fas ${icon}"></i>
                        </div>
                        <div class="timeline-content">
                            <div class="timeline-header">
                                <h4>${actividad.detalles}</h4>
                                <span class="timeline-date">${new Date(actividad.fecha).toLocaleString()}</span>
                            </div>
                            <div class="timeline-body">
                                <p>${actividad.comentarios || 'Sin comentarios'}</p>
                                ${actividad.estado ? `
                                    <span class="status-badge" style="background: ${bgColor}; color: ${estadoColor}; border: 1px solid ${estadoColor}20;">
                                        <i class="fas fa-circle"></i> ${actividad.estado.toUpperCase()}
                                    </span>
                                ` : ''}
                                ${actividad.productos ? `
                                    <div class="productos-list">
                                        <strong>Productos:</strong>
                                        <ul>
                                            ${actividad.productos.map(p => `
                                                <li>${p.nombre} - ${p.cantidad} ${p.unidad}</li>
                                            `).join('')}
                                        </ul>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// Función para cargar mis solicitudes
async function loadMisSolicitudes() {
    if (!isAuthenticated || !currentStore) return;
    
    try {
        const response = await fetch(`${API_URL}/tienda/${currentStore.id}/solicitudes`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const solicitudes = await response.json();
        displayMisSolicitudes(solicitudes);
        updateSolicitudesBadge(solicitudes.length);
    } catch (error) {
        console.error('Error cargando solicitudes:', error);
        showSolicitudesError(error.message);
    }
}

// Mostrar mis solicitudes
function displayMisSolicitudes(solicitudes) {
    const container = document.getElementById('requestsContainer');
    if (!container) return;
    
    if (!solicitudes || solicitudes.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard-list"></i>
                <h3>No tienes solicitudes</h3>
                <p>Aún no has realizado ninguna solicitud</p>
                <button onclick="window.solicitarProductos()" class="btn-primary" style="width: auto; margin-top: 20px; padding: 10px 20px; background: #10b981;">
                    <i class="fas fa-plus"></i> Crear primera solicitud
                </button>
            </div>
        `;
        return;
    }
    
    // Ordenar solicitudes por fecha (más recientes primero)
    solicitudes.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    container.innerHTML = `
        <div class="requests-grid">
            ${solicitudes.map(solicitud => {
                // Determinar color según estado
                let estadoColor = '#6b7280';
                let bgColor = '#f3f4f6';
                let icon = 'fa-clock';
                
                switch(solicitud.estado) {
                    case 'pendiente':
                        estadoColor = '#f59e0b';
                        bgColor = '#fef3c7';
                        icon = 'fa-clock';
                        break;
                    case 'aceptada':
                        estadoColor = '#10b981';
                        bgColor = '#d1fae5';
                        icon = 'fa-check-circle';
                        break;
                    case 'rechazada':
                        estadoColor = '#ef4444';
                        bgColor = '#fee2e2';
                        icon = 'fa-times-circle';
                        break;
                    case 'modificada':
                        estadoColor = '#3b82f6';
                        bgColor = '#dbeafe';
                        icon = 'fa-edit';
                        break;
                }
                
                return `
                    <div class="request-card">
                        <div class="request-header">
                            <h4>Solicitud #${solicitud.id}</h4>
                            <span class="request-date">${new Date(solicitud.fecha).toLocaleDateString()}</span>
                        </div>
                        
                        <div class="request-status" style="background: ${bgColor}; color: ${estadoColor};">
                            <i class="fas ${icon}"></i> ${solicitud.estado.toUpperCase()}
                        </div>
                        
                        <div class="request-products">
                            <strong>Productos solicitados:</strong>
                            <ul>
                                ${solicitud.productos.map(p => `
                                    <li>
                                        ${p.nombre} - ${p.cantidad} ${p.unidad}
                                        <span class="product-price">$${(p.precio * p.cantidad).toFixed(2)}</span>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                        
                        <div class="request-footer">
                            <div class="request-total">
                                <strong>Total:</strong> $${solicitud.total.toFixed(2)}
                            </div>
                            ${solicitud.comentarios ? `
                                <div class="request-comments">
                                    <strong>Comentarios:</strong> ${solicitud.comentarios}
                                </div>
                            ` : ''}
                            ${solicitud.fechaActualizacion ? `
                                <div class="request-updated">
                                    <i class="fas fa-calendar-alt"></i>
                                    Actualizado: ${new Date(solicitud.fechaActualizacion).toLocaleDateString()}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// ========== FUNCIONES DE FILTRADO ==========

// Función para filtrar productos del almacén central
function filterProducts(searchTerm, category) {
    const products = document.querySelectorAll('.product-card');
    const term = searchTerm.toLowerCase().trim();
    const categoryLower = category.toLowerCase();
    
    products.forEach(product => {
        const productName = product.getAttribute('data-name') || '';
        const productCategory = product.getAttribute('data-category') || '';
        
        const matchesSearch = term === '' || productName.includes(term);
        const matchesCategory = category === '' || productCategory.includes(categoryLower);
        
        if (matchesSearch && matchesCategory) {
            product.style.display = 'block';
        } else {
            product.style.display = 'none';
        }
    });
}

// Función para filtrar productos de Mi Almacén
function filterMiAlmacenProducts(searchTerm) {
    const products = document.querySelectorAll('#miAlmacenGrid .product-card');
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

// ========== FUNCIONES DEL CARRITO Y SOLICITUDES ==========

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

window.validateQuantity = function(productId, max) {
    const input = document.getElementById(`qty-${productId}`);
    if (input) {
        let value = parseInt(input.value);
        if (isNaN(value) || value < 1) value = 1;
        if (value > max) value = max;
        input.value = value;
    }
};

// Función para agregar al carrito
window.agregarASolicitud = function(productId, productName, precio, unidad, categoria) {
    const input = document.getElementById(`qty-${productId}`);
    const quantity = input ? parseInt(input.value) : 1;
    
    // Verificar si ya está en el carrito
    const existingIndex = cart.findIndex(item => item.id === productId);
    
    if (existingIndex > -1) {
        // Actualizar cantidad
        cart[existingIndex].cantidad = quantity;
        cart[existingIndex].subtotal = precio * quantity;
    } else {
        // Agregar nuevo
        cart.push({
            id: productId,
            nombre: productName,
            precio: precio,
            cantidad: quantity,
            unidad: unidad || 'unidad',
            categoria: categoria,
            subtotal: precio * quantity
        });
    }
    
    // Actualizar vista
    if (document.querySelector('.breadcrumb-item.active')?.textContent === 'Almacén Central') {
        loadProducts(); // Recargar para actualizar indicadores
    }
    
    // Guardar en localStorage
    localStorage.setItem('tienda_cart', JSON.stringify(cart));
    
    // Actualizar botón de carrito
    const carritoBtn = document.querySelector('button[onclick*="verCarrito"]');
    if (carritoBtn) {
        carritoBtn.innerHTML = `<i class="fas fa-shopping-cart"></i> Carrito (${cart.length})`;
    }
    
    // Mostrar notificación
    showNotification(`${productName} ${existingIndex > -1 ? 'actualizado' : 'agregado'} al carrito: ${quantity} ${unidad || 'unidades'}`);
};

// Función para ver el carrito
window.verCarrito = function() {
    if (cart.length === 0) {
        alert('Tu carrito está vacío. Agrega productos del almacén central.');
        return;
    }
    
    breadcrumb.innerHTML = `
        <span class="breadcrumb-item" onclick="window.loadAlmacenCentralView()" style="cursor: pointer;">Almacén Central</span>
        <span class="breadcrumb-item active">Carrito de Solicitud</span>
    `;
    
    const total = cart.reduce((sum, item) => sum + item.subtotal, 0);
    
    mainContent.innerHTML = `
        <div class="section-header">
            <h2><i class="fas fa-shopping-cart"></i> Carrito de Solicitud</h2>
            <div class="header-actions">
                <button class="btn-primary" onclick="window.loadAlmacenCentralView()" style="width: auto; padding: 10px 20px;">
                    <i class="fas fa-arrow-left"></i> Seguir comprando
                </button>
                <button class="btn-primary" onclick="window.vaciarCarrito()" style="width: auto; padding: 10px 20px; background: #ef4444;">
                    <i class="fas fa-trash"></i> Vaciar carrito
                </button>
            </div>
        </div>
        
        <div class="cart-container">
            <div class="cart-items">
                ${cart.map((item, index) => `
                    <div class="cart-item">
                        <div class="cart-item-info">
                            <h4>${item.nombre}</h4>
                            <p>$${item.precio.toFixed(2)} por ${item.unidad}</p>
                            <span class="product-category">${getCategoryName(item.categoria)}</span>
                        </div>
                        
                        <div class="cart-item-quantity">
                            <div class="quantity-selector">
                                <button class="qty-btn" onclick="updateCartQuantity(${index}, -1)">-</button>
                                <input type="number" id="cart-qty-${index}" value="${item.cantidad}" min="1" class="qty-input">
                                <button class="qty-btn" onclick="updateCartQuantity(${index}, 1)">+</button>
                            </div>
                            <button class="btn-small btn-danger" onclick="removeFromCart(${index})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                        
                        <div class="cart-item-subtotal">
                            $${item.subtotal.toFixed(2)}
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="cart-summary">
                <div class="summary-row">
                    <span>Subtotal</span>
                    <span>$${total.toFixed(2)}</span>
                </div>
                <div class="summary-row">
                    <span>Envío</span>
                    <span>$0.00</span>
                </div>
                <div class="summary-row total">
                    <span><strong>Total</strong></span>
                    <span><strong>$${total.toFixed(2)}</strong></span>
                </div>
                
                <div style="margin-top: 30px;">
                    <textarea id="comentariosSolicitud" placeholder="Agrega comentarios para el proveedor (opcional)" 
                              style="width: 100%; padding: 12px; border-radius: 8px; border: 2px solid #e5e7eb; margin-bottom: 20px; min-height: 100px;"></textarea>
                    
                    <button class="btn-primary" onclick="enviarSolicitud()" style="width: 100%; padding: 15px; font-size: 18px; background: #10b981;">
                        <i class="fas fa-paper-plane"></i> Enviar Solicitud al Proveedor
                    </button>
                    
                    <p style="text-align: center; margin-top: 10px; color: #6b7280; font-size: 14px;">
                        <i class="fas fa-info-circle"></i> El proveedor revisará tu solicitud y te notificará
                    </p>
                </div>
            </div>
        </div>
    `;
};

// Funciones del carrito
window.updateCartQuantity = function(index, change) {
    const input = document.getElementById(`cart-qty-${index}`);
    if (input) {
        let newValue = parseInt(input.value) + change;
        if (newValue < 1) newValue = 1;
        input.value = newValue;
        
        // Actualizar en el array
        cart[index].cantidad = newValue;
        cart[index].subtotal = cart[index].precio * newValue;
        
        // Actualizar vista
        document.querySelectorAll('.cart-item-subtotal')[index].textContent = `$${cart[index].subtotal.toFixed(2)}`;
        
        // Actualizar total
        const total = cart.reduce((sum, item) => sum + item.subtotal, 0);
        document.querySelectorAll('.summary-row.total span')[1].innerHTML = `<strong>$${total.toFixed(2)}</strong>`;
        
        // Guardar en localStorage
        localStorage.setItem('tienda_cart', JSON.stringify(cart));
    }
};

window.removeFromCart = function(index) {
    cart.splice(index, 1);
    localStorage.setItem('tienda_cart', JSON.stringify(cart));
    window.verCarrito();
};

window.vaciarCarrito = function() {
    if (confirm('¿Estás seguro de vaciar el carrito?')) {
        cart = [];
        localStorage.removeItem('tienda_cart');
        
        // Volver al almacén central
        window.loadAlmacenCentralView();
        
        showNotification('Carrito vaciado');
    }
};

// Función para enviar solicitud
window.enviarSolicitud = async function() {
    if (cart.length === 0) {
        alert('No hay productos en el carrito');
        return;
    }
    
    const comentarios = document.getElementById('comentariosSolicitud').value;
    const total = cart.reduce((sum, item) => sum + item.subtotal, 0);
    
    const solicitud = {
        tiendaId: currentStore.id,
        productos: cart.map(item => ({
            id: item.id,
            nombre: item.nombre,
            precio: item.precio,
            cantidad: item.cantidad,
            unidad: item.unidad,
            categoria: item.categoria
        })),
        total: total,
        comentarios: comentarios
    };
    
    try {
        const response = await fetch(`${API_URL}/tienda/solicitudes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'username': authHeaders.username,
                'password': authHeaders.password
            },
            body: JSON.stringify(solicitud)
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Limpiar carrito
            cart = [];
            localStorage.removeItem('tienda_cart');
            
            // Mostrar mensaje de éxito
            alert(`¡Solicitud enviada correctamente!\n\nID: #${data.solicitud.id}\nTotal: $${total.toFixed(2)}\n\nEl proveedor revisará tu solicitud y te notificará.`);
            
            // Volver a mis solicitudes
            window.loadSolicitudesView();
        } else {
            if (data.productosNoDisponibles) {
                // Mostrar productos no disponibles
                let mensaje = 'Algunos productos no tienen suficiente stock:\n\n';
                data.productosNoDisponibles.forEach(p => {
                    mensaje += `• ${p.productoNombre}: Solicitado ${p.cantidadSolicitada}, Disponible ${p.cantidadDisponible}\n`;
                });
                mensaje += '\nPor favor, ajusta las cantidades.';
                alert(mensaje);
            } else {
                alert(`Error: ${data.error}`);
            }
        }
    } catch (error) {
        console.error('Error enviando solicitud:', error);
        alert('Error al enviar la solicitud. Intenta nuevamente.');
    }
};

// Función para solicitar productos (atajo)
window.solicitarProductos = function() {
    if (cart.length > 0) {
        window.verCarrito();
    } else {
        window.loadAlmacenCentralView();
    }
};

window.solicitarMas = function(productId, productName) {
    alert(`Redirigiendo al almacén central para solicitar más de: ${productName}`);
    window.loadAlmacenCentralView();
};

window.verDetalles = function(productId) {
    alert(`Detalles del producto ${productId} - Esta funcionalidad se desarrollará en la próxima versión.`);
};

// ========== FUNCIONES AUXILIARES ==========

// Mostrar notificación
function showNotification(message) {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Mostrar errores específicos
function showProductsError(message) {
    const container = document.getElementById('productsGrid');
    if (!container) return;
    
    container.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Error al cargar productos</h3>
            <p>${message || 'No se pudieron cargar los productos del almacén central'}</p>
            <p style="font-size: 12px; color: #6b7280; margin-top: 10px;">
                Usando productos de demostración para continuar con la funcionalidad
            </p>
            <button onclick="window.loadProducts()" class="btn-primary" style="width: auto; margin-top: 20px; padding: 10px 20px;">
                <i class="fas fa-sync-alt"></i> Reintentar conexión
            </button>
        </div>
    `;
}

function showMiAlmacenEmpty() {
    const container = document.getElementById('miAlmacenGrid');
    if (!container) return;
    
    container.innerHTML = `
        <div class="empty-state">
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
}

function showMiAlmacenError(message) {
    const container = document.getElementById('miAlmacenGrid');
    if (!container) return;
    
    container.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Error al cargar productos</h3>
            <p>${message || 'No se pudieron cargar los productos de tu almacén'}</p>
            <button onclick="window.loadMiAlmacenView()" class="btn-primary" style="width: auto; margin-top: 20px; padding: 10px 20px;">
                <i class="fas fa-sync-alt"></i> Reintentar
            </button>
        </div>
    `;
}

function showRegistroError(message) {
    const container = document.getElementById('activitiesContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Error al cargar actividades</h3>
            <p>${message || 'No se pudieron cargar el registro de actividades'}</p>
            <button onclick="window.loadRegistroView()" class="btn-primary" style="width: auto; margin-top: 20px; padding: 10px 20px;">
                <i class="fas fa-sync-alt"></i> Reintentar
            </button>
        </div>
    `;
}

function showSolicitudesError(message) {
    const container = document.getElementById('requestsContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Error al cargar solicitudes</h3>
            <p>${message || 'No se pudieron cargar tus solicitudes'}</p>
            <button onclick="window.loadSolicitudesView()" class="btn-primary" style="width: auto; margin-top: 20px; padding: 10px 20px;">
                <i class="fas fa-sync-alt"></i> Reintentar
            </button>
        </div>
    `;
}

// Actualizar badges
async function updateCentralBadge(count) {
    if (count === undefined) {
        try {
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

async function updateMiAlmacenBadge(count) {
    if (count === undefined) {
        try {
            if (currentStore) {
                const response = await fetch(`${API_URL}/tienda/${currentStore.id}/productos-aprobados`);
                if (response.ok) {
                    const productos = await response.json();
                    count = productos.length;
                }
            }
        } catch (error) {
            console.error('Error obteniendo conteo:', error);
        }
    }
    
    const badge = document.getElementById('miAlmacenBadge');
    if (badge) {
        badge.textContent = count ? `${count} productos` : '0 productos';
    }
}

async function updateRegistroBadge(count) {
    if (count === undefined) {
        try {
            if (currentStore) {
                const response = await fetch(`${API_URL}/tienda/${currentStore.id}/registro-actividades`);
                if (response.ok) {
                    const actividades = await response.json();
                    count = actividades.length;
                }
            }
        } catch (error) {
            console.error('Error obteniendo conteo:', error);
        }
    }
    
    const badge = document.getElementById('registroBadge');
    if (badge) {
        badge.textContent = count ? `${count} actividades` : 'Ver';
    }
}

async function updateSolicitudesBadge(count) {
    if (count === undefined) {
        try {
            if (currentStore) {
                const response = await fetch(`${API_URL}/tienda/${currentStore.id}/solicitudes`);
                if (response.ok) {
                    const solicitudes = await response.json();
                    count = solicitudes.length;
                }
            }
        } catch (error) {
            console.error('Error obteniendo conteo:', error);
        }
    }
    
    const badge = document.getElementById('solicitudesBadge');
    if (badge) {
        badge.textContent = count ? `${count} solicitudes` : 'Ver';
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

// Cargar carrito desde localStorage
function loadCartFromStorage() {
    const savedCart = localStorage.getItem('tienda_cart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
        } catch (error) {
            console.error('Error cargando carrito:', error);
            cart = [];
        }
    }
}

// Intentar auto-login con credenciales guardadas
function tryAutoLogin() {
    const savedCredentials = localStorage.getItem('tienda_credentials');
    
    if (savedCredentials) {
        try {
            const credentials = JSON.parse(savedCredentials);
            document.getElementById('loginUsername').value = credentials.username || '';
            
            // Intentar login automático si hay credenciales guardadas
            if (credentials.username && credentials.password) {
                // Simular click en login
                document.getElementById('loginUsername').value = credentials.username;
                document.getElementById('loginPassword').value = credentials.password;
                
                // Esperar un momento y hacer login automático
                setTimeout(() => {
                    const loginBtn = document.querySelector('#loginForm button[type="submit"]');
                    if (loginBtn) {
                        loginBtn.click();
                    }
                }, 500);
            }
        } catch (error) {
            console.error('Error al cargar credenciales:', error);
            localStorage.removeItem('tienda_credentials');
        }
    } else {
        // Prellenar con credenciales de prueba si no hay guardadas
        document.getElementById('loginUsername').value = 'tienda1';
        document.getElementById('loginPassword').value = 'tienda123';
    }
    
    // Cargar carrito
    loadCartFromStorage();
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
        
        // Si estamos en Mi Almacén, actualizar productos
        if (document.querySelector('.breadcrumb-item.active')?.textContent === 'Mi Almacén') {
            await loadMiAlmacenProducts();
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
    /* Nuevos estilos para las nuevas funcionalidades */
    
    .approved-badge {
        background: #d1fae5;
        color: #065f46;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        display: inline-flex;
        align-items: center;
        gap: 5px;
    }
    
    .cart-indicator {
        background: #fef3c7;
        color: #92400e;
        padding: 8px;
        border-radius: 8px;
        margin-top: 10px;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 8px;
        border-left: 4px solid #f59e0b;
    }
    
    .btn-warning {
        background: #f59e0b;
        color: white;
    }
    
    .btn-info {
        background: #3b82f6;
        color: white;
    }
    
    .btn-danger {
        background: #ef4444;
        color: white;
    }
    
    .cart-container {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 30px;
        margin-top: 20px;
    }
    
    @media (max-width: 768px) {
        .cart-container {
            grid-template-columns: 1fr;
        }
    }
    
    .cart-items {
        background: white;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    
    .cart-item {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr;
        gap: 20px;
        padding: 15px 0;
        border-bottom: 1px solid #e5e7eb;
        align-items: center;
    }
    
    .cart-item:last-child {
        border-bottom: none;
    }
    
    @media (max-width: 768px) {
        .cart-item {
            grid-template-columns: 1fr;
            gap: 10px;
        }
    }
    
    .cart-item-info h4 {
        margin-bottom: 5px;
        color: #1f2937;
    }
    
    .cart-item-subtotal {
        font-size: 18px;
        font-weight: 600;
        color: #1f2937;
        text-align: right;
    }
    
    .cart-summary {
        background: white;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        height: fit-content;
    }
    
    .summary-row {
        display: flex;
        justify-content: space-between;
        padding: 10px 0;
        border-bottom: 1px solid #e5e7eb;
    }
    
    .summary-row.total {
        border-top: 2px solid #1f2937;
        border-bottom: none;
        font-size: 18px;
        margin-top: 10px;
        padding-top: 15px;
    }
    
    /* Timeline para registro de actividades */
    .timeline {
        position: relative;
        padding: 20px 0;
    }
    
    .timeline-item {
        display: flex;
        margin-bottom: 30px;
        position: relative;
    }
    
    .timeline-marker {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        margin-right: 20px;
        flex-shrink: 0;
    }
    
    .timeline-content {
        flex: 1;
        background: white;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    
    .timeline-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
    }
    
    .timeline-header h4 {
        color: #1f2937;
        font-size: 16px;
    }
    
    .timeline-date {
        color: #6b7280;
        font-size: 14px;
    }
    
    .timeline-body {
        color: #6b7280;
        font-size: 14px;
    }
    
    .productos-list {
        margin-top: 10px;
        padding: 10px;
        background: #f8fafc;
        border-radius: 8px;
    }
    
    .productos-list ul {
        margin-top: 5px;
        padding-left: 20px;
    }
    
    /* Grid para solicitudes */
    .requests-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: 20px;
        margin-top: 20px;
    }
    
    .request-card {
        background: white;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        border-left: 4px solid #3b82f6;
    }
    
    .request-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        padding-bottom: 10px;
        border-bottom: 1px solid #e5e7eb;
    }
    
    .request-header h4 {
        color: #1f2937;
        font-size: 18px;
    }
    
    .request-date {
        color: #6b7280;
        font-size: 14px;
    }
    
    .request-status {
        padding: 8px 15px;
        border-radius: 20px;
        font-weight: 600;
        font-size: 12px;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 15px;
    }
    
    .request-products {
        margin-bottom: 15px;
    }
    
    .request-products ul {
        margin-top: 10px;
        padding-left: 20px;
    }
    
    .request-products li {
        display: flex;
        justify-content: space-between;
        padding: 5px 0;
        border-bottom: 1px dashed #e5e7eb;
    }
    
    .request-footer {
        padding-top: 15px;
        border-top: 1px solid #e5e7eb;
    }
    
    .request-total {
        font-size: 18px;
        font-weight: 600;
        color: #1f2937;
        margin-bottom: 10px;
        display: flex;
        justify-content: space-between;
    }
    
    .request-comments {
        background: #f8fafc;
        padding: 10px;
        border-radius: 8px;
        margin-top: 10px;
        font-size: 14px;
    }
    
    .request-updated {
        color: #6b7280;
        font-size: 12px;
        margin-top: 10px;
        display: flex;
        align-items: center;
        gap: 5px;
    }
    
    /* Animaciones para notificaciones */
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
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