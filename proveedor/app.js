// app.js - Versión completa actualizada (proveedor)
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

// Cargar vista principal
function loadHomeView() {
    console.log('Cargando vista principal...');
    
    if (!breadcrumb || !mainContent) {
        console.error('Elementos del DOM no encontrados');
        return;
    }
    
    breadcrumb.innerHTML = '<span class="breadcrumb-item active" data-action="home">Inicio</span>';
    
    mainContent.innerHTML = `
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
            
            <div class="grid-card" data-action="solicitudes">
                <i class="fas fa-clipboard-list"></i>
                <h3>Solicitudes</h3>
                <p>Revisa solicitudes de tiendas</p>
                <span class="coming-soon">Próximamente</span>
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
            <button class="btn-primary" onclick="window.openAddStoreModal()" style="width: auto; padding: 10px 20px;">
                <i class="fas fa-plus"></i> Agregar Tienda
            </button>
        </div>
        
        <div class="stores-list" id="storesListContainer">
            <div class="empty-state">
                <i class="fas fa-spinner fa-spin"></i>
                <h3>Cargando tiendas...</h3>
            </div>
        </div>
        
        <div style="margin-top: 20px;">
            <button class="btn-primary" onclick="window.loadHomeView()" style="width: auto; padding: 10px 20px; background: #6b7280;">
                <i class="fas fa-arrow-left"></i> Volver al Inicio
            </button>
        </div>
    `;
    
    // Cargar datos de tiendas usando nueva ruta
    loadStoresData();
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
            <button class="btn-primary" onclick="window.addProductToCategory('${category}')" style="width: auto; padding: 10px 20px;">
                <i class="fas fa-plus"></i> Agregar Producto
            </button>
        </div>
        
        <div class="products-list" id="productsListContainer">
            <div class="empty-state">
                <i class="fas fa-spinner fa-spin"></i>
                <h3>Cargando productos...</h3>
            </div>
        </div>
        
        <div style="margin-top: 20px;">
            <button class="btn-primary" onclick="window.loadProductCategoriesView()" style="width: auto; padding: 10px 20px; background: #6b7280;">
                <i class="fas fa-arrow-left"></i> Volver a Categorías
            </button>
        </div>
    `;
    
    // Cargar productos usando nueva ruta
    loadProductsData(category);
};

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

window.openAddStoreModal = function() {
    const modal = document.getElementById('addStoreModal');
    document.getElementById('storeForm').reset();
    document.getElementById('storeError').style.display = 'none';
    modal.style.display = 'flex';
};

// Función para cargar datos de productos (USA NUEVA RUTA)
async function loadProductsData(category = 'todos') {
    console.log('Cargando productos para categoría:', category);
    
    try {
        // USAR NUEVA RUTA: /api/proveedor/productos
        const response = await fetch(`${API_URL}/proveedor/productos`);
        
        if (!response.ok) {
            // Si falla, intentar con la ruta original como fallback
            console.warn('Nueva ruta falló, intentando ruta original...');
            await loadProductsFallback(category);
            return;
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

// Función de fallback para productos
async function loadProductsFallback(category = 'todos') {
    try {
        // Intentar con la ruta original (con credenciales si es necesario)
        const response = await fetch(`${API_URL}/productos`, {
            headers: isAuthenticated ? {
                'username': authHeaders.username,
                'password': authHeaders.password
            } : {}
        });
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const productos = await response.json();
        
        // Filtrar por categoría
        const productosFiltrados = category === 'todos' 
            ? productos 
            : productos.filter(p => p.categoria === category);
        
        displayProductsData(productosFiltrados, category);
    } catch (error) {
        console.error('Fallback también falló:', error);
        showProductsError(category, error.message);
    }
}

// Función para mostrar productos
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
                <span>
                    <i class="fas fa-calendar"></i>
                    ${producto.fecha ? new Date(producto.fecha).toLocaleDateString() : 'Sin fecha'}
                </span>
                <span>
                    <i class="fas fa-tag"></i>
                    ID: ${producto.id || 'N/A'}
                </span>
            </div>
        </div>
    `).join('');
}

// Función para cargar datos de tiendas (USA NUEVA RUTA)
async function loadStoresData() {
    console.log('Cargando tiendas...');
    
    try {
        // USAR NUEVA RUTA: /api/proveedor/tiendas
        const response = await fetch(`${API_URL}/proveedor/tiendas`);
        
        if (!response.ok) {
            // Si falla, intentar con la ruta original como fallback
            console.warn('Nueva ruta de tiendas falló, intentando ruta original...');
            await loadStoresFallback();
            return;
        }
        
        const tiendas = await response.json();
        console.log('Tiendas obtenidas:', tiendas);
        displayStoresData(tiendas);
    } catch (error) {
        console.error('Error cargando tiendas:', error);
        showStoresError(error.message);
    }
}

// Función de fallback para tiendas
async function loadStoresFallback() {
    try {
        const response = await fetch(`${API_URL}/tiendas`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const tiendas = await response.json();
        displayStoresData(tiendas);
    } catch (error) {
        console.error('Fallback de tiendas también falló:', error);
        showStoresError(error.message);
    }
}

// Función para mostrar tiendas
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
                <strong>ID:</strong> ${tienda.id || 'N/A'}
            </div>
            
            <div class="store-meta">
                <span>
                    <i class="fas fa-calendar"></i>
                    ${tienda.fechaCreacion ? new Date(tienda.fechaCreacion).toLocaleDateString() : 'Sin fecha'}
                </span>
                <span>
                    <i class="fas fa-key"></i>
                    ${tienda.password ? 'Contraseña configurada' : 'Sin contraseña'}
                </span>
            </div>
        </div>
    `).join('');
}

// Funciones para mostrar errores
function showProductsError(category, message) {
    const container = document.getElementById('productsListContainer');
    if (container) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error al cargar productos</h3>
                <p>${message}</p>
                <p>Verifica que el servidor tenga las rutas configuradas:</p>
                <ul style="text-align: left; margin: 10px 0;">
                    <li>GET /api/proveedor/productos</li>
                    <li>POST /api/productos</li>
                </ul>
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
                <p>Verifica que el servidor tenga las rutas configuradas:</p>
                <ul style="text-align: left; margin: 10px 0;">
                    <li>GET /api/proveedor/tiendas</li>
                    <li>POST /api/tiendas</li>
                </ul>
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

// Configurar event listeners para formularios cuando el DOM esté listo
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
                const response = await fetch(`${API_URL}/tiendas`, {
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
                const response = await fetch(`${API_URL}/productos`, {
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
    
    // Cerrar modales
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            console.log('Cerrando modal...');
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
        });
    });
    
    // Cerrar modales al hacer clic fuera
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                console.log('Clic fuera del modal, cerrando...');
                modal.style.display = 'none';
            }
        });
    });
});

// Actualizaciones periódicas
function startPeriodicUpdates() {
    setInterval(checkConnection, 10000);
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
`;
document.head.appendChild(style);

// Función para probar las rutas (útil para debugging)
window.testRoutes = async function() {
    console.log('=== Probando rutas del servidor ===');
    
    const routes = [
        { url: `${API_URL}/status`, name: 'Status' },
        { url: `${API_URL}/proveedor/productos`, name: 'Productos Proveedor' },
        { url: `${API_URL}/proveedor/tiendas`, name: 'Tiendas Proveedor' },
        { url: `${API_URL}/productos`, name: 'Productos (original)' },
        { url: `${API_URL}/tiendas`, name: 'Tiendas (original)' }
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

// Ejecutar prueba de rutas al cargar (opcional, para debugging)
// window.addEventListener('load', () => {
//     setTimeout(() => window.testRoutes(), 1000);
// });
