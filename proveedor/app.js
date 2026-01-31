// app.js - Versión corregida y actualizada
const API_URL = 'https://proveedor-api-salazar.onrender.com/api';
let deferredPrompt;
let isAuthenticated = false;
let authHeaders = {};

// Elementos del DOM
const loginContainer = document.getElementById('loginContainer');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');
const breadcrumb = document.getElementById('breadcrumb');
const mainContent = document.getElementById('mainContent');

// Login del proveedor
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch(`${API_URL}/proveedor/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            isAuthenticated = true;
            authHeaders = { username, password };
            
            // Mostrar dashboard
            loginContainer.style.display = 'none';
            dashboard.style.display = 'block';
            
            // Cargar vista principal
            loadHomeView();
            checkConnection();
            
            // Iniciar actualizaciones periódicas
            startPeriodicUpdates();
        } else {
            showError(loginError, 'Credenciales incorrectas');
        }
    } catch (error) {
        showError(loginError, 'Error de conexión con el servidor');
    }
});

// Logout
logoutBtn.addEventListener('click', () => {
    isAuthenticated = false;
    authHeaders = {};
    dashboard.style.display = 'none';
    loginContainer.style.display = 'block';
    document.getElementById('loginPassword').value = '';
    
    // Limpiar contenido
    breadcrumb.innerHTML = '<span class="breadcrumb-item active" data-action="home">Inicio</span>';
    mainContent.innerHTML = '';
});

// Verificar conexión
async function checkConnection() {
    if (!isAuthenticated) return;
    
    try {
        const response = await fetch(`${API_URL}/status`);
        const statusElement = document.getElementById('status');
        const statusText = statusElement.querySelector('span');
        
        if (response.ok) {
            statusElement.className = 'status-badge online';
            statusText.textContent = 'Conectado';
        }
    } catch (error) {
        const statusElement = document.getElementById('status');
        const statusText = statusElement.querySelector('span');
        statusElement.className = 'status-badge offline';
        statusText.textContent = 'Desconectado';
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

// ========== FUNCIONES MEJORADAS PARA LA VISTA PRINCIPAL ==========

// Cargar vista principal actualizada
function loadHomeView() {
    console.log('Cargando vista principal mejorada...');
    
    if (!breadcrumb || !mainContent) {
        console.error('Elementos del DOM no encontrados');
        return;
    }
    
    breadcrumb.innerHTML = '<span class="breadcrumb-item active" data-action="home">Inicio</span>';
    
    mainContent.innerHTML = `
        <div class="stats-container">
            <div class="stats-grid" id="statsGrid">
                <div class="stat-card">
                    <i class="fas fa-boxes"></i>
                    <div class="stat-value" id="totalProducts">0</div>
                    <div class="stat-label">Productos</div>
                </div>
                <div class="stat-card">
                    <i class="fas fa-store"></i>
                    <div class="stat-value" id="totalStores">0</div>
                    <div class="stat-label">Tiendas</div>
                </div>
                <div class="stat-card">
                    <i class="fas fa-clipboard-list"></i>
                    <div class="stat-value" id="pendingRequests">0</div>
                    <div class="stat-label">Solicitudes Pendientes</div>
                </div>
                <div class="stat-card">
                    <i class="fas fa-exclamation-triangle"></i>
                    <div class="stat-value" id="lowStock">0</div>
                    <div class="stat-label">Bajo Stock</div>
                </div>
            </div>
        </div>
        
        <div class="grid-container">
            <div class="grid-card" data-action="productos" onclick="window.loadProductCategoriesView()">
                <i class="fas fa-boxes"></i>
                <h3>Productos</h3>
                <p>Gestiona tu catálogo de productos</p>
            </div>
            
            <div class="grid-card" data-action="tiendas" onclick="window.loadStoresView()">
                <i class="fas fa-store"></i>
                <h3>Tiendas</h3>
                <p>Administra las tiendas asociadas</p>
            </div>
            
            <div class="grid-card" data-action="solicitudes" onclick="window.loadRequestsView()">
                <i class="fas fa-clipboard-list"></i>
                <h3>Solicitudes</h3>
                <p>Revisa solicitudes de tiendas</p>
                <div class="card-badge" id="requestsBadge">0</div>
            </div>
            
            <div class="grid-card" data-action="registro">
                <i class="fas fa-history"></i>
                <h3>Registro de Operaciones</h3>
                <p>Historial de actividades</p>
                <span class="coming-soon">Próximamente</span>
            </div>
        </div>
        
        <!-- Botón flotante para Todos los Productos -->
        <button class="floating-btn" onclick="window.viewAllProducts('todos')" title="Ver todos los productos">
            <i class="fas fa-boxes"></i>
            <span>Todos los Productos</span>
        </button>
    `;
    
    // Cargar estadísticas actualizadas
    loadStatistics();
}

// ========== FUNCIONES DE NAVEGACIÓN ACTUALIZADAS ==========

window.loadHomeView = loadHomeView;

window.loadProductCategoriesView = function() {
    breadcrumb.innerHTML = `
        <span class="breadcrumb-item" onclick="window.loadHomeView()" style="cursor: pointer;">Inicio</span>
        <span class="breadcrumb-item active">Productos</span>
    `;
    
    mainContent.innerHTML = `
        <div class="grid-container">
            <div class="grid-card category-card" data-category="confituras">
                <i class="fas fa-cookie-bite"></i>
                <h3>Confituras</h3>
                <p>Mermeladas, dulces y conservas</p>
                
                <div class="card-actions">
                    <button class="card-action-btn" onclick="window.addProductToCategory('confituras')">
                        <i class="fas fa-plus"></i> Agregar Producto
                    </button>
                    <button class="card-action-btn" onclick="window.viewAllProducts('confituras')">
                        <i class="fas fa-eye"></i> Ver Productos
                    </button>
                    <button class="card-action-btn back" onclick="window.loadHomeView()">
                        <i class="fas fa-arrow-left"></i> Regresar
                    </button>
                </div>
            </div>
            
            <div class="grid-card category-card" data-category="alimentos">
                <i class="fas fa-utensils"></i>
                <h3>Alimentos</h3>
                <p>Alimentos básicos y procesados</p>
                
                <div class="card-actions">
                    <button class="card-action-btn" onclick="window.addProductToCategory('alimentos')">
                        <i class="fas fa-plus"></i> Agregar Producto
                    </button>
                    <button class="card-action-btn" onclick="window.viewAllProducts('alimentos')">
                        <i class="fas fa-eye"></i> Ver Productos
                    </button>
                    <button class="card-action-btn back" onclick="window.loadHomeView()">
                        <i class="fas fa-arrow-left"></i> Regresar
                    </button>
                </div>
            </div>
            
            <div class="grid-card category-card" data-category="utiles">
                <i class="fas fa-home"></i>
                <h3>Utiles del Hogar</h3>
                <p>Productos para el hogar</p>
                
                <div class="card-actions">
                    <button class="card-action-btn" onclick="window.addProductToCategory('utiles')">
                        <i class="fas fa-plus"></i> Agregar Producto
                    </button>
                    <button class="card-action-btn" onclick="window.viewAllProducts('utiles')">
                        <i class="fas fa-eye"></i> Ver Productos
                    </button>
                    <button class="card-action-btn back" onclick="window.loadHomeView()">
                        <i class="fas fa-arrow-left"></i> Regresar
                    </button>
                </div>
            </div>
            
            <div class="grid-card category-card" data-category="otros">
                <i class="fas fa-ellipsis-h"></i>
                <h3>Otros</h3>
                <p>Otras categorías de productos</p>
                
                <div class="card-actions">
                    <button class="card-action-btn" onclick="window.addProductToCategory('otros')">
                        <i class="fas fa-plus"></i> Agregar Producto
                    </button>
                    <button class="card-action-btn" onclick="window.viewAllProducts('otros')">
                        <i class="fas fa-eye"></i> Ver Productos
                    </button>
                    <button class="card-action-btn back" onclick="window.loadHomeView()">
                        <i class="fas fa-arrow-left"></i> Regresar
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Botón flotante para Todos los Productos -->
        <button class="floating-btn" onclick="window.viewAllProducts('todos')" title="Ver todos los productos">
            <i class="fas fa-boxes"></i>
            <span>Todos los Productos</span>
        </button>
    `;
};

window.loadStoresView = function() {
    breadcrumb.innerHTML = `
        <span class="breadcrumb-item" onclick="window.loadHomeView()" style="cursor: pointer;">Inicio</span>
        <span class="breadcrumb-item active">Tiendas</span>
    `;
    
    mainContent.innerHTML = `
        <div class="section-header">
            <h2><i class="fas fa-store"></i> Tiendas Registradas</h2>
            <div class="header-actions">
                <button class="btn-primary" onclick="window.openAddStoreModal()" style="width: auto; padding: 10px 20px;">
                    <i class="fas fa-plus"></i> Agregar Tienda
                </button>
            </div>
        </div>
        
        <div class="stores-list" id="storesListContainer">
            <div class="empty-state">
                <i class="fas fa-spinner fa-spin"></i>
                <h3>Cargando tiendas...</h3>
            </div>
        </div>
    `;
    
    // Cargar datos de tiendas usando nueva ruta
    loadStoresData();
};

// ========== NUEVA FUNCIÓN PARA SOLICITUDES ==========

window.loadRequestsView = function() {
    breadcrumb.innerHTML = `
        <span class="breadcrumb-item" onclick="window.loadHomeView()" style="cursor: pointer;">Inicio</span>
        <span class="breadcrumb-item active">Solicitudes</span>
    `;
    
    mainContent.innerHTML = `
        <div class="section-header">
            <h2><i class="fas fa-clipboard-list"></i> Solicitudes de Tiendas</h2>
            <div class="header-actions">
                <select id="filterStatus" onchange="filterRequests()" style="padding: 10px; border-radius: 6px; border: 2px solid #e5e7eb;">
                    <option value="todos">Todas las solicitudes</option>
                    <option value="pendiente">Pendientes</option>
                    <option value="aceptada">Aceptadas</option>
                    <option value="rechazada">Rechazadas</option>
                    <option value="modificada">Modificadas</option>
                </select>
            </div>
        </div>
        
        <div class="requests-container" id="requestsContainer">
            <div class="empty-state">
                <i class="fas fa-spinner fa-spin"></i>
                <h3>Cargando solicitudes...</h3>
            </div>
        </div>
    `;
    
    loadRequestsData();
};

window.viewAllProducts = function(category) {
    const categoryNames = {
        'confituras': 'Confituras',
        'alimentos': 'Alimentos',
        'utiles': 'Utiles del Hogar',
        'otros': 'Otros',
        'todos': 'Todos los Productos'
    };
    
    breadcrumb.innerHTML = `
        <span class="breadcrumb-item" onclick="window.loadHomeView()" style="cursor: pointer;">Inicio</span>
        <span class="breadcrumb-item" onclick="window.loadProductCategoriesView()" style="cursor: pointer;">Productos</span>
        <span class="breadcrumb-item active">${categoryNames[category]}</span>
    `;
    
    mainContent.innerHTML = `
        <div class="section-header">
            <h2><i class="fas fa-boxes"></i> ${categoryNames[category]}</h2>
            <div class="header-actions">
                <button class="btn-primary" onclick="window.addProductToCategory('${category}')" style="width: auto; padding: 10px 20px;">
                    <i class="fas fa-plus"></i> Agregar Producto
                </button>
            </div>
        </div>
        
        <div class="products-list" id="productsListContainer">
            <div class="empty-state">
                <i class="fas fa-spinner fa-spin"></i>
                <h3>Cargando productos...</h3>
            </div>
        </div>
    `;
    
    // Cargar productos usando nueva ruta
    loadProductsData(category);
};

// ========== FUNCIONES DE PRODUCTOS MEJORADAS ==========

window.addProductToCategory = function(category) {
    const modal = document.getElementById('addProductModal');
    const title = document.getElementById('productModalTitle');
    const categoriaInput = document.getElementById('productCategoria');
    
    const categoryNames = {
        'confituras': 'Confituras',
        'alimentos': 'Alimentos',
        'utiles': 'Utiles del Hogar',
        'otros': 'Otros',
        'todos': 'Todos los Productos'
    };
    
    title.innerHTML = `<i class="fas fa-plus-circle"></i> Nuevo Producto - ${categoryNames[category]}`;
    categoriaInput.value = category;
    
    // Reset form
    document.getElementById('productForm').reset();
    document.getElementById('productError').style.display = 'none';
    
    modal.style.display = 'flex';
};

// NUEVAS FUNCIONES PARA EDITAR Y ELIMINAR PRODUCTOS
window.editProduct = function(productId) {
    const modal = document.getElementById('editProductModal');
    const title = document.getElementById('editProductModalTitle');
    
    // Buscar el producto
    fetch(`${API_URL}/proveedor/productos`)
        .then(response => response.json())
        .then(productos => {
            const producto = productos.find(p => p.id == productId);
            if (producto) {
                title.innerHTML = `<i class="fas fa-edit"></i> Editar Producto - ${producto.nombre}`;
                
                document.getElementById('editProductId').value = producto.id;
                document.getElementById('editNombre').value = producto.nombre;
                document.getElementById('editDescripcion').value = producto.descripcion;
                document.getElementById('editPrecio').value = producto.precio;
                document.getElementById('editCantidad').value = producto.cantidad;
                document.getElementById('editUnidad').value = producto.unidad;
                document.getElementById('editCategoria').value = producto.categoria;
                
                document.getElementById('editProductError').style.display = 'none';
                modal.style.display = 'flex';
            }
        });
};

window.deleteProduct = async function(productId, productName) {
    if (!confirm(`¿Estás seguro de eliminar el producto "${productName}"? Esta acción no se puede deshacer.`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/proveedor/productos/${productId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert(`Producto "${productName}" eliminado correctamente`);
            // Recargar la vista actual
            const currentBreadcrumb = breadcrumb.textContent;
            if (currentBreadcrumb.includes('Productos')) {
                loadProductsData('todos');
            }
            loadStatistics();
        } else {
            alert('Error al eliminar el producto: ' + (data.error || 'Error desconocido'));
        }
    } catch (error) {
        alert('Error de conexión al eliminar producto');
    }
};

// ========== FUNCIONES DE TIENDAS MEJORADAS ==========

window.openAddStoreModal = function() {
    const modal = document.getElementById('addStoreModal');
    document.getElementById('storeForm').reset();
    document.getElementById('storeError').style.display = 'none';
    modal.style.display = 'flex';
};

// NUEVA FUNCIÓN PARA ELIMINAR TIENDAS
window.deleteStore = async function(storeId, storeName) {
    if (!confirm(`¿Estás seguro de eliminar la tienda "${storeName}"? Esta acción eliminará todas las solicitudes asociadas.`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/proveedor/tiendas/${storeId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert(`Tienda "${storeName}" eliminada correctamente`);
            loadStoresData();
            loadStatistics();
        } else {
            alert('Error al eliminar la tienda: ' + (data.error || 'Error desconocido'));
        }
    } catch (error) {
        alert('Error de conexión al eliminar tienda');
    }
};

// ========== FUNCIONES DE SOLICITUDES (NUEVAS Y MEJORADAS) ==========

window.viewRequestDetails = function(requestId) {
    const modal = document.getElementById('requestDetailsModal');
    
    fetch(`${API_URL}/proveedor/solicitudes`)
        .then(response => response.json())
        .then(requests => {
            const request = requests.find(r => r.id == requestId);
            if (request) {
                // Agregar input oculto con el ID de la solicitud
                if (!document.querySelector('#requestDetailsModal [data-request-id]')) {
                    const hiddenInput = document.createElement('input');
                    hiddenInput.type = 'hidden';
                    hiddenInput.id = 'requestIdHidden';
                    hiddenInput.setAttribute('data-request-id', request.id);
                    hiddenInput.value = request.id;
                    document.querySelector('#requestDetailsModal .modal-content').appendChild(hiddenInput);
                } else {
                    document.querySelector('#requestDetailsModal [data-request-id]').value = request.id;
                }
                
                // Actualizar modal con información de la solicitud
                document.getElementById('requestId').textContent = `#${request.id}`;
                document.getElementById('requestStore').textContent = request.tiendaNombre;
                document.getElementById('requestDate').textContent = new Date(request.fecha).toLocaleString();
                document.getElementById('requestStatus').textContent = request.estado.toUpperCase();
                document.getElementById('requestStatus').className = `status-${request.estado}`;
                
                // Productos solicitados
                const productsList = document.getElementById('requestProductsList');
                productsList.innerHTML = request.productos.map(p => {
                    // Buscar producto aprobado si existe
                    const productoAprobado = request.productosAprobados?.find(pa => pa.productoId === p.id);
                    
                    return `
                        <div class="request-product-item" data-product-id="${p.id}">
                            <div class="product-info">
                                <strong>${p.nombre}</strong>
                                <div class="product-details">
                                    <div>Precio: $${p.precio?.toFixed(2) || '0.00'} por ${p.unidad || 'unidad'}</div>
                                    <div>Solicitado: <strong>${p.cantidad}</strong> ${p.unidad || 'unidades'}</div>
                                    ${request.estado === 'pendiente' || request.estado === 'modificada' ? 
                                        `<div class="approve-section">
                                            Aprobar: 
                                            <input type="number" 
                                                   id="approve-qty-${p.id}" 
                                                   value="${productoAprobado ? productoAprobado.cantidadAprobada : p.cantidad}" 
                                                   min="0" 
                                                   max="${p.cantidad}" 
                                                   style="width: 80px; padding: 6px; margin-left: 5px; border: 1px solid #ddd; border-radius: 4px;">
                                            ${p.unidad || 'unidades'}
                                        </div>` : 
                                        productoAprobado ? 
                                            `<div>Aprobado: <strong>${productoAprobado.cantidadAprobada}</strong> ${p.unidad || 'unidades'}</div>` : 
                                            ''
                                    }
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');
                
                // Comentarios
                document.getElementById('requestComments').value = request.comentarios || '';
                
                // Mostrar u ocultar botones según estado
                const actionButtons = document.getElementById('requestActionButtons');
                if (request.estado === 'pendiente' || request.estado === 'modificada') {
                    actionButtons.style.display = 'flex';
                } else {
                    actionButtons.style.display = 'none';
                }
                
                modal.style.display = 'flex';
            }
        });
};

window.acceptRequest = async function() {
    const requestIdInput = document.querySelector('#requestDetailsModal [data-request-id]');
    if (!requestIdInput) {
        alert('No se pudo encontrar el ID de la solicitud');
        return;
    }
    
    const requestId = requestIdInput.value;
    if (!requestId) return;
    
    // Obtener cantidades aprobadas
    const productosAprobados = [];
    let totalAprobado = 0;
    
    // Primero, obtener la solicitud original para las cantidades solicitadas
    try {
        const response = await fetch(`${API_URL}/proveedor/solicitudes`);
        const requests = await response.json();
        const originalRequest = requests.find(r => r.id == requestId);
        
        if (!originalRequest) {
            alert('No se pudo encontrar la solicitud original');
            return;
        }
        
        // Recorrer productos originales para obtener cantidades solicitadas
        for (const productoOriginal of originalRequest.productos) {
            const cantidadAprobadaInput = document.getElementById(`approve-qty-${productoOriginal.id}`);
            if (cantidadAprobadaInput) {
                const cantidadAprobada = parseInt(cantidadAprobadaInput.value) || 0;
                
                if (cantidadAprobada > 0) {
                    productosAprobados.push({
                        productoId: productoOriginal.id,
                        cantidadSolicitada: productoOriginal.cantidad,
                        cantidadAprobada: cantidadAprobada
                    });
                    totalAprobado += cantidadAprobada;
                }
            }
        }
        
        if (productosAprobados.length === 0) {
            alert('Debe aprobar al menos una cantidad para algún producto');
            return;
        }
        
        const comentarios = document.getElementById('requestComments').value || 'Solicitud aceptada por el proveedor';
        
        const updateResponse = await fetch(`${API_URL}/proveedor/solicitudes/${requestId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                estado: 'aceptada',
                comentarios,
                productosAprobados
            })
        });
        
        const data = await updateResponse.json();
        
        if (data.success) {
            alert('Solicitud aceptada correctamente');
            document.getElementById('requestDetailsModal').style.display = 'none';
            loadRequestsData();
            loadStatistics();
            
            // Limpiar datos del modal
            document.getElementById('requestProductsList').innerHTML = '';
            document.getElementById('requestComments').value = '';
        } else if (data.productosNoDisponibles) {
            // Mostrar productos con stock insuficiente
            let mensaje = 'Stock insuficiente para los siguientes productos:\n\n';
            data.productosNoDisponibles.forEach(p => {
                mensaje += `• Producto ID ${p.productoId}: Solicitado ${p.cantidadSolicitada}, Disponible ${p.cantidadDisponible}\n`;
            });
            mensaje += '\nPor favor, modifique las cantidades.';
            alert(mensaje);
        } else {
            alert('Error al aceptar solicitud: ' + (data.error || 'Error desconocido'));
        }
    } catch (error) {
        console.error('Error al aceptar solicitud:', error);
        alert('Error de conexión al aceptar solicitud');
    }
};

window.rejectRequest = async function() {
    const requestIdInput = document.querySelector('#requestDetailsModal [data-request-id]');
    if (!requestIdInput) {
        alert('No se pudo encontrar el ID de la solicitud');
        return;
    }
    
    const requestId = requestIdInput.value;
    if (!requestId) return;
    
    const comentarios = document.getElementById('requestComments').value || 'Solicitud rechazada por el proveedor';
    
    if (!confirm('¿Está seguro de rechazar esta solicitud?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/proveedor/solicitudes/${requestId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                estado: 'rechazada',
                comentarios
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Solicitud rechazada correctamente');
            document.getElementById('requestDetailsModal').style.display = 'none';
            loadRequestsData();
            loadStatistics();
            
            // Limpiar datos del modal
            document.getElementById('requestProductsList').innerHTML = '';
            document.getElementById('requestComments').value = '';
        } else {
            alert('Error al rechazar solicitud: ' + (data.error || 'Error desconocido'));
        }
    } catch (error) {
        console.error('Error al rechazar solicitud:', error);
        alert('Error de conexión al rechazar solicitud');
    }
};

window.modifyRequest = async function() {
    const requestIdInput = document.querySelector('#requestDetailsModal [data-request-id]');
    if (!requestIdInput) {
        alert('No se pudo encontrar el ID de la solicitud');
        return;
    }
    
    const requestId = requestIdInput.value;
    if (!requestId) return;
    
    // Obtener cantidades modificadas
    const productosAprobados = [];
    let totalModificado = 0;
    
    // Primero, obtener la solicitud original
    try {
        const response = await fetch(`${API_URL}/proveedor/solicitudes`);
        const requests = await response.json();
        const originalRequest = requests.find(r => r.id == requestId);
        
        if (!originalRequest) {
            alert('No se pudo encontrar la solicitud original');
            return;
        }
        
        for (const productoOriginal of originalRequest.productos) {
            const cantidadAprobadaInput = document.getElementById(`approve-qty-${productoOriginal.id}`);
            if (cantidadAprobadaInput) {
                const cantidadAprobada = parseInt(cantidadAprobadaInput.value) || 0;
                
                productosAprobados.push({
                    productoId: productoOriginal.id,
                    cantidadSolicitada: productoOriginal.cantidad,
                    cantidadAprobada: cantidadAprobada
                });
                totalModificado += cantidadAprobada;
            }
        }
        
        if (totalModificado === 0) {
            alert('Debe aprobar al menos alguna cantidad para los productos');
            return;
        }
        
        const comentarios = document.getElementById('requestComments').value || 'Solicitud modificada por el proveedor';
        
        const updateResponse = await fetch(`${API_URL}/proveedor/solicitudes/${requestId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                estado: 'modificada',
                comentarios,
                productosAprobados
            })
        });
        
        const data = await updateResponse.json();
        
        if (data.success) {
            alert('Solicitud modificada correctamente');
            document.getElementById('requestDetailsModal').style.display = 'none';
            loadRequestsData();
            loadStatistics();
            
            // Limpiar datos del modal
            document.getElementById('requestProductsList').innerHTML = '';
            document.getElementById('requestComments').value = '';
        } else if (data.productosNoDisponibles) {
            alert('Stock insuficiente para algunas cantidades modificadas');
        } else {
            alert('Error al modificar solicitud: ' + (data.error || 'Error desconocido'));
        }
    } catch (error) {
        console.error('Error al modificar solicitud:', error);
        alert('Error de conexión al modificar solicitud');
    }
};

function filterRequests() {
    const status = document.getElementById('filterStatus').value;
    
    // Si es "todos", simplemente mostrar todo y salir
    if (status === 'todos') {
        document.querySelectorAll('.request-card').forEach(card => {
            card.style.display = 'block';
        });
        return;
    }
    
    // Si es un estado específico, recargar datos del servidor
    loadRequestsDataWithFilter(status);
}

// Nueva función para filtrar desde el servidor
async function loadRequestsDataWithFilter(status) {
    try {
        const response = await fetch(`${API_URL}/proveedor/solicitudes`);
        const allRequests = await response.json();
        
        // Filtrar en el cliente
        const filteredRequests = status === 'todos' 
            ? allRequests 
            : allRequests.filter(r => r.estado === status);
        
        displayRequestsData(filteredRequests);
        
        // Actualizar contador en el select
        const filterSelect = document.getElementById('filterStatus');
        if (filterSelect) {
            const currentFilter = filterSelect.value;
            if (currentFilter !== status) {
                filterSelect.value = status;
            }
        }
    } catch (error) {
        console.error('Error cargando solicitudes filtradas:', error);
    }
}

// ========== FUNCIONES DE CARGA DE DATOS MEJORADAS ==========

async function loadStatistics() {
    try {
        const response = await fetch(`${API_URL}/proveedor/estadisticas`);
        const stats = await response.json();
        
        if (document.getElementById('totalProducts')) {
            document.getElementById('totalProducts').textContent = stats.totalProductos;
        }
        if (document.getElementById('totalStores')) {
            document.getElementById('totalStores').textContent = stats.totalTiendas;
        }
        if (document.getElementById('pendingRequests')) {
            document.getElementById('pendingRequests').textContent = stats.solicitudesPendientes;
        }
        if (document.getElementById('lowStock')) {
            document.getElementById('lowStock').textContent = stats.productosBajoStock;
        }
        
        // Actualizar badge de solicitudes
        const badge = document.getElementById('requestsBadge');
        if (badge) {
            badge.textContent = stats.solicitudesPendientes;
        }
    } catch (error) {
        console.error('Error cargando estadísticas:', error);
    }
}

async function loadProductsData(category = 'todos') {
    console.log('Cargando productos para categoría:', category);
    
    try {
        const response = await fetch(`${API_URL}/proveedor/productos`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const productos = await response.json();
        console.log('Productos obtenidos:', productos);
        
        // Filtrar por categoría si no es 'todos'
        const productosFiltrados = category === 'todos' 
            ? productos 
            : productos.filter(p => p.categoria === category);
        
        console.log('Productos filtrados:', productosFiltrados);
        displayProductsData(productosFiltrados, category);
    } catch (error) {
        console.error('Error cargando productos:', error);
        showProductsError(category, error.message);
    }
}

// Función para mostrar productos (MEJORADA CON ACCIONES)
function displayProductsData(productos, category) {
    const container = document.getElementById('productsListContainer');
    if (!container) return;
    
    const categoryNames = {
        'confituras': 'Confituras',
        'alimentos': 'Alimentos',
        'utiles': 'Utiles del Hogar',
        'otros': 'Otros',
        'todos': 'Todos los Productos'
    };
    
    if (!productos || productos.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-box-open"></i>
                <h3>No hay productos</h3>
                <p>No hay productos en la categoría "${categoryNames[category]}"</p>
                <button class="btn-primary" onclick="window.addProductToCategory('${category}')" style="width: auto; margin-top: 20px; padding: 10px 20px;">
                    <i class="fas fa-plus"></i> Agregar primer producto
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = productos.map(producto => `
        <div class="product-card">
            <div class="product-category">
                ${categoryNames[producto.categoria] || 'Otros'}
            </div>
            
            <div class="product-header">
                <div class="product-name">${producto.nombre || 'Sin nombre'}</div>
                <div class="product-price">$${producto.precio ? producto.precio.toFixed(2) : '0.00'}</div>
            </div>
            
            <div class="product-description">${producto.descripcion || 'Sin descripción'}</div>
            
            <div class="product-meta">
                <span>
                    <i class="fas fa-cube"></i>
                    ${producto.cantidad || 0} ${producto.unidad || 'unidades'}
                </span>
                <span class="stock-badge ${producto.cantidad < 5 ? 'stock-low' : producto.cantidad < 10 ? 'stock-medium' : 'stock-high'}">
                    ${producto.cantidad < 5 ? 'Bajo Stock' : producto.cantidad < 10 ? 'Stock Medio' : 'Disponible'}
                </span>
                <span>
                    <i class="fas fa-calendar"></i>
                    ${producto.fecha ? new Date(producto.fecha).toLocaleDateString() : 'Sin fecha'}
                </span>
            </div>
            
            <div class="product-actions">
                <button class="btn-small" onclick="window.editProduct(${producto.id})">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn-small btn-danger" onclick="window.deleteProduct(${producto.id}, '${producto.nombre}')">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </div>
        </div>
    `).join('');
}

async function loadStoresData() {
    console.log('Cargando tiendas...');
    
    try {
        const response = await fetch(`${API_URL}/proveedor/tiendas`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const tiendas = await response.json();
        console.log('Tiendas obtenidas:', tiendas);
        displayStoresData(tiendas);
    } catch (error) {
        console.error('Error cargando tiendas:', error);
        showStoresError(error.message);
    }
}

// Función para mostrar tiendas (MEJORADA CON ACCIONES)
function displayStoresData(tiendas) {
    const container = document.getElementById('storesListContainer');
    if (!container) return;
    
    if (!tiendas || tiendas.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-store-slash"></i>
                <h3>No hay tiendas registradas</h3>
                <p>Aún no has creado ninguna tienda</p>
                <button class="btn-primary" onclick="window.openAddStoreModal()" style="width: auto; margin-top: 20px; padding: 10px 20px;">
                    <i class="fas fa-plus"></i> Crear primera tienda
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = tiendas.map(tienda => `
        <div class="store-card">
            <div class="store-header">
                <div class="store-name">${tienda.storename || 'Sin nombre'}</div>
                <div class="store-status ${tienda.activa ? 'active' : 'inactive'}">
                    ${tienda.activa ? 'Activa' : 'Inactiva'}
                </div>
            </div>
            
            <div class="store-info">
                <strong>Usuario:</strong> ${tienda.username || 'N/A'}<br>
                <strong>Contraseña:</strong> ${tienda.password || 'N/A'}<br>
                <strong>ID:</strong> ${tienda.id || 'N/A'}
            </div>
            
            <div class="store-meta">
                <span>
                    <i class="fas fa-calendar"></i>
                    ${tienda.fechaCreacion ? new Date(tienda.fechaCreacion).toLocaleDateString() : 'Sin fecha'}
                </span>
            </div>
            
            <div class="store-actions">
                <button class="btn-small btn-danger" onclick="window.deleteStore(${tienda.id}, '${tienda.storename}')">
                    <i class="fas fa-trash"></i> Eliminar Tienda
                </button>
            </div>
        </div>
    `).join('');
}

async function loadRequestsData() {
    try {
        const response = await fetch(`${API_URL}/proveedor/solicitudes`);
        const solicitudes = await response.json();
        displayRequestsData(solicitudes);
    } catch (error) {
        console.error('Error cargando solicitudes:', error);
        showRequestsError(error.message);
    }
}

function displayRequestsData(solicitudes) {
    const container = document.getElementById('requestsContainer');
    if (!container) return;
    
    if (!solicitudes || solicitudes.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard-check"></i>
                <h3>No hay solicitudes</h3>
                <p>No hay solicitudes pendientes de tiendas</p>
            </div>
        `;
        return;
    }
    
    // Ordenar por fecha (más recientes primero)
    const solicitudesOrdenadas = [...solicitudes].sort((a, b) => 
        new Date(b.fecha) - new Date(a.fecha)
    );
    
    container.innerHTML = solicitudesOrdenadas.map(solicitud => {
        const statusClass = `status-${solicitud.estado}`;
        const totalProductos = solicitud.productos.reduce((sum, p) => sum + p.cantidad, 0);
        const fechaFormateada = new Date(solicitud.fecha).toLocaleString();
        
        return `
            <div class="request-card" data-status="${solicitud.estado}">
                <div class="request-header">
                    <div class="request-info">
                        <h3>Solicitud #${solicitud.id}</h3>
                        <div class="request-meta">
                            <span><i class="fas fa-store"></i> ${solicitud.tiendaNombre}</span>
                            <span><i class="fas fa-calendar"></i> ${fechaFormateada}</span>
                            <span><i class="fas fa-cube"></i> ${totalProductos} productos</span>
                            <span><i class="fas fa-money-bill-wave"></i> $${solicitud.total?.toFixed(2) || '0.00'}</span>
                        </div>
                    </div>
                    <div class="request-status ${statusClass}">
                        ${solicitud.estado.toUpperCase()}
                    </div>
                </div>
                
                <div class="request-products">
                    ${solicitud.productos.slice(0, 2).map(p => `
                        <span class="product-tag">${p.nombre} (${p.cantidad} ${p.unidad})</span>
                    `).join('')}
                    ${solicitud.productos.length > 2 ? 
                        `<span class="product-tag">+${solicitud.productos.length - 2} más</span>` : 
                        ''
                    }
                </div>
                
                ${solicitud.comentarios ? `
                    <div class="request-comments">
                        <i class="fas fa-comment"></i> ${solicitud.comentarios}
                    </div>
                ` : ''}
                
                ${solicitud.estado === 'pendiente' || solicitud.estado === 'modificada' ? `
                    <div class="request-actions">
                        <button class="btn-small btn-primary" onclick="window.viewRequestDetails(${solicitud.id})">
                            <i class="fas fa-eye"></i> Revisar Solicitud
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

// ========== CONFIGURACIÓN DE FORMULARIOS MEJORADA ==========

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM cargado, configurando event listeners...');
    
    // Formulario para agregar tienda
    const storeForm = document.getElementById('storeForm');
    if (storeForm) {
        console.log('Configurando formulario de tienda...');
        storeForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('Enviando formulario de tienda...');
            
            const storeName = document.getElementById('storeName').value;
            const username = document.getElementById('storeUsername').value;
            const password = document.getElementById('storePassword').value;
            const confirmPassword = document.getElementById('storeConfirmPassword').value;
            
            if (password !== confirmPassword) {
                const errorElement = document.getElementById('storeError');
                errorElement.textContent = 'Las contraseñas no coinciden';
                errorElement.style.display = 'block';
                return;
            }
            
            try {
                const response = await fetch(`${API_URL}/proveedor/tiendas`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        storename: storeName,
                        username,
                        password
                    })
                });
                
                const data = await response.json();
                console.log('Respuesta crear tienda:', data);
                
                if (data.success) {
                    document.getElementById('addStoreModal').style.display = 'none';
                    loadStoresData();
                    loadStatistics();
                    alert(`Tienda "${storeName}" creada exitosamente\nUsuario: ${username}\nContraseña: ${password}`);
                } else {
                    const errorElement = document.getElementById('storeError');
                    errorElement.textContent = data.error || 'Error al crear tienda';
                    errorElement.style.display = 'block';
                }
            } catch (error) {
                console.error('Error al crear tienda:', error);
                const errorElement = document.getElementById('storeError');
                errorElement.textContent = 'Error de conexión con el servidor: ' + error.message;
                errorElement.style.display = 'block';
            }
        });
    }
    
    // Formulario para agregar producto
    const productForm = document.getElementById('productForm');
    if (productForm) {
        console.log('Configurando formulario de producto...');
        productForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('Enviando formulario de producto...');
            
            if (!isAuthenticated) {
                alert('Debes iniciar sesión primero');
                return;
            }
            
            const producto = {
                nombre: document.getElementById('nombre').value,
                descripcion: document.getElementById('descripcion').value,
                precio: parseFloat(document.getElementById('precio').value),
                cantidad: parseInt(document.getElementById('cantidad').value),
                unidad: document.getElementById('unidad').value,
                categoria: document.getElementById('productCategoria').value
            };
            
            try {
                const response = await fetch(`${API_URL}/proveedor/productos`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(producto)
                });
                
                console.log('Respuesta crear producto:', response.status);
                
                if (response.ok) {
                    document.getElementById('addProductModal').style.display = 'none';
                    productForm.reset();
                    
                    // Recargar la vista actual
                    const currentCategory = producto.categoria;
                    loadProductsData(currentCategory);
                    loadStatistics();
                    alert('Producto agregado exitosamente');
                } else {
                    const errorData = await response.json();
                    const errorElement = document.getElementById('productError');
                    errorElement.textContent = errorData.error || 'Error al guardar producto';
                    errorElement.style.display = 'block';
                }
            } catch (error) {
                console.error('Error al crear producto:', error);
                const errorElement = document.getElementById('productError');
                errorElement.textContent = 'Error de conexión con el servidor: ' + error.message;
                errorElement.style.display = 'block';
            }
        });
    }
    
    // NUEVO: Formulario para editar producto
    const editProductForm = document.getElementById('editProductForm');
    if (editProductForm) {
        console.log('Configurando formulario de edición de producto...');
        editProductForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('Enviando formulario de edición de producto...');
            
            const productoId = document.getElementById('editProductId').value;
            const producto = {
                nombre: document.getElementById('editNombre').value,
                descripcion: document.getElementById('editDescripcion').value,
                precio: parseFloat(document.getElementById('editPrecio').value),
                cantidad: parseInt(document.getElementById('editCantidad').value),
                unidad: document.getElementById('editUnidad').value,
                categoria: document.getElementById('editCategoria').value
            };
            
            try {
                const response = await fetch(`${API_URL}/proveedor/productos/${productoId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(producto)
                });
                
                const data = await response.json();
                console.log('Respuesta actualizar producto:', data);
                
                if (data.success) {
                    document.getElementById('editProductModal').style.display = 'none';
                    loadProductsData('todos');
                    loadStatistics();
                    alert('Producto actualizado exitosamente');
                } else {
                    const errorElement = document.getElementById('editProductError');
                    errorElement.textContent = data.error || 'Error al actualizar producto';
                    errorElement.style.display = 'block';
                }
            } catch (error) {
                console.error('Error al actualizar producto:', error);
                const errorElement = document.getElementById('editProductError');
                errorElement.textContent = 'Error de conexión con el servidor: ' + error.message;
                errorElement.style.display = 'block';
            }
        });
    }
    
    // Cerrar modales
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            console.log('Cerrando modal...');
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
                // Limpiar datos del modal de solicitudes
                if (modal.id === 'requestDetailsModal') {
                    document.getElementById('requestProductsList').innerHTML = '';
                    document.getElementById('requestComments').value = '';
                    const hiddenInput = document.querySelector('#requestDetailsModal [data-request-id]');
                    if (hiddenInput) hiddenInput.value = '';
                }
            });
        });
    });
    
    // Cerrar modales al hacer clic fuera
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                console.log('Clic fuera del modal, cerrando...');
                modal.style.display = 'none';
                // Limpiar datos del modal de solicitudes
                if (modal.id === 'requestDetailsModal') {
                    document.getElementById('requestProductsList').innerHTML = '';
                    document.getElementById('requestComments').value = '';
                    const hiddenInput = document.querySelector('#requestDetailsModal [data-request-id]');
                    if (hiddenInput) hiddenInput.value = '';
                }
            }
        });
    });
});

// ========== FUNCIONES AUXILIARES MEJORADAS ==========

function showProductsError(category, message) {
    const container = document.getElementById('productsListContainer');
    if (container) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error al cargar productos</h3>
                <p>${message}</p>
                <div style="margin-top: 20px;">
                    <button onclick="window.loadProductsData('${category}')" class="btn-primary" style="width: auto; margin: 5px; padding: 10px 20px;">
                        <i class="fas fa-redo"></i> Reintentar
                    </button>
                    <button onclick="window.loadHomeView()" class="btn-primary" style="width: auto; margin: 5px; padding: 10px 20px; background: #6b7280;">
                        <i class="fas fa-home"></i> Volver al inicio
                    </button>
                </div>
            </div>
        `;
    }
}

function showStoresError(message) {
    const container = document.getElementById('storesListContainer');
    if (container) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error al cargar tiendas</h3>
                <p>${message}</p>
                <div style="margin-top: 20px;">
                    <button onclick="window.loadStoresData()" class="btn-primary" style="width: auto; margin: 5px; padding: 10px 20px;">
                        <i class="fas fa-redo"></i> Reintentar
                    </button>
                    <button onclick="window.loadHomeView()" class="btn-primary" style="width: auto; margin: 5px; padding: 10px 20px; background: #6b7280;">
                        <i class="fas fa-home"></i> Volver al inicio
                    </button>
                </div>
            </div>
        `;
    }
}

function showRequestsError(message) {
    const container = document.getElementById('requestsContainer');
    if (container) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error al cargar solicitudes</h3>
                <p>${message}</p>
                <button onclick="window.loadRequestsData()" class="btn-primary" style="width: auto; margin-top: 20px; padding: 10px 20px;">
                    <i class="fas fa-redo"></i> Reintentar
                </button>
            </div>
        `;
    }
}

// ========== FUNCIONES DE ACTUALIZACIÓN PERIÓDICA MEJORADAS ==========

function startPeriodicUpdates() {
    setInterval(() => {
        if (isAuthenticated) {
            checkConnection();
            loadStatistics();
            
            // Si estamos en la vista de solicitudes, actualizar
            if (document.querySelector('.breadcrumb-item.active')?.textContent === 'Solicitudes') {
                loadRequestsData();
            }
        }
    }, 30000); // Cada 30 segundos
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

// ... (mantén tu CSS actual como está, solo agregaré estilos nuevos)
// Añadir estilos CSS para el botón flotante y otros elementos
const style = document.createElement('style');
style.textContent = `
    .floating-btn {
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 15px 20px;
        border-radius: 50px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 10px;
        box-shadow: 0 6px 20px rgba(0,0,0,0.3);
        z-index: 999;
        transition: all 0.3s ease;
        animation: float 3s ease-in-out infinite;
    }
    
    .floating-btn:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 25px rgba(0,0,0,0.4);
    }
    
    .floating-btn i {
        font-size: 20px;
    }
    
    .floating-btn span {
        display: none;
    }
    
    .floating-btn:hover span {
        display: inline;
    }
    
    @keyframes float {
        0%, 100% {
            transform: translateY(0);
        }
        50% {
            transform: translateY(-10px);
        }
    }
    
    /* Estilos para las tarjetas */
    .product-card {
        background: white;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 15px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        border-left: 4px solid #667eea;
    }
    
    .product-category {
        background: #667eea;
        color: white;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        display: inline-block;
        margin-bottom: 10px;
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
    }
    
    .product-price {
        color: #10b981;
        font-weight: 600;
        font-size: 20px;
    }
    
    .product-description {
        color: #6b7280;
        margin-bottom: 15px;
        font-size: 14px;
        line-height: 1.5;
    }
    
    .product-meta {
        display: flex;
        gap: 15px;
        font-size: 13px;
        color: #888;
    }
    
    .store-card {
        background: white;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 15px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        border-left: 4px solid #10b981;
    }
    
    .store-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
    }
    
    .store-name {
        font-size: 18px;
        font-weight: 600;
        color: #1f2937;
    }
    
    .store-status {
        font-size: 12px;
        font-weight: 600;
        padding: 4px 12px;
        border-radius: 20px;
    }
    
    .store-status.active {
        background: #d1fae5;
        color: #065f46;
    }
    
    .store-status.inactive {
        background: #fee2e2;
        color: #991b1b;
    }
    
    .store-info {
        color: #6b7280;
        margin-bottom: 10px;
        font-size: 14px;
    }
    
    .store-meta {
        font-size: 12px;
        color: #888;
        display: flex;
        gap: 10px;
    }
    
    .products-list, .stores-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
        margin-top: 20px;
    }
    
    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }
    
    .section-header h2 {
        font-size: 24px;
        color: #1f2937;
        display: flex;
        align-items: center;
        gap: 10px;
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
    
    .empty-state ul {
        text-align: left;
        max-width: 400px;
        margin: 15px auto;
        background: #f8fafc;
        padding: 15px;
        border-radius: 8px;
        border-left: 4px solid #667eea;
    }
    
    .empty-state li {
        margin: 5px 0;
        font-family: monospace;
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
        border-color: #667eea;
    }
    
    .grid-card i {
        font-size: 40px;
        margin-bottom: 15px;
        color: #667eea;
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
    }
    
    .category-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        position: relative;
    }
    
    .category-card i {
        color: white;
    }
    
    .category-card .card-actions {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.9);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        opacity: 0;
        transition: opacity 0.3s ease;
        border-radius: 12px;
    }
    
    .category-card:hover .card-actions {
        opacity: 1;
    }
    
    .card-action-btn {
        background: #10b981;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 6px;
        margin: 5px;
        cursor: pointer;
        font-weight: 600;
        width: 80%;
        transition: transform 0.2s;
    }
    
    .card-action-btn:hover {
        transform: scale(1.05);
    }
    
    .card-action-btn.back {
        background: #6b7280;
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
    
    /* Breadcrumb */
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
        color: #667eea;
        font-weight: 600;
    }
    
    .breadcrumb-item:not(:last-child)::after {
        content: "›";
        margin: 0 8px;
        color: #6b7280;
    }

    /* Estilos mejorados para estadísticas */
    .stats-container {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 12px;
        padding: 25px;
        margin-bottom: 30px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
    }
    
    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
    }
    
    .stat-card {
        background: rgba(255, 255, 255, 0.9);
        border-radius: 10px;
        padding: 20px;
        text-align: center;
        backdrop-filter: blur(10px);
        transition: all 0.3s ease;
    }
    
    .stat-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 20px rgba(0,0,0,0.15);
    }
    
    .stat-card i {
        font-size: 32px;
        color: #667eea;
        margin-bottom: 10px;
    }
    
    .stat-value {
        font-size: 28px;
        font-weight: 700;
        color: #1f2937;
        margin: 10px 0;
    }
    
    .stat-label {
        color: #6b7280;
        font-size: 14px;
        font-weight: 500;
    }
    
    .card-badge {
        position: absolute;
        top: 10px;
        right: 10px;
        background: #ef4444;
        color: white;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 600;
    }
    
    /* Estilos para solicitudes */
    .requests-container {
        display: flex;
        flex-direction: column;
        gap: 15px;
        margin-top: 20px;
    }
    
    .request-card {
        background: white;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        border-left: 4px solid #667eea;
    }
    
    .request-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 15px;
    }
    
    .request-info h3 {
        font-size: 18px;
        color: #1f2937;
        margin-bottom: 5px;
    }
    
    .request-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 15px;
        font-size: 14px;
        color: #6b7280;
    }
    
    .request-meta span {
        display: flex;
        align-items: center;
        gap: 5px;
    }
    
    .request-status {
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
    }
    
    .status-pendiente { background: #fef3c7; color: #92400e; }
    .status-aceptada { background: #d1fae5; color: #065f46; }
    .status-rechazada { background: #fee2e2; color: #991b1b; }
    .status-modificada { background: #e0e7ff; color: #3730a3; }
    
    .request-products {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 15px;
    }
    
    .product-tag {
        background: #f3f4f6;
        padding: 4px 10px;
        border-radius: 6px;
        font-size: 13px;
        color: #4b5563;
    }
    
    .request-comments {
        background: #f8fafc;
        padding: 10px 15px;
        border-radius: 8px;
        margin-top: 10px;
        font-size: 14px;
        color: #4b5563;
        border-left: 3px solid #cbd5e1;
    }
    
    .request-actions {
        margin-top: 15px;
        padding-top: 15px;
        border-top: 1px solid #e5e7eb;
    }
    
    /* Estilos para acciones de producto y tienda */
    .product-actions, .store-actions {
        display: flex;
        gap: 10px;
        margin-top: 15px;
        padding-top: 15px;
        border-top: 1px solid #e5e7eb;
    }
    
    .btn-small {
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        border: none;
        transition: all 0.2s;
    }
    
    .btn-small.btn-primary {
        background: #667eea;
        color: white;
    }
    
    .btn-small.btn-danger {
        background: #ef4444;
        color: white;
    }
    
    .btn-small:hover {
        opacity: 0.9;
        transform: translateY(-2px);
    }
    
    /* Indicadores de stock */
    .stock-badge {
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
    }
    
    .stock-low { background: #fee2e2; color: #991b1b; }
    .stock-medium { background: #fef3c7; color: #92400e; }
    .stock-high { background: #d1fae5; color: #065f46; }
    
    .header-actions {
        display: flex;
        gap: 10px;
        align-items: center;
    }
    
    /* Estilos del modal de solicitudes */
    .request-product-item {
        background: #f8fafc;
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 10px;
        border: 1px solid #e5e7eb;
    }
    
    .product-info {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    
    .product-details {
        font-size: 14px;
        color: #4b5563;
    }
    
    .approve-section {
        margin-top: 8px;
        display: flex;
        align-items: center;
        gap: 5px;
    }
    
    /* Mantén tus estilos existentes y agrega estos nuevos */
    .floating-btn {
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 15px 20px;
        border-radius: 50px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 10px;
        box-shadow: 0 6px 20px rgba(0,0,0,0.3);
        z-index: 999;
        transition: all 0.3s ease;
        animation: float 3s ease-in-out infinite;
    }
    
    .floating-btn:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 25px rgba(0,0,0,0.4);
    }
    
    .floating-btn i {
        font-size: 20px;
    }
    
    .floating-btn span {
        display: none;
    }
    
    .floating-btn:hover span {
        display: inline;
    }
    
    @keyframes float {
        0%, 100% {
            transform: translateY(0);
        }
        50% {
            transform: translateY(-10px);
        }
    }
    
    /* Estilos para las tarjetas */
    .product-card {
        background: white;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 15px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        border-left: 4px solid #667eea;
    }
    
    .product-category {
        background: #667eea;
        color: white;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        display: inline-block;
        margin-bottom: 10px;
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
    }
    
    .product-price {
        color: #10b981;
        font-weight: 600;
        font-size: 20px;
    }
    
    .product-description {
        color: #6b7280;
        margin-bottom: 15px;
        font-size: 14px;
        line-height: 1.5;
    }
    
    .product-meta {
        display: flex;
        gap: 15px;
        font-size: 13px;
        color: #888;
    }
    
    .store-card {
        background: white;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 15px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        border-left: 4px solid #10b981;
    }
    
    .store-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
    }
    
    .store-name {
        font-size: 18px;
        font-weight: 600;
        color: #1f2937;
    }
    
    .store-status {
        font-size: 12px;
        font-weight: 600;
        padding: 4px 12px;
        border-radius: 20px;
    }
    
    .store-status.active {
        background: #d1fae5;
        color: #065f46;
    }
    
    .store-status.inactive {
        background: #fee2e2;
        color: #991b1b;
    }
    
    .store-info {
        color: #6b7280;
        margin-bottom: 10px;
        font-size: 14px;
    }
    
    .store-meta {
        font-size: 12px;
        color: #888;
        display: flex;
        gap: 10px;
    }
    
    .products-list, .stores-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
        margin-top: 20px;
    }
    
    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }
    
    .section-header h2 {
        font-size: 24px;
        color: #1f2937;
        display: flex;
        align-items: center;
        gap: 10px;
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
    
    .empty-state ul {
        text-align: left;
        max-width: 400px;
        margin: 15px auto;
        background: #f8fafc;
        padding: 15px;
        border-radius: 8px;
        border-left: 4px solid #667eea;
    }
    
    .empty-state li {
        margin: 5px 0;
        font-family: monospace;
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
        border-color: #667eea;
    }
    
    .grid-card i {
        font-size: 40px;
        margin-bottom: 15px;
        color: #667eea;
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
    }
    
    .category-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        position: relative;
    }
    
    .category-card i {
        color: white;
    }
    
    .category-card .card-actions {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.9);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        opacity: 0;
        transition: opacity 0.3s ease;
        border-radius: 12px;
    }
    
    .category-card:hover .card-actions {
        opacity: 1;
    }
    
    .card-action-btn {
        background: #10b981;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 6px;
        margin: 5px;
        cursor: pointer;
        font-weight: 600;
        width: 80%;
        transition: transform 0.2s;
    }
    
    .card-action-btn:hover {
        transform: scale(1.05);
    }
    
    .card-action-btn.back {
        background: #6b7280;
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
    
    /* Breadcrumb */
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
        color: #667eea;
        font-weight: 600;
    }
    
    .breadcrumb-item:not(:last-child)::after {
        content: "›";
        margin: 0 8px;
        color: #6b7280;
    }
`;
document.head.appendChild(style);

// Función para probar las rutas (útil para debugging)
window.testRoutes = async function() {
    console.log('=== Probando rutas del servidor ===');
    
    const routes = [
        { url: `${API_URL}/status`, name: 'Status' },
        { url: `${API_URL}/proveedor/productos`, name: 'Productos Proveedor' },
        { url: `${API_URL}/proveedor/tiendas`, name: 'Tiendas Proveedor' },
        { url: `${API_URL}/proveedor/solicitudes`, name: 'Solicitudes Proveedor' },
        { url: `${API_URL}/proveedor/estadisticas`, name: 'Estadísticas Proveedor' }
    ];
    
    for (const route of routes) {
        try {
            const response = await fetch(route.url);
            console.log(`${route.name} (${route.url}): ${response.status} ${response.statusText}`);
        } catch (error) {
            console.error(`${route.name} (${route.url}): ERROR - ${error.message}`);
        }
    }
    
    console.log('=== Fin de pruebas ===');
};
