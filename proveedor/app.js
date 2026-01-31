// app.js - Proveedor - Versión completa ACTUALIZADA para internet
const API_URL = 'https://proveedor-api-salazar.onrender.com/api'; // URL actualizada
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
            
            loginContainer.style.display = 'none';
            dashboard.style.display = 'block';
            
            loadHomeView();
            checkConnection();
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

// Cargar vista principal
function loadHomeView() {
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
        
        <button class="floating-btn" onclick="window.viewAllProducts('todos')" title="Ver todos los productos">
            <i class="fas fa-boxes"></i>
            <span>Todos los Productos</span>
        </button>
    `;
    
    // Cargar estadísticas
    loadStatistics();
}

// Funciones de navegación
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
    
    loadStoresData();
};

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
    
    loadProductsData(category);
};

// ========== FUNCIONES DE PRODUCTOS ==========

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
    
    document.getElementById('productForm').reset();
    document.getElementById('productError').style.display = 'none';
    
    modal.style.display = 'flex';
};

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

// ========== FUNCIONES DE TIENDAS ==========

window.openAddStoreModal = function() {
    const modal = document.getElementById('addStoreModal');
    document.getElementById('storeForm').reset();
    document.getElementById('storeError').style.display = 'none';
    modal.style.display = 'flex';
};

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

// ========== FUNCIONES DE SOLICITUDES (ACTUALIZADAS) ==========

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

// ========== FUNCIONES DE CARGA DE DATOS ==========

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
    try {
        const response = await fetch(`${API_URL}/proveedor/productos`);
        const productos = await response.json();
        
        const productosFiltrados = category === 'todos' 
            ? productos 
            : productos.filter(p => p.categoria === category);
        
        displayProductsData(productosFiltrados, category);
    } catch (error) {
        console.error('Error cargando productos:', error);
        showProductsError(category, error.message);
    }
}

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
    try {
        const response = await fetch(`${API_URL}/proveedor/tiendas`);
        const tiendas = await response.json();
        displayStoresData(tiendas);
    } catch (error) {
        console.error('Error cargando tiendas:', error);
        showStoresError(error.message);
    }
}

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

// ========== CONFIGURACIÓN DE FORMULARIOS ==========

document.addEventListener('DOMContentLoaded', () => {
    // Formulario para agregar tienda
    const storeForm = document.getElementById('storeForm');
    if (storeForm) {
        storeForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
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
                const errorElement = document.getElementById('storeError');
                errorElement.textContent = 'Error de conexión con el servidor';
                errorElement.style.display = 'block';
            }
        });
    }
    
    // Formulario para agregar producto
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
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
                
                if (response.ok) {
                    document.getElementById('addProductModal').style.display = 'none';
                    productForm.reset();
                    
                    // Recargar la vista actual
                    const currentCategory = producto.categoria;
                    loadProductsData(currentCategory);
                    loadStatistics();
                    alert('Producto agregado exitosamente');
                } else {
                    const errorElement = document.getElementById('productError');
                    errorElement.textContent = 'Error al guardar producto';
                    errorElement.style.display = 'block';
                }
            } catch (error) {
                const errorElement = document.getElementById('productError');
                errorElement.textContent = 'Error de conexión con el servidor';
                errorElement.style.display = 'block';
            }
        });
    }
    
    // Formulario para editar producto
    const editProductForm = document.getElementById('editProductForm');
    if (editProductForm) {
        editProductForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
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
                const errorElement = document.getElementById('editProductError');
                errorElement.textContent = 'Error de conexión con el servidor';
                errorElement.style.display = 'block';
            }
        });
    }
    
    // Cerrar modales
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', function() {
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

// ========== FUNCIONES AUXILIARES ==========

function showProductsError(category, message) {
    const container = document.getElementById('productsListContainer');
    if (container) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error al cargar productos</h3>
                <p>${message}</p>
                <button onclick="window.loadProductsData('${category}')" class="btn-primary" style="width: auto; margin-top: 20px; padding: 10px 20px;">
                    <i class="fas fa-redo"></i> Reintentar
                </button>
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
                <button onclick="window.loadStoresData()" class="btn-primary" style="width: auto; margin-top: 20px; padding: 10px 20px;">
                    <i class="fas fa-redo"></i> Reintentar
                </button>
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

// Actualizaciones periódicas
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

// Función para probar rutas (debugging)
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

// Función para cargar CSS dinámicamente
function loadStyles() {
    // Solo cargar si no hay estilos ya aplicados
    if (!document.querySelector('#proveedor-styles')) {
        const link = document.createElement('link');
        link.id = 'proveedor-styles';
        link.rel = 'stylesheet';
        link.href = 'styles.css'; // Archivo CSS externo
        document.head.appendChild(link);
    }
}

// Cargar estilos cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', loadStyles);