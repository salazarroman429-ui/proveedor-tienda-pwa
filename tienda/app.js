// app.js - Versión corregida (tienda)
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
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
        setTimeout(() => {
            element.style.display = 'none';
        }, 3000);
    } else {
        console.error('Error:', message);
    }
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
            
            <div class="grid-card" data-action="registro" onclick="window.loadRegistroView()">
                <i class="fas fa-history"></i>
                <h3>Registro de Actividades</h3>
                <p>Historial de movimientos</p>
            </div>
            
            <div class="grid-card" data-action="solicitudes" onclick="window.loadSolicitudesView()">
                <i class="fas fa-clipboard-list"></i>
                <h3>Solicitudes</h3>
                <p>Gestión de pedidos</p>
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
                <button class="btn-primary" onclick="window.loadAlmacenCentralView()" style="width: auto; padding: 10px 20px;">
                    <i class="fas fa-shopping-cart"></i> Solicitar Productos
                </button>
            </div>
        </div>
        
        <div id="miAlmacenContainer" class="products-grid">
            <div class="empty-state">
                <i class="fas fa-spinner fa-spin"></i>
                <h3>Cargando tu inventario...</h3>
            </div>
        </div>
        
        <div style="margin-top: 20px; text-align: center;">
            <button class="btn-primary" onclick="window.loadHomeView()" style="width: auto; padding: 10px 20px; background: #6b7280;">
                <i class="fas fa-arrow-left"></i> Volver al Inicio
            </button>
        </div>
    `;
    
    // Cargar productos del almacén propio
    loadMiAlmacenData();
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
                <button class="btn-primary" onclick="window.openCarritoModal()" style="width: auto; padding: 10px 20px; background: #10b981;">
                    <i class="fas fa-shopping-cart"></i> Ver Carrito (<span id="carritoCount">0</span>)
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

window.loadRegistroView = function() {
    breadcrumb.innerHTML = `
        <span class="breadcrumb-item" onclick="window.loadHomeView()" style="cursor: pointer;">Inicio</span>
        <span class="breadcrumb-item active">Registro de Actividades</span>
    `;
    
    mainContent.innerHTML = `
        <div class="section-header">
            <h2><i class="fas fa-history"></i> Registro de Actividades</h2>
        </div>
        
        <div id="registroContainer" class="activities-list">
            <div class="empty-state">
                <i class="fas fa-spinner fa-spin"></i>
                <h3>Cargando actividades...</h3>
            </div>
        </div>
        
        <div style="margin-top: 20px; text-align: center;">
            <button class="btn-primary" onclick="window.loadHomeView()" style="width: auto; padding: 10px 20px; background: #6b7280;">
                <i class="fas fa-arrow-left"></i> Volver al Inicio
            </button>
        </div>
    `;
    
    // Cargar registro de actividades
    loadRegistroData();
};

window.loadSolicitudesView = function() {
    breadcrumb.innerHTML = `
        <span class="breadcrumb-item" onclick="window.loadHomeView()" style="cursor: pointer;">Inicio</span>
        <span class="breadcrumb-item active">Mis Solicitudes</span>
    `;
    
    mainContent.innerHTML = `
        <div class="section-header">
            <h2><i class="fas fa-clipboard-list"></i> Mis Solicitudes</h2>
            <button class="btn-primary" onclick="window.loadAlmacenCentralView()" style="width: auto; padding: 10px 20px; background: #10b981;">
                <i class="fas fa-plus"></i> Nueva Solicitud
            </button>
        </div>
        
        <div id="solicitudesContainer" class="requests-list">
            <div class="empty-state">
                <i class="fas fa-spinner fa-spin"></i>
                <h3>Cargando solicitudes...</h3>
            </div>
        </div>
        
        <div style="margin-top: 20px; text-align: center;">
            <button class="btn-primary" onclick="window.loadHomeView()" style="width: auto; padding: 10px 20px; background: #6b7280;">
                <i class="fas fa-arrow-left"></i> Volver al Inicio
            </button>
        </div>
    `;
    
    // Cargar solicitudes
    loadSolicitudesData();
};

// Variables para el carrito
let carrito = [];

// Función para cargar productos del almacén central (CORREGIDA)
async function loadProducts() {
    if (!isAuthenticated) return;
    
    const isConnected = await checkConnection();
    if (!isConnected) {
        showProductsError('No hay conexión con el proveedor');
        return;
    }
    
    try {
        // CORRECCIÓN: Usar /api/tienda/productos
        const response = await fetch(`${API_URL}/tienda/productos`);
        
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
        console.log('Productos obtenidos:', productos.length);
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
        
        // Verificar si el producto ya está en el carrito
        const enCarrito = carrito.find(item => item.id === producto.id);
        const cantidadCarrito = enCarrito ? enCarrito.cantidad : 0;
        
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
                        <button class="qty-btn" onclick="decreaseQuantity(${producto.id})">-</button>
                        <input type="number" id="qty-${producto.id}" value="1" min="1" max="${cantidad}" class="qty-input">
                        <button class="qty-btn" onclick="increaseQuantity(${producto.id}, ${cantidad})">+</button>
                    </div>
                    <button class="btn-small ${enCarrito ? 'btn-secondary' : 'btn-primary'}" 
                            onclick="agregarAlCarrito(${producto.id}, '${producto.nombre.replace(/'/g, "\\'")}', ${producto.precio}, '${producto.categoria}', '${producto.unidad}')">
                        <i class="fas ${enCarrito ? 'fa-check' : 'fa-cart-plus'}"></i> 
                        ${enCarrito ? `En carrito (${cantidadCarrito})` : 'Agregar'}
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

// Función para agregar al carrito
window.agregarAlCarrito = function(productId, productName, precio, categoria, unidad) {
    const input = document.getElementById(`qty-${productId}`);
    const quantity = input ? parseInt(input.value) : 1;
    
    // Buscar si ya existe en el carrito
    const index = carrito.findIndex(item => item.id === productId);
    
    if (index !== -1) {
        // Actualizar cantidad
        carrito[index].cantidad += quantity;
        if (carrito[index].cantidad <= 0) {
            carrito.splice(index, 1);
        }
    } else {
        // Agregar nuevo item
        carrito.push({
            id: productId,
            nombre: productName,
            precio: precio,
            cantidad: quantity,
            categoria: categoria,
            unidad: unidad
        });
    }
    
    // Actualizar botón
    const button = document.querySelector(`button[onclick*="agregarAlCarrito(${productId}"]`);
    if (button) {
        const item = carrito.find(item => item.id === productId);
        if (item) {
            button.className = 'btn-small btn-secondary';
            button.innerHTML = `<i class="fas fa-check"></i> En carrito (${item.cantidad})`;
        } else {
            button.className = 'btn-small btn-primary';
            button.innerHTML = `<i class="fas fa-cart-plus"></i> Agregar`;
        }
    }
    
    // Actualizar contador del carrito
    updateCarritoCount();
    
    // Resetear cantidad si se agregó al carrito
    if (input && index === -1) {
        input.value = 1;
    }
};

// Función para abrir modal del carrito
window.openCarritoModal = function() {
    if (carrito.length === 0) {
        alert('El carrito está vacío. Agrega productos primero.');
        return;
    }
    
    // Calcular total
    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    
    // Crear modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;
    
    modal.innerHTML = `
        <div class="modal-content" style="background: white; border-radius: 12px; padding: 30px; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto;">
            <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="margin: 0; color: #f5576c;"><i class="fas fa-shopping-cart"></i> Carrito de Compras</h2>
                <button onclick="this.closest('.modal').remove()" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #6b7280;">&times;</button>
            </div>
            
            <div id="carritoItems" style="margin-bottom: 20px;">
                ${carrito.map((item, index) => `
                    <div class="carrito-item" style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #f8f9fa; border-radius: 8px; margin-bottom: 10px;">
                        <div>
                            <strong>${item.nombre}</strong><br>
                            <small>$${item.precio.toFixed(2)} × ${item.cantidad} ${item.unidad}</small>
                        </div>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span style="font-weight: bold; color: #f5576c;">$${(item.precio * item.cantidad).toFixed(2)}</span>
                            <button onclick="eliminarDelCarrito(${index})" style="background: #ef4444; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div style="border-top: 2px solid #e5e7eb; padding-top: 15px; margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold;">
                    <span>Total:</span>
                    <span style="color: #f5576c;">$${total.toFixed(2)}</span>
                </div>
            </div>
            
            <div style="display: flex; gap: 10px;">
                <button onclick="enviarSolicitud()" class="btn-primary" style="flex: 1;">
                    <i class="fas fa-paper-plane"></i> Enviar Solicitud
                </button>
                <button onclick="this.closest('.modal').remove()" style="flex: 1; background: #6b7280; color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer;">
                    Cancelar
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Cerrar al hacer clic fuera
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
};

// Función para eliminar del carrito
window.eliminarDelCarrito = function(index) {
    carrito.splice(index, 1);
    updateCarritoCount();
    
    // Recargar productos para actualizar botones
    if (document.querySelector('.breadcrumb-item.active')?.textContent === 'Almacén Central') {
        loadProducts();
    }
    
    // Actualizar modal si está abierto
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
        if (carrito.length > 0) {
            window.openCarritoModal();
        } else {
            alert('Carrito vaciado');
        }
    }
};

// Función para enviar solicitud
window.enviarSolicitud = async function() {
    if (!isAuthenticated || !currentStore || carrito.length === 0) return;
    
    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    
    const solicitud = {
        tiendaId: currentStore.id,
        productos: carrito.map(item => ({
            id: item.id,
            nombre: item.nombre,
            precio: item.precio,
            cantidad: item.cantidad,
            unidad: item.unidad,
            categoria: item.categoria
        })),
        total: total,
        comentarios: `Solicitud enviada desde la tienda ${currentStore.storename}`
    };
    
    try {
        const response = await fetch(`${API_URL}/tienda/solicitudes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(solicitud)
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('✅ Solicitud enviada exitosamente\n\nEl proveedor revisará tu solicitud y te notificará.');
            
            // Limpiar carrito
            carrito = [];
            updateCarritoCount();
            
            // Cerrar modal
            const modal = document.querySelector('.modal');
            if (modal) modal.remove();
            
            // Recargar productos para actualizar botones
            if (document.querySelector('.breadcrumb-item.active')?.textContent === 'Almacén Central') {
                loadProducts();
            }
        } else {
            alert('❌ Error al enviar solicitud: ' + (data.error || 'Error desconocido'));
        }
    } catch (error) {
        console.error('Error enviando solicitud:', error);
        alert('❌ Error de conexión al enviar solicitud');
    }
};

// Función para cargar Mi Almacén
async function loadMiAlmacenData() {
    if (!isAuthenticated || !currentStore) return;
    
    try {
        // CORRECCIÓN: Usar /api/tienda/:id/productos-aprobados
        const response = await fetch(`${API_URL}/tienda/${currentStore.id}/productos-aprobados`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const productos = await response.json();
        displayMiAlmacen(productos);
    } catch (error) {
        console.error('Error cargando mi almacén:', error);
        showMiAlmacenError(error.message);
    }
}

// Mostrar Mi Almacén
function displayMiAlmacen(productos) {
    const container = document.getElementById('miAlmacenContainer');
    if (!container) return;
    
    if (!productos || productos.length === 0) {
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
                </div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = productos.map(producto => {
        const categoryName = getCategoryName(producto.categoria);
        const cantidadAprobada = producto.cantidadAprobada || producto.cantidad || 0;
        
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
                    ${producto.descripcion || 'Sin descripción'}
                </div>
                
                <div class="product-meta">
                    <span>
                        <i class="fas fa-cube"></i>
                        ${cantidadAprobada} ${producto.unidad || 'unidades'} aprobadas
                    </span>
                    <span>
                        <i class="fas fa-calendar-check"></i>
                        ${producto.fechaAprobacion ? new Date(producto.fechaAprobacion).toLocaleDateString() : 'Sin fecha'}
                    </span>
                    <span>
                        <i class="fas fa-clipboard"></i>
                        Solicitud #${producto.solicitudId || 'N/A'}
                    </span>
                </div>
                
                <div class="product-info">
                    <small><i class="fas fa-info-circle"></i> Producto aprobado por el proveedor</small>
                </div>
            </div>
        `;
    }).join('');
}

// Función para cargar registro de actividades
async function loadRegistroData() {
    if (!isAuthenticated || !currentStore) return;
    
    try {
        // CORRECCIÓN: Usar /api/tienda/:id/registro-actividades
        const response = await fetch(`${API_URL}/tienda/${currentStore.id}/registro-actividades`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const actividades = await response.json();
        displayRegistro(actividades);
    } catch (error) {
        console.error('Error cargando registro:', error);
        showRegistroError(error.message);
    }
}

// Mostrar registro de actividades
function displayRegistro(actividades) {
    const container = document.getElementById('registroContainer');
    if (!container) return;
    
    if (!actividades || actividades.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-history"></i>
                <h3>No hay actividades registradas</h3>
                <p>Tu historial de actividades aparecerá aquí.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = actividades.map(actividad => {
        const icon = actividad.tipo === 'solicitud' ? 'fa-clipboard-list' : 
                    actividad.tipo === 'actualizacion' ? 'fa-sync-alt' : 'fa-history';
        const color = actividad.estado === 'aceptada' ? '#10b981' : 
                     actividad.estado === 'rechazada' ? '#ef4444' : 
                     actividad.estado === 'pendiente' ? '#f59e0b' : '#6b7280';
        
        return `
            <div class="activity-card" style="background: white; border-radius: 8px; padding: 15px; margin-bottom: 10px; border-left: 4px solid ${color};">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <i class="fas ${icon}" style="color: ${color}; margin-right: 10px;"></i>
                        <strong>${actividad.detalles}</strong>
                    </div>
                    <small style="color: #6b7280;">${new Date(actividad.fecha).toLocaleString()}</small>
                </div>
                ${actividad.comentarios ? `<p style="margin: 10px 0 0 0; color: #6b7280; font-size: 14px;">${actividad.comentarios}</p>` : ''}
            </div>
        `;
    }).join('');
}

// Función para cargar solicitudes
async function loadSolicitudesData() {
    if (!isAuthenticated || !currentStore) return;
    
    try {
        // CORRECCIÓN: Usar /api/tienda/:id/solicitudes
        const response = await fetch(`${API_URL}/tienda/${currentStore.id}/solicitudes`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const solicitudes = await response.json();
        displaySolicitudes(solicitudes);
    } catch (error) {
        console.error('Error cargando solicitudes:', error);
        showSolicitudesError(error.message);
    }
}

// Mostrar solicitudes
function displaySolicitudes(solicitudes) {
    const container = document.getElementById('solicitudesContainer');
    if (!container) return;
    
    if (!solicitudes || solicitudes.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard-list"></i>
                <h3>No hay solicitudes</h3>
                <p>No has realizado ninguna solicitud aún.</p>
                <button class="btn-primary" onclick="window.loadAlmacenCentralView()" style="width: auto; margin-top: 20px; padding: 10px 20px; background: #10b981;">
                    <i class="fas fa-plus"></i> Crear primera solicitud
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = solicitudes.map(solicitud => {
        const color = solicitud.estado === 'aceptada' ? '#10b981' : 
                     solicitud.estado === 'rechazada' ? '#ef4444' : 
                     solicitud.estado === 'pendiente' ? '#f59e0b' : '#6b7280';
        
        return `
            <div class="request-card" style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 15px; border-left: 4px solid ${color};">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                    <div>
                        <h4 style="margin: 0; color: #1f2937;">Solicitud #${solicitud.id}</h4>
                        <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">
                            ${new Date(solicitud.fecha).toLocaleString()}
                        </p>
                    </div>
                    <span style="background: ${color}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">
                        ${solicitud.estado.charAt(0).toUpperCase() + solicitud.estado.slice(1)}
                    </span>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <p style="margin: 0; color: #6b7280;"><strong>Productos:</strong> ${solicitud.productos.length} items</p>
                    <p style="margin: 5px 0 0 0; color: #6b7280;"><strong>Total:</strong> $${solicitud.total.toFixed(2)}</p>
                </div>
                
                ${solicitud.comentarios ? `
                    <div style="background: #f8f9fa; padding: 10px; border-radius: 6px; margin-top: 10px;">
                        <small style="color: #6b7280;"><strong>Comentarios:</strong> ${solicitud.comentarios}</small>
                    </div>
                ` : ''}
                
                ${solicitud.fechaActualizacion ? `
                    <div style="margin-top: 10px;">
                        <small style="color: #9ca3af;">
                            <i class="fas fa-clock"></i> Actualizada: ${new Date(solicitud.fechaActualizacion).toLocaleString()}
                        </small>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

// Funciones para mostrar errores
function showProductsError(message) {
    const container = document.getElementById('productsGrid');
    if (!container) return;
    
    container.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Error al cargar productos</h3>
            <p>${message || 'No se pudieron cargar los productos del almacén central'}</p>
            <p>Verifica que el servidor tenga la ruta configurada:</p>
            <p><code>GET /api/tienda/productos</code></p>
            <button onclick="window.loadProducts()" class="btn-primary" style="width: auto; margin-top: 20px; padding: 10px 20px;">
                <i class="fas fa-sync-alt"></i> Reintentar
            </button>
        </div>
    `;
}

function showMiAlmacenError(message) {
    const container = document.getElementById('miAlmacenContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Error al cargar tu almacén</h3>
            <p>${message || 'No se pudo cargar tu inventario'}</p>
            <p>Verifica que el servidor tenga la ruta configurada:</p>
            <p><code>GET /api/tienda/:id/productos-aprobados</code></p>
            <button onclick="window.loadMiAlmacenData()" class="btn-primary" style="width: auto; margin-top: 20px; padding: 10px 20px;">
                <i class="fas fa-sync-alt"></i> Reintentar
            </button>
        </div>
    `;
}

function showRegistroError(message) {
    const container = document.getElementById('registroContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Error al cargar registro</h3>
            <p>${message || 'No se pudo cargar el registro de actividades'}</p>
            <button onclick="window.loadRegistroData()" class="btn-primary" style="width: auto; margin-top: 20px; padding: 10px 20px;">
                <i class="fas fa-sync-alt"></i> Reintentar
            </button>
        </div>
    `;
}

function showSolicitudesError(message) {
    const container = document.getElementById('solicitudesContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Error al cargar solicitudes</h3>
            <p>${message || 'No se pudieron cargar las solicitudes'}</p>
            <button onclick="window.loadSolicitudesData()" class="btn-primary" style="width: auto; margin-top: 20px; padding: 10px 20px;">
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

// Actualizar contador del carrito
function updateCarritoCount() {
    const countElement = document.getElementById('carritoCount');
    if (countElement) {
        const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
        countElement.textContent = totalItems;
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

// Añadir estilos CSS adicionales para el modal y botones secundarios
const style = document.createElement('style');
style.textContent += `
    .btn-secondary {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
    }
    
    .activities-list, .requests-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
`;
document.head.appendChild(style);

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    tryAutoLogin();
});
