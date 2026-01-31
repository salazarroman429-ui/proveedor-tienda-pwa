const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ========== CONFIGURACIÓN CORS ESPECÍFICA PARA GITHUB PAGES + RENDER ==========

// Lista de orígenes permitidos
const allowedOrigins = [
    'https://salazarroman429-ui.github.io',  // Tu GitHub Pages
    'http://localhost:3000',
    'http://localhost:8080',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:8080',
    'https://*.onrender.com',                // Todos los dominios de Render
    'http://*.onrender.com'
];

// Middleware CORS personalizado
const corsOptions = {
    origin: function (origin, callback) {
        // Permitir requests sin origen (como mobile apps o curl)
        if (!origin) return callback(null, true);
        
        // En desarrollo, permitir todo
        if (process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }
        
        // Verificar contra lista de orígenes permitidos
        const isAllowed = allowedOrigins.some(allowed => {
            if (allowed.includes('*.')) {
                // Para patrones como *.onrender.com
                const domain = allowed.replace('*.', '');
                return origin.endsWith(domain);
            }
            return origin === allowed;
        });
        
        if (isAllowed) {
            callback(null, true);
        } else {
            console.warn(`⚠️ Origen bloqueado por CORS: ${origin}`);
            callback(new Error('Not allowed by CORS'), false);
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
};

app.use(cors(corsOptions));

// Manejar preflight requests explícitamente
app.options('*', cors(corsOptions));

// ========== MIDDLEWARES ==========

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging mejorado
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`\n📥 [${timestamp}] ${req.method} ${req.originalUrl}`);
    console.log(`   Origin: ${req.headers.origin || 'No origin'}`);
    console.log(`   Content-Type: ${req.headers['content-type'] || 'No content-type'}`);
    console.log(`   User-Agent: ${(req.headers['user-agent'] || '').substring(0, 60)}...`);
    
    // Log del body para POST/PUT (útil para debug)
    if (req.method === 'POST' || req.method === 'PUT') {
        console.log(`   Body:`, JSON.stringify(req.body).substring(0, 200) + '...');
    }
    
    next();
});

// ========== CONFIGURACIÓN DE ARCHIVOS ==========

const DATA_DIR = __dirname;
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const STORES_FILE = path.join(DATA_DIR, 'stores.json');
const REQUESTS_FILE = path.join(DATA_DIR, 'requests.json');

// Credenciales del proveedor
const PROVEEDOR_CREDENTIALS = {
    username: "Admin429",
    password: "adm429"
};

// Inicializar archivos
function initializeFiles() {
    try {
        if (!fs.existsSync(PRODUCTS_FILE)) {
            const initialProducts = [
                {
                    id: 1,
                    nombre: "Mermelada de Fresa",
                    descripcion: "Mermelada artesanal 250g",
                    precio: 3.99,
                    cantidad: 100,
                    categoria: "confituras",
                    unidad: "frasco",
                    fecha: new Date().toISOString()
                },
                {
                    id: 2,
                    nombre: "Miel de Abeja Pura",
                    descripcion: "Miel 100% natural 500g",
                    precio: 8.50,
                    cantidad: 50,
                    categoria: "endulzantes",
                    unidad: "frasco",
                    fecha: new Date().toISOString()
                }
            ];
            fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(initialProducts, null, 2));
            console.log('✅ products.json inicializado con 2 productos');
        }

        if (!fs.existsSync(STORES_FILE)) {
            const initialStores = [
                {
                    id: 1,
                    storename: "Tienda Central",
                    username: "tienda1",
                    password: "tienda123",
                    fechaCreacion: new Date().toISOString(),
                    activa: true
                },
                {
                    id: 2,
                    storename: "Supermercado Norte",
                    username: "tienda2",
                    password: "tienda456",
                    fechaCreacion: new Date().toISOString(),
                    activa: true
                }
            ];
            fs.writeFileSync(STORES_FILE, JSON.stringify(initialStores, null, 2));
            console.log('✅ stores.json inicializado con 2 tiendas');
        }

        if (!fs.existsSync(REQUESTS_FILE)) {
            fs.writeFileSync(REQUESTS_FILE, JSON.stringify([], null, 2));
            console.log('✅ requests.json inicializado vacío');
        }
    } catch (error) {
        console.error('❌ Error inicializando archivos:', error);
    }
}

initializeFiles();

// ========== RUTAS DE DIAGNÓSTICO ==========

// Ruta de prueba simple
app.get('/ping', (req, res) => {
    res.setHeader('Content-Type', 'text/plain');
    res.send('pong');
});

// Ruta para verificar que el servidor responde
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'proveedor-tienda-api',
        version: '2.0.0'
    });
});

// Ruta para debug de CORS
app.get('/api/debug/cors', (req, res) => {
    const debugInfo = {
        timestamp: new Date().toISOString(),
        request: {
            method: req.method,
            url: req.url,
            origin: req.headers.origin,
            headers: req.headers
        },
        cors: {
            allowedOrigins: allowedOrigins,
            isAllowed: allowedOrigins.some(allowed => {
                if (allowed.includes('*.')) {
                    const domain = allowed.replace('*.', '');
                    return req.headers.origin?.endsWith(domain);
                }
                return req.headers.origin === allowed;
            })
        }
    };
    
    console.log('🔍 Debug CORS:', debugInfo);
    res.json(debugInfo);
});

// Ruta para listar TODAS las rutas disponibles
app.get('/api/routes', (req, res) => {
    const routes = [];
    
    app._router.stack.forEach((middleware) => {
        if (middleware.route) {
            // Rutas directas
            routes.push({
                path: middleware.route.path,
                methods: Object.keys(middleware.route.methods)
            });
        } else if (middleware.name === 'router') {
            // Rutas de router
            middleware.handle.stack.forEach((handler) => {
                if (handler.route) {
                    routes.push({
                        path: handler.route.path,
                        methods: Object.keys(handler.route.methods)
                    });
                }
            });
        }
    });
    
    res.json({
        count: routes.length,
        routes: routes.sort((a, b) => a.path.localeCompare(b.path))
    });
});

// ========== PÁGINA PRINCIPAL CON INFO DETALLADA ==========

app.get('/', (req, res) => {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>🚀 API Proveedor-Tienda</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
                line-height: 1.6; 
                color: #333;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                padding: 20px;
            }
            .container {
                max-width: 1200px;
                margin: 0 auto;
                background: white;
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                overflow: hidden;
            }
            header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 40px;
                text-align: center;
            }
            h1 { font-size: 2.5rem; margin-bottom: 10px; }
            .status { 
                display: inline-block; 
                background: rgba(255,255,255,0.2); 
                padding: 5px 15px; 
                border-radius: 20px; 
                font-size: 0.9rem; 
                margin-bottom: 20px;
            }
            .content { padding: 40px; }
            .grid { 
                display: grid; 
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
                gap: 20px; 
                margin: 30px 0;
            }
            .card {
                background: #f8f9fa;
                border-radius: 10px;
                padding: 20px;
                border: 1px solid #e9ecef;
                transition: transform 0.3s, box-shadow 0.3s;
            }
            .card:hover {
                transform: translateY(-5px);
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }
            .card h3 { color: #667eea; margin-bottom: 15px; }
            .endpoint {
                background: white;
                padding: 10px 15px;
                margin: 10px 0;
                border-radius: 8px;
                border-left: 4px solid #667eea;
            }
            .method {
                display: inline-block;
                padding: 3px 8px;
                border-radius: 4px;
                font-size: 0.8rem;
                font-weight: bold;
                margin-right: 10px;
            }
            .get { background: #61affe; color: white; }
            .post { background: #49cc90; color: white; }
            .put { background: #fca130; color: white; }
            .delete { background: #f93e3e; color: white; }
            .test-btn {
                background: #667eea;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 1rem;
                margin: 5px;
                transition: background 0.3s;
            }
            .test-btn:hover { background: #5a67d8; }
            .results {
                margin-top: 20px;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 10px;
                display: none;
            }
            pre {
                background: #1a1a1a;
                color: #00ff00;
                padding: 15px;
                border-radius: 5px;
                overflow-x: auto;
                font-family: 'Courier New', monospace;
                font-size: 0.9rem;
            }
            .alert {
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
            }
            .alert-success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
            .alert-error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        </style>
    </head>
    <body>
        <div class="container">
            <header>
                <h1>🚀 API Proveedor-Tienda PWA</h1>
                <div class="status">✅ CONECTADO • Puerto: ${PORT} • ${new Date().toLocaleString()}</div>
                <p>Backend para sistema de gestión proveedor-tienda</p>
            </header>
            
            <div class="content">
                <div class="alert alert-success">
                    <strong>Base URL:</strong> ${baseUrl}<br>
                    <strong>Frontend (GitHub Pages):</strong> https://salazarroman429-ui.github.io/proveedor-tienda-pwa/
                </div>
                
                <h2>🔧 Endpoints Principales</h2>
                <div class="grid">
                    <div class="card">
                        <h3>📦 Productos (Proveedor)</h3>
                        <div class="endpoint">
                            <span class="method get">GET</span>
                            <code>/api/proveedor/productos</code>
                            <p><small>Listar todos los productos</small></p>
                            <button class="test-btn" onclick="testEndpoint('GET', '/api/proveedor/productos')">Probar</button>
                        </div>
                        <div class="endpoint">
                            <span class="method post">POST</span>
                            <code>/api/proveedor/productos</code>
                            <p><small>Crear nuevo producto</small></p>
                            <button class="test-btn" onclick="testCreateProduct()">Probar Crear</button>
                        </div>
                        <div class="endpoint">
                            <span class="method put">PUT</span>
                            <code>/api/proveedor/productos/:id</code>
                            <p><small>Actualizar producto</small></p>
                        </div>
                        <div class="endpoint">
                            <span class="method delete">DELETE</span>
                            <code>/api/proveedor/productos/:id</code>
                            <p><small>Eliminar producto</small></p>
                        </div>
                    </div>
                    
                    <div class="card">
                        <h3>🏪 Tiendas</h3>
                        <div class="endpoint">
                            <span class="method get">GET</span>
                            <code>/api/proveedor/tiendas</code>
                            <p><small>Listar tiendas</small></p>
                            <button class="test-btn" onclick="testEndpoint('GET', '/api/proveedor/tiendas')">Probar</button>
                        </div>
                        <div class="endpoint">
                            <span class="method post">POST</span>
                            <code>/api/proveedor/tiendas</code>
                            <p><small>Crear tienda</small></p>
                        </div>
                    </div>
                    
                    <div class="card">
                        <h3>🔐 Autenticación</h3>
                        <div class="endpoint">
                            <span class="method post">POST</span>
                            <code>/api/proveedor/login</code>
                            <p><small>Login proveedor</small></p>
                            <button class="test-btn" onclick="testLogin()">Probar Login</button>
                        </div>
                        <div class="endpoint">
                            <span class="method post">POST</span>
                            <code>/api/tienda/login</code>
                            <p><small>Login tienda</small></p>
                        </div>
                    </div>
                </div>
                
                <h2>🛠 Herramientas de Debug</h2>
                <div class="grid">
                    <div class="card">
                        <h3>🔍 Diagnóstico</h3>
                        <button class="test-btn" onclick="testEndpoint('GET', '/ping')">Test Ping</button>
                        <button class="test-btn" onclick="testEndpoint('GET', '/health')">Health Check</button>
                        <button class="test-btn" onclick="testEndpoint('GET', '/api/debug/cors')">Debug CORS</button>
                        <button class="test-btn" onclick="testEndpoint('GET', '/api/routes')">Ver Rutas</button>
                    </div>
                </div>
                
                <div id="results" class="results"></div>
            </div>
        </div>
        
        <script>
            async function testEndpoint(method, endpoint) {
                const results = document.getElementById('results');
                results.style.display = 'block';
                results.innerHTML = '<p>🔄 Probando conexión... <span class="loading">⏳</span></p>';
                
                try {
                    const options = {
                        method: method,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    };
                    
                    if (method === 'POST' || method === 'PUT') {
                        options.body = JSON.stringify({ test: true });
                    }
                    
                    const startTime = Date.now();
                    const response = await fetch(endpoint, options);
                    const endTime = Date.now();
                    const duration = endTime - startTime;
                    
                    let data;
                    const contentType = response.headers.get('content-type');
                    
                    if (contentType && contentType.includes('application/json')) {
                        data = await response.json();
                    } else {
                        data = await response.text();
                    }
                    
                    const statusClass = response.ok ? 'alert-success' : 'alert-error';
                    
                    results.innerHTML = \`
                        <div class="alert \${statusClass}">
                            <strong>\${method} \${endpoint}</strong>
                            <p>Status: \${response.status} \${response.statusText} • Tiempo: \${duration}ms</p>
                            <p>Content-Type: \${contentType || 'No especificado'}</p>
                        </div>
                        <pre>\${JSON.stringify(data, null, 2)}</pre>
                        <button class="test-btn" onclick="document.getElementById('results').style.display='none'">Cerrar</button>
                    \`;
                    
                } catch (error) {
                    results.innerHTML = \`
                        <div class="alert alert-error">
                            <strong>❌ Error en \${method} \${endpoint}</strong>
                            <p>\${error.message}</p>
                            <p>Verifica la consola para más detalles.</p>
                        </div>
                        <button class="test-btn" onclick="document.getElementById('results').style.display='none'">Cerrar</button>
                    \`;
                    console.error('Error en test:', error);
                }
            }
            
            async function testLogin() {
                const results = document.getElementById('results');
                results.style.display = 'block';
                results.innerHTML = '<p>🔄 Probando login... <span class="loading">⏳</span></p>';
                
                try {
                    const response = await fetch('/api/proveedor/login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            username: 'Admin429',
                            password: 'adm429'
                        })
                    });
                    
                    const data = await response.json();
                    
                    results.innerHTML = \`
                        <div class="alert \${response.ok ? 'alert-success' : 'alert-error'}">
                            <strong>POST /api/proveedor/login</strong>
                            <p>Status: \${response.status} \${response.statusText}</p>
                            <p>\${data.message || data.error}</p>
                        </div>
                        <pre>\${JSON.stringify(data, null, 2)}</pre>
                        <button class="test-btn" onclick="document.getElementById('results').style.display='none'">Cerrar</button>
                    \`;
                    
                } catch (error) {
                    results.innerHTML = \`
                        <div class="alert alert-error">
                            <strong>❌ Error en login</strong>
                            <p>\${error.message}</p>
                        </div>
                        <button class="test-btn" onclick="document.getElementById('results').style.display='none'">Cerrar</button>
                    \`;
                }
            }
            
            async function testCreateProduct() {
                const results = document.getElementById('results');
                results.style.display = 'block';
                results.innerHTML = '<p>🔄 Creando producto de prueba... <span class="loading">⏳</span></p>';
                
                const testProduct = {
                    nombre: 'Producto de Prueba ' + Date.now(),
                    descripcion: 'Este es un producto creado desde la página de test',
                    precio: 9.99,
                    cantidad: 100,
                    categoria: 'pruebas',
                    unidad: 'unidad'
                };
                
                try {
                    const response = await fetch('/api/proveedor/productos', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(testProduct)
                    });
                    
                    const data = await response.json();
                    
                    results.innerHTML = \`
                        <div class="alert \${response.ok ? 'alert-success' : 'alert-error'}">
                            <strong>POST /api/proveedor/productos</strong>
                            <p>Status: \${response.status} \${response.statusText}</p>
                            <p>\${data.message || data.error || 'Producto creado'}</p>
                        </div>
                        <pre>\${JSON.stringify(data, null, 2)}</pre>
                        <button class="test-btn" onclick="testEndpoint('GET', '/api/proveedor/productos')">Ver Productos</button>
                        <button class="test-btn" onclick="document.getElementById('results').style.display='none'">Cerrar</button>
                    \`;
                    
                } catch (error) {
                    results.innerHTML = \`
                        <div class="alert alert-error">
                            <strong>❌ Error creando producto</strong>
                            <p>\${error.message}</p>
                            <p>Revisa la consola del servidor para más detalles.</p>
                        </div>
                        <button class="test-btn" onclick="document.getElementById('results').style.display='none'">Cerrar</button>
                    \`;
                }
            }
            
            // Probar conexión automáticamente al cargar
            window.addEventListener('load', () => {
                testEndpoint('GET', '/health');
            });
        </script>
    </body>
    </html>
    `;
    
    res.send(html);
});

// ========== RUTAS DEL PROVEEDOR ==========

// Login proveedor
app.post('/api/proveedor/login', (req, res) => {
    console.log('🔐 POST /api/proveedor/login - Intentando login...');
    
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            console.log('❌ Falta username o password');
            return res.status(400).json({ 
                success: false, 
                error: 'Usuario y contraseña requeridos' 
            });
        }
        
        console.log(`📝 Usuario: ${username}`);
        
        if (username === PROVEEDOR_CREDENTIALS.username && 
            password === PROVEEDOR_CREDENTIALS.password) {
            console.log('✅ Login exitoso');
            res.json({ 
                success: true, 
                message: 'Login exitoso',
                user: { username: PROVEEDOR_CREDENTIALS.username },
                timestamp: new Date().toISOString()
            });
        } else {
            console.log('❌ Credenciales incorrectas');
            res.status(401).json({ 
                success: false, 
                error: 'Credenciales incorrectas' 
            });
        }
    } catch (error) {
        console.error('🔥 Error en login:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error en el servidor',
            details: error.message 
        });
    }
});

// Obtener productos
app.get('/api/proveedor/productos', (req, res) => {
    console.log('📦 GET /api/proveedor/productos');
    
    try {
        if (!fs.existsSync(PRODUCTS_FILE)) {
            console.log('⚠️ Archivo products.json no existe, creando...');
            fs.writeFileSync(PRODUCTS_FILE, JSON.stringify([], null, 2));
        }
        
        const data = fs.readFileSync(PRODUCTS_FILE, 'utf8');
        const productos = JSON.parse(data);
        
        console.log(`✅ Enviando ${productos.length} productos`);
        res.json(productos);
    } catch (error) {
        console.error('❌ Error leyendo productos:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error al leer productos',
            details: error.message 
        });
    }
});

// CREAR NUEVO PRODUCTO - CORREGIDO
app.post('/api/proveedor/productos', (req, res) => {
    console.log('➕ POST /api/proveedor/productos - Creando nuevo producto');
    console.log('📦 Datos recibidos:', req.body);
    
    try {
        // Validar datos requeridos
        const { nombre, descripcion, precio, cantidad, categoria, unidad } = req.body;
        
        if (!nombre || !precio || !cantidad || !categoria || !unidad) {
            console.log('❌ Faltan campos requeridos');
            return res.status(400).json({
                success: false,
                error: 'Faltan campos requeridos: nombre, precio, cantidad, categoria, unidad'
            });
        }
        
        // Leer productos existentes
        let productos = [];
        if (fs.existsSync(PRODUCTS_FILE)) {
            const data = fs.readFileSync(PRODUCTS_FILE, 'utf8');
            productos = JSON.parse(data);
        }
        
        // Crear nuevo ID
        const newId = productos.length > 0 
            ? Math.max(...productos.map(p => p.id)) + 1 
            : 1;
        
        const nuevoProducto = {
            id: newId,
            nombre,
            descripcion: descripcion || '',
            precio: parseFloat(precio),
            cantidad: parseInt(cantidad),
            categoria,
            unidad,
            fecha: new Date().toISOString()
        };
        
        console.log('🆕 Nuevo producto creado:', nuevoProducto);
        
        // Agregar a la lista
        productos.push(nuevoProducto);
        
        // Guardar en archivo
        fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(productos, null, 2));
        
        console.log(`✅ Producto guardado. Total productos: ${productos.length}`);
        
        // Responder con éxito
        res.status(201).json({
            success: true,
            message: 'Producto creado exitosamente',
            producto: nuevoProducto,
            totalProductos: productos.length
        });
        
    } catch (error) {
        console.error('🔥 Error crítico creando producto:', error);
        res.status(500).json({
            success: false,
            error: 'Error al crear producto',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Actualizar producto
app.put('/api/proveedor/productos/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    console.log(`✏️ PUT /api/proveedor/productos/${productId} - Actualizando`);
    
    try {
        if (!fs.existsSync(PRODUCTS_FILE)) {
            return res.status(404).json({ error: 'Archivo de productos no encontrado' });
        }
        
        const productos = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
        const index = productos.findIndex(p => p.id === productId);
        
        if (index === -1) {
            console.log(`❌ Producto ID ${productId} no encontrado`);
            return res.status(404).json({ 
                success: false, 
                error: 'Producto no encontrado' 
            });
        }
        
        // Actualizar producto manteniendo datos existentes
        productos[index] = {
            ...productos[index],
            ...req.body,
            id: productId // Asegurar que el ID no cambie
        };
        
        fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(productos, null, 2));
        
        console.log(`✅ Producto ${productId} actualizado`);
        res.json({ 
            success: true, 
            producto: productos[index],
            message: 'Producto actualizado exitosamente'
        });
    } catch (error) {
        console.error('❌ Error actualizando producto:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error al actualizar producto' 
        });
    }
});

// Eliminar producto
app.delete('/api/proveedor/productos/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    console.log(`🗑️ DELETE /api/proveedor/productos/${productId}`);
    
    try {
        if (!fs.existsSync(PRODUCTS_FILE)) {
            return res.status(404).json({ error: 'Archivo de productos no encontrado' });
        }
        
        let productos = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
        const index = productos.findIndex(p => p.id === productId);
        
        if (index === -1) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        
        const productoEliminado = productos[index];
        productos = productos.filter(p => p.id !== productId);
        
        fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(productos, null, 2));
        
        console.log(`✅ Producto ${productId} eliminado. Total: ${productos.length}`);
        res.json({ 
            success: true, 
            producto: productoEliminado,
            message: 'Producto eliminado exitosamente',
            totalProductos: productos.length
        });
    } catch (error) {
        console.error('❌ Error eliminando producto:', error);
        res.status(500).json({ error: 'Error al eliminar producto' });
    }
});

// Obtener todas las tiendas
app.get('/api/proveedor/tiendas', (req, res) => {
    console.log('🏪 GET /api/proveedor/tiendas');
    
    try {
        const data = fs.readFileSync(STORES_FILE, 'utf8');
        const tiendas = JSON.parse(data);
        res.json(tiendas);
    } catch (error) {
        console.error('❌ Error leyendo tiendas:', error);
        res.status(500).json({ error: 'Error al leer tiendas' });
    }
});

// Crear tienda
app.post('/api/proveedor/tiendas', (req, res) => {
    console.log('➕ POST /api/proveedor/tiendas - Creando tienda');
    
    const { storename, username, password } = req.body;
    
    if (!username || !password || !storename) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    try {
        const stores = JSON.parse(fs.readFileSync(STORES_FILE, 'utf8'));
        
        if (stores.some(s => s.username === username)) {
            return res.status(400).json({ error: 'El usuario ya existe' });
        }

        const nuevaTienda = {
            id: stores.length + 1,
            storename,
            username,
            password,
            fechaCreacion: new Date().toISOString(),
            activa: true
        };

        stores.push(nuevaTienda);
        fs.writeFileSync(STORES_FILE, JSON.stringify(stores, null, 2));
        
        console.log(`✅ Tienda creada: ${storename} (${username})`);
        res.json({ success: true, tienda: nuevaTienda });
    } catch (error) {
        console.error('❌ Error creando tienda:', error);
        res.status(500).json({ error: 'Error al crear tienda' });
    }
});

// Eliminar tienda
app.delete('/api/proveedor/tiendas/:id', (req, res) => {
    const tiendaId = parseInt(req.params.id);
    console.log(`🗑️ DELETE /api/proveedor/tiendas/${tiendaId}`);
    
    try {
        const stores = JSON.parse(fs.readFileSync(STORES_FILE, 'utf8'));
        const index = stores.findIndex(s => s.id === tiendaId);
        
        if (index === -1) {
            return res.status(404).json({ error: 'Tienda no encontrada' });
        }
        
        const tiendaEliminada = stores[index];
        stores.splice(index, 1);
        fs.writeFileSync(STORES_FILE, JSON.stringify(stores, null, 2));
        
        console.log(`✅ Tienda ${tiendaId} eliminada`);
        res.json({ success: true, tienda: tiendaEliminada });
    } catch (error) {
        console.error('❌ Error eliminando tienda:', error);
        res.status(500).json({ error: 'Error al eliminar tienda' });
    }
});

// Obtener todas las solicitudes
app.get('/api/proveedor/solicitudes', (req, res) => {
    console.log('📋 GET /api/proveedor/solicitudes');
    
    try {
        const requests = JSON.parse(fs.readFileSync(REQUESTS_FILE, 'utf8'));
        res.json(requests);
    } catch (error) {
        console.error('❌ Error leyendo solicitudes:', error);
        res.status(500).json({ error: 'Error al leer solicitudes' });
    }
});

// Actualizar estado de solicitud
app.put('/api/proveedor/solicitudes/:id', (req, res) => {
    const solicitudId = parseInt(req.params.id);
    console.log(`✏️ PUT /api/proveedor/solicitudes/${solicitudId}`);
    
    try {
        const { estado, comentarios, productosAprobados } = req.body;
        const requests = JSON.parse(fs.readFileSync(REQUESTS_FILE, 'utf8'));
        const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
        
        const requestIndex = requests.findIndex(r => r.id === solicitudId);
        if (requestIndex === -1) {
            return res.status(404).json({ error: 'Solicitud no encontrada' });
        }
        
        requests[requestIndex].estado = estado;
        requests[requestIndex].comentarios = comentarios || '';
        requests[requestIndex].fechaActualizacion = new Date().toISOString();
        
        if (estado === 'aceptada' && productosAprobados) {
            let stockSuficiente = true;
            const productosNoDisponibles = [];
            
            for (const productoAprobado of productosAprobados) {
                const producto = products.find(p => p.id === productoAprobado.productoId);
                if (!producto || producto.cantidad < productoAprobado.cantidadAprobada) {
                    stockSuficiente = false;
                    productosNoDisponibles.push({
                        productoId: productoAprobado.productoId,
                        cantidadSolicitada: productoAprobado.cantidadSolicitada,
                        cantidadDisponible: producto ? producto.cantidad : 0
                    });
                }
            }
            
            if (!stockSuficiente) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Stock insuficiente',
                    productosNoDisponibles 
                });
            }
            
            for (const productoAprobado of productosAprobados) {
                const productoIndex = products.findIndex(p => p.id === productoAprobado.productoId);
                if (productoIndex !== -1) {
                    products[productoIndex].cantidad -= productoAprobado.cantidadAprobada;
                    products[productoIndex].movimientos = products[productoIndex].movimientos || [];
                    products[productoIndex].movimientos.push({
                        tipo: 'salida',
                        cantidad: productoAprobado.cantidadAprobada,
                        fecha: new Date().toISOString(),
                        destino: requests[requestIndex].tiendaNombre,
                        solicitudId: solicitudId
                    });
                }
            }
            
            requests[requestIndex].cantidadAprobada = productosAprobados
                .reduce((sum, p) => sum + p.cantidadAprobada, 0);
            requests[requestIndex].productosAprobados = productosAprobados;
            
            fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
        }
        
        fs.writeFileSync(REQUESTS_FILE, JSON.stringify(requests, null, 2));
        
        console.log(`✅ Solicitud ${solicitudId} actualizada a: ${estado}`);
        res.json({ 
            success: true, 
            solicitud: requests[requestIndex],
            message: `Solicitud ${estado} correctamente`
        });
    } catch (error) {
        console.error('❌ Error actualizando solicitud:', error);
        res.status(500).json({ error: 'Error al actualizar solicitud' });
    }
});

// Obtener estadísticas
app.get('/api/proveedor/estadisticas', (req, res) => {
    console.log('📊 GET /api/proveedor/estadisticas');
    
    try {
        const productos = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
        const tiendas = JSON.parse(fs.readFileSync(STORES_FILE, 'utf8'));
        const solicitudes = JSON.parse(fs.readFileSync(REQUESTS_FILE, 'utf8'));
        
        const stats = {
            totalProductos: productos.length,
            totalTiendas: tiendas.length,
            totalSolicitudes: solicitudes.length,
            solicitudesPendientes: solicitudes.filter(s => s.estado === 'pendiente').length,
            solicitudesAceptadas: solicitudes.filter(s => s.estado === 'aceptada').length,
            solicitudesRechazadas: solicitudes.filter(s => s.estado === 'rechazada').length,
            stockTotal: productos.reduce((sum, p) => sum + (p.cantidad || 0), 0),
            productosBajoStock: productos.filter(p => p.cantidad < 5).length
        };
        
        res.json(stats);
    } catch (error) {
        console.error('❌ Error obteniendo estadísticas:', error);
        res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
});

// ========== RUTAS PARA TIENDAS ==========

// Login tienda
app.post('/api/tienda/login', (req, res) => {
    console.log('🔐 POST /api/tienda/login');
    
    const { username, password } = req.body;
    
    try {
        const stores = JSON.parse(fs.readFileSync(STORES_FILE, 'utf8'));
        const store = stores.find(s => s.username === username && s.activa);
        
        if (!store) {
            console.log(`❌ Tienda no encontrada: ${username}`);
            return res.status(401).json({ success: false, error: 'Tienda no encontrada' });
        }

        if (store.password !== password) {
            console.log(`❌ Contraseña incorrecta para: ${username}`);
            return res.status(401).json({ success: false, error: 'Contraseña incorrecta' });
        }

        console.log(`✅ Login exitoso tienda: ${store.storename}`);
        res.json({ 
            success: true, 
            store: {
                id: store.id,
                storename: store.storename,
                username: store.username
            }
        });
    } catch (error) {
        console.error('❌ Error en login tienda:', error);
        res.status(500).json({ success: false, error: 'Error en autenticación' });
    }
});

// Obtener productos para tiendas
app.get('/api/tienda/productos', (req, res) => {
    console.log('📦 GET /api/tienda/productos');
    
    try {
        const productos = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
        res.json(productos);
    } catch (error) {
        console.error('❌ Error leyendo productos para tienda:', error);
        res.status(500).json({ error: 'Error al leer productos' });
    }
});

// Crear solicitud de compra
app.post('/api/tienda/solicitudes', (req, res) => {
    console.log('🛒 POST /api/tienda/solicitudes');
    
    const { tiendaId, productos, total, comentarios } = req.body;
    
    try {
        const requests = JSON.parse(fs.readFileSync(REQUESTS_FILE, 'utf8'));
        const stores = JSON.parse(fs.readFileSync(STORES_FILE, 'utf8'));
        
        const tienda = stores.find(s => s.id === tiendaId);
        if (!tienda) {
            return res.status(404).json({ error: 'Tienda no encontrada' });
        }

        const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
        const productosNoDisponibles = [];
        
        for (const producto of productos) {
            const productId = parseInt(producto.id);
            const product = products.find(p => p.id === productId);
            
            if (!product) {
                productosNoDisponibles.push({
                    productoId: producto.id,
                    productoNombre: producto.nombre,
                    cantidadSolicitada: producto.cantidad,
                    cantidadDisponible: 0,
                    motivo: 'Producto no encontrado en sistema'
                });
            } else if (product.cantidad < producto.cantidad) {
                productosNoDisponibles.push({
                    productoId: producto.id,
                    productoNombre: producto.nombre,
                    cantidadSolicitada: producto.cantidad,
                    cantidadDisponible: product.cantidad,
                    motivo: 'Stock insuficiente'
                });
            }
        }
        
        if (productosNoDisponibles.length > 0) {
            return res.status(400).json({ 
                success: false, 
                error: 'Stock insuficiente',
                productosNoDisponibles 
            });
        }

        const nuevaSolicitud = {
            id: requests.length > 0 ? Math.max(...requests.map(r => r.id)) + 1 : 1,
            tiendaId,
            tiendaNombre: tienda.storename,
            productos: productos.map(p => ({
                id: parseInt(p.id),
                nombre: p.nombre,
                precio: p.precio,
                cantidad: p.cantidad,
                unidad: p.unidad,
                categoria: p.categoria
            })),
            total,
            comentarios: comentarios || '',
            fecha: new Date().toISOString(),
            estado: 'pendiente',
            fechaActualizacion: null
        };

        requests.push(nuevaSolicitud);
        fs.writeFileSync(REQUESTS_FILE, JSON.stringify(requests, null, 2));
        
        console.log(`✅ Solicitud creada: #${nuevaSolicitud.id} para ${tienda.storename}`);
        res.json({ 
            success: true, 
            solicitud: nuevaSolicitud,
            message: 'Solicitud enviada correctamente' 
        });
    } catch (error) {
        console.error('❌ Error creando solicitud:', error);
        res.status(500).json({ error: 'Error al crear solicitud: ' + error.message });
    }
});

// Obtener solicitudes de una tienda
app.get('/api/tienda/:id/solicitudes', (req, res) => {
    const tiendaId = parseInt(req.params.id);
    console.log(`📋 GET /api/tienda/${tiendaId}/solicitudes`);
    
    try {
        const requests = JSON.parse(fs.readFileSync(REQUESTS_FILE, 'utf8'));
        const tiendaSolicitudes = requests.filter(r => r.tiendaId === tiendaId);
        res.json(tiendaSolicitudes);
    } catch (error) {
        console.error('❌ Error leyendo solicitudes de tienda:', error);
        res.status(500).json({ error: 'Error al leer solicitudes' });
    }
});

// Obtener productos aprobados para una tienda
app.get('/api/tienda/:id/productos-aprobados', (req, res) => {
    const tiendaId = parseInt(req.params.id);
    console.log(`✅ GET /api/tienda/${tiendaId}/productos-aprobados`);
    
    try {
        const requests = JSON.parse(fs.readFileSync(REQUESTS_FILE, 'utf8'));
        const productosAprobados = [];
        
        const solicitudesAceptadas = requests.filter(r => 
            r.tiendaId === tiendaId && r.estado === 'aceptada'
        );
        
        solicitudesAceptadas.forEach(solicitud => {
            if (solicitud.productosAprobados) {
                solicitud.productosAprobados.forEach(producto => {
                    const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
                    const productoInfo = products.find(p => p.id === producto.productoId);
                    
                    if (productoInfo) {
                        productosAprobados.push({
                            ...productoInfo,
                            cantidadAprobada: producto.cantidadAprobada,
                            fechaAprobacion: solicitud.fechaActualizacion,
                            solicitudId: solicitud.id
                        });
                    }
                });
            }
        });
        
        res.json(productosAprobados);
    } catch (error) {
        console.error('❌ Error leyendo productos aprobados:', error);
        res.status(500).json({ error: 'Error al leer productos aprobados' });
    }
});

// Obtener registro de actividades
app.get('/api/tienda/:id/registro-actividades', (req, res) => {
    const tiendaId = parseInt(req.params.id);
    console.log(`📝 GET /api/tienda/${tiendaId}/registro-actividades`);
    
    try {
        const requests = JSON.parse(fs.readFileSync(REQUESTS_FILE, 'utf8'));
        const activities = [];
        
        const tiendaSolicitudes = requests.filter(r => r.tiendaId === tiendaId);
        
        tiendaSolicitudes.forEach(solicitud => {
            activities.push({
                tipo: 'solicitud',
                id: solicitud.id,
                fecha: solicitud.fecha,
                estado: solicitud.estado,
                detalles: `Solicitud #${solicitud.id} - ${solicitud.estado}`,
                productos: solicitud.productos,
                total: solicitud.total
            });
            
            if (solicitud.fechaActualizacion) {
                activities.push({
                    tipo: 'actualizacion',
                    id: solicitud.id,
                    fecha: solicitud.fechaActualizacion,
                    estado: solicitud.estado,
                    detalles: `Solicitud #${solicitud.id} ${solicitud.estado}`,
                    comentarios: solicitud.comentarios
                });
            }
        });
        
        activities.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        
        res.json(activities);
    } catch (error) {
        console.error('❌ Error leyendo registro de actividades:', error);
        res.status(500).json({ error: 'Error al leer registro de actividades' });
    }
});

// ========== MANEJO DE ERRORES ==========

// Ruta no encontrada (404)
app.use((req, res) => {
    console.log(`❌ RUTA NO ENCONTRADA: ${req.method} ${req.originalUrl}`);
    console.log(`   Origin: ${req.headers.origin}`);
    console.log(`   Headers:`, req.headers);
    
    res.status(404).json({
        success: false,
        error: 'Ruta no encontrada',
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString(),
        suggestion: 'Visita /api/routes para ver todas las rutas disponibles'
    });
});

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error('🔥 ERROR GLOBAL:', err);
    
    res.status(err.status || 500).json({
        success: false,
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined,
        timestamp: new Date().toISOString()
    });
});

// ========== INICIAR SERVIDOR ==========

app.listen(PORT, '0.0.0.0', () => {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 SERVIDOR INICIADO CORRECTAMENTE');
    console.log('='.repeat(60));
    console.log(`📡 Puerto: ${PORT}`);
    console.log(`🌐 Entorno: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🕐 Iniciado: ${new Date().toISOString()}`);
    console.log('\n📋 ENDPOINTS PRINCIPALES:');
    console.log('   POST   /api/proveedor/productos     - Crear producto');
    console.log('   GET    /api/proveedor/productos     - Listar productos');
    console.log('   PUT    /api/proveedor/productos/:id - Actualizar producto');
    console.log('   DELETE /api/proveedor/productos/:id - Eliminar producto');
    console.log('\n🔧 HERRAMIENTAS DE DEBUG:');
    console.log('   GET    /                            - Página de diagnóstico');
    console.log('   GET    /health                      - Health check');
    console.log('   GET    /api/debug/cors              - Debug CORS');
    console.log('   GET    /api/routes                  - Listar todas las rutas');
    console.log('\n✅ Servidor listo para recibir peticiones');
    console.log('='.repeat(60) + '\n');
});
