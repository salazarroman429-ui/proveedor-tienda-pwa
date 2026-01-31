const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración ESPECÍFICA para Render + GitHub Pages
const allowedOrigins = [
    'https://salazarroman429-ui.github.io',  // GitHub Pages
    'http://localhost:3000',                 // Desarrollo local
    'http://localhost:8080',                 // Live Server común
    'http://127.0.0.1:3000',                // Localhost alternativo
    'http://127.0.0.1:8080',
    'http://192.168.1.*:*',                 // Red local
    'https://*.onrender.com'                // Render domains
];

// Middleware CORS personalizado
app.use((req, res, next) => {
    const origin = req.headers.origin;
    
    // Permitir todos los orígenes en desarrollo
    if (process.env.NODE_ENV !== 'production') {
        res.setHeader('Access-Control-Allow-Origin', '*');
    } 
    // En producción, verificar orígenes permitidos
    else if (origin && allowedOrigins.some(allowed => {
        if (allowed.includes('*')) {
            const regex = new RegExp(allowed.replace('*', '.*'));
            return regex.test(origin);
        }
        return origin === allowed;
    })) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    // Manejar preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    next();
});

// También usar el middleware cors como respaldo
app.use(cors({
    origin: function (origin, callback) {
        // Permitir requests sin origen (como apps móviles o curl)
        if (!origin) return callback(null, true);
        
        if (process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }
        
        if (allowedOrigins.some(allowed => {
            if (allowed.includes('*')) {
                const regex = new RegExp(allowed.replace('*', '.*'));
                return regex.test(origin);
            }
            return origin === allowed;
        })) {
            return callback(null, true);
        }
        
        console.warn(`⚠️ Origen bloqueado: ${origin}`);
        return callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
    optionsSuccessStatus: 200
}));

app.use(express.json({ limit: '10mb' }));

// Middleware de logging mejorado
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    const origin = req.headers.origin || 'Sin origen';
    const userAgent = req.headers['user-agent'] || 'Sin user-agent';
    
    console.log(`\n📥 ${timestamp} ${req.method} ${req.url}`);
    console.log(`   Origen: ${origin}`);
    console.log(`   User-Agent: ${userAgent.substring(0, 50)}...`);
    console.log(`   Content-Type: ${req.headers['content-type'] || 'No especificado'}`);
    
    next();
});

// Archivos de datos
const DATA_DIR = __dirname;
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const STORES_FILE = path.join(DATA_DIR, 'stores.json');
const REQUESTS_FILE = path.join(DATA_DIR, 'requests.json');

// Credenciales del proveedor
const PROVEEDOR_CREDENTIALS = {
    username: "Admin429",
    password: "adm429"
};

// Datos iniciales
function initializeFiles() {
    try {
        if (!fs.existsSync(PRODUCTS_FILE)) {
            fs.writeFileSync(PRODUCTS_FILE, JSON.stringify([
                {
                    id: 1,
                    nombre: "Mermelada de Fresa",
                    descripcion: "Mermelada artesanal 250g",
                    precio: 3.99,
                    cantidad: 100,
                    categoria: "confituras",
                    unidad: "frasco",
                    fecha: new Date().toISOString()
                }
            ], null, 2));
        }

        if (!fs.existsSync(STORES_FILE)) {
            fs.writeFileSync(STORES_FILE, JSON.stringify([
                {
                    id: 1,
                    storename: "Tienda Demo",
                    username: "tienda1",
                    password: "tienda123",
                    fechaCreacion: new Date().toISOString(),
                    activa: true
                }
            ], null, 2));
        }

        if (!fs.existsSync(REQUESTS_FILE)) {
            fs.writeFileSync(REQUESTS_FILE, JSON.stringify([], null, 2));
        }
        
        console.log('✅ Archivos JSON inicializados correctamente');
    } catch (error) {
        console.error('❌ Error inicializando archivos:', error);
    }
}

initializeFiles();

// ========== RUTAS DE PRUEBA PARA GITHUB PAGES ==========

// Ruta de prueba simple (texto plano)
app.get('/ping', (req, res) => {
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send('pong');
});

// Ruta de prueba JSON
app.get('/api/test-cors', (req, res) => {
    res.json({
        success: true,
        message: 'CORS funcionando correctamente',
        origin: req.headers.origin,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Ruta para verificar configuraciones
app.get('/api/debug', (req, res) => {
    const debugInfo = {
        serverTime: new Date().toISOString(),
        nodeEnv: process.env.NODE_ENV,
        port: PORT,
        allowedOrigins: allowedOrigins,
        requestOrigin: req.headers.origin,
        requestHeaders: req.headers,
        files: {
            products: fs.existsSync(PRODUCTS_FILE),
            stores: fs.existsSync(STORES_FILE),
            requests: fs.existsSync(REQUESTS_FILE)
        }
    };
    
    console.log('🔍 Debug info:', debugInfo);
    res.json(debugInfo);
});

// ========== PÁGINA PRINCIPAL ==========

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>🚀 API Proveedor-Tienda PWA (Render + GitHub Pages)</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
                h1 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
                .success { color: #28a745; font-weight: bold; }
                .warning { color: #ffc107; font-weight: bold; }
                .endpoint { 
                    background: #f8f9fa; 
                    padding: 15px; 
                    margin: 15px 0; 
                    border-left: 4px solid #007bff;
                    border-radius: 5px;
                }
                code { background: #e9ecef; padding: 2px 5px; border-radius: 3px; }
                .test-btn { 
                    background: #007bff; 
                    color: white; 
                    border: none; 
                    padding: 10px 15px; 
                    border-radius: 5px; 
                    cursor: pointer; 
                    margin: 5px;
                }
                .test-btn:hover { background: #0056b3; }
                #test-results { margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 5px; }
            </style>
        </head>
        <body>
            <h1>🚀 API Proveedor-Tienda PWA</h1>
            <p class="success"><strong>Estado:</strong> ✅ Funcionando en Render</p>
            <p><strong>Configurado para:</strong> GitHub Pages + Render</p>
            <p><strong>Puerto:</strong> ${PORT}</p>
            <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
            
            <h2>🌐 Configuración CORS:</h2>
            <ul>
                <li>GitHub Pages: <code>https://salazarroman429-ui.github.io</code></li>
                <li>Desarrollo local permitido</li>
                <li>Render domains permitidos</li>
            </ul>
            
            <h2>🛠 Endpoints de prueba:</h2>
            <div class="endpoint">
                <strong>GET <code>/ping</code></strong><br>
                <em>Prueba básica de conexión (texto plano)</em><br>
                <button class="test-btn" onclick="testEndpoint('/ping', 'text')">Probar</button>
            </div>
            
            <div class="endpoint">
                <strong>GET <code>/api/test-cors</code></strong><br>
                <em>Prueba de CORS con JSON</em><br>
                <button class="test-btn" onclick="testEndpoint('/api/test-cors', 'json')">Probar</button>
            </div>
            
            <div class="endpoint">
                <strong>GET <code>/api/debug</code></strong><br>
                <em>Información de debug del servidor</em><br>
                <button class="test-btn" onclick="testEndpoint('/api/debug', 'json')">Probar</button>
            </div>
            
            <div class="endpoint">
                <strong>GET <code>/api/status</code></strong><br>
                <em>Estado del sistema</em><br>
                <button class="test-btn" onclick="testEndpoint('/api/status', 'json')">Probar</button>
            </div>
            
            <div id="test-results"></div>
            
            <h2>🔧 Prueba desde GitHub Pages:</h2>
            <button class="test-btn" onclick="testFromGitHubPages()">Probar desde GitHub Pages</button>
            
            <script>
                async function testEndpoint(url, type) {
                    const results = document.getElementById('test-results');
                    results.innerHTML = '<p>Probando... ⏳</p>';
                    
                    try {
                        const response = await fetch(url);
                        const data = type === 'json' ? await response.json() : await response.text();
                        
                        results.innerHTML = \`
                            <p class="success">✅ Conexión exitosa a \${url}</p>
                            <p><strong>Status:</strong> \${response.status} \${response.statusText}</p>
                            <p><strong>Headers:</strong></p>
                            <pre>\${JSON.stringify([...response.headers], null, 2)}</pre>
                            <p><strong>Respuesta (\${type}):</strong></p>
                            <pre>\${typeof data === 'string' ? data : JSON.stringify(data, null, 2)}</pre>
                        \`;
                    } catch (error) {
                        results.innerHTML = \`
                            <p class="warning">❌ Error conectando a \${url}</p>
                            <p><strong>Error:</strong> \${error.message}</p>
                            <p><strong>Stack:</strong> \${error.stack}</p>
                        \`;
                    }
                }
                
                async function testFromGitHubPages() {
                    const results = document.getElementById('test-results');
                    results.innerHTML = '<p>Simulando petición desde GitHub Pages... ⏳</p>';
                    
                    // Simular petición como si viniera de GitHub Pages
                    try {
                        const response = await fetch('/api/test-cors', {
                            headers: {
                                'Origin': 'https://salazarroman429-ui.github.io'
                            }
                        });
                        
                        const data = await response.json();
                        
                        results.innerHTML = \`
                            <p class="success">✅ Simulación GitHub Pages exitosa</p>
                            <p><strong>Origen simulado:</strong> https://salazarroman429-ui.github.io</p>
                            <p><strong>Respuesta del servidor:</strong></p>
                            <pre>\${JSON.stringify(data, null, 2)}</pre>
                            <p><strong>Nota:</strong> Si esto funciona, tu frontend en GitHub Pages debería poder conectarse.</p>
                        \`;
                    } catch (error) {
                        results.innerHTML = \`
                            <p class="warning">❌ Error en simulación</p>
                            <p><strong>Error:</strong> \${error.message}</p>
                            <p>Esto indica que hay un problema de CORS.</p>
                        \`;
                    }
                }
            </script>
        </body>
        </html>
    `);
});

// ========== RUTAS DEL PROVEEDOR ==========

// Login proveedor
app.post('/api/proveedor/login', (req, res) => {
    console.log('🔐 Login proveedor desde:', req.headers.origin);
    
    try {
        const { username, password } = req.body;
        
        if (username === PROVEEDOR_CREDENTIALS.username && 
            password === PROVEEDOR_CREDENTIALS.password) {
            res.json({ 
                success: true, 
                message: 'Login exitoso',
                timestamp: new Date().toISOString()
            });
        } else {
            res.status(401).json({ 
                success: false, 
                error: 'Credenciales incorrectas' 
            });
        }
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error del servidor' 
        });
    }
});

// Obtener productos
app.get('/api/proveedor/productos', (req, res) => {
    try {
        const data = fs.readFileSync(PRODUCTS_FILE, 'utf8');
        const productos = JSON.parse(data);
        res.json(productos);
    } catch (error) {
        console.error('Error leyendo productos:', error);
        res.status(500).json({ error: 'Error al leer productos' });
    }
});

// Crear producto (CORREGIDO para CORS)
app.post('/api/proveedor/productos', (req, res) => {
    console.log('➕ Creando producto desde:', req.headers.origin);
    console.log('Datos recibidos:', req.body);
    
    try {
        const productos = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
        
        const nuevoProducto = {
            id: productos.length > 0 ? Math.max(...productos.map(p => p.id)) + 1 : 1,
            ...req.body,
            fecha: new Date().toISOString()
        };
        
        productos.push(nuevoProducto);
        fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(productos, null, 2));
        
        console.log('✅ Producto creado:', nuevoProducto.id);
        
        res.json({ 
            success: true, 
            producto: nuevoProducto,
            message: 'Producto creado exitosamente'
        });
    } catch (error) {
        console.error('❌ Error creando producto:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error al guardar producto',
            details: error.message 
        });
    }
});

// Actualizar producto
app.put('/api/proveedor/productos/:id', (req, res) => {
    try {
        const productos = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
        const productoId = parseInt(req.params.id);
        
        const index = productos.findIndex(p => p.id === productoId);
        if (index !== -1) {
            productos[index] = { ...productos[index], ...req.body };
            fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(productos, null, 2));
            res.json({ success: true, producto: productos[index] });
        } else {
            res.status(404).json({ error: 'Producto no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar producto' });
    }
});

// Eliminar producto
app.delete('/api/proveedor/productos/:id', (req, res) => {
    try {
        let productos = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
        const productoId = parseInt(req.params.id);
        
        const index = productos.findIndex(p => p.id === productoId);
        if (index !== -1) {
            const productoEliminado = productos[index];
            productos = productos.filter(p => p.id !== productoId);
            fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(productos, null, 2));
            res.json({ success: true, producto: productoEliminado });
        } else {
            res.status(404).json({ error: 'Producto no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar producto' });
    }
});

// Obtener todas las tiendas
app.get('/api/proveedor/tiendas', (req, res) => {
    try {
        const stores = JSON.parse(fs.readFileSync(STORES_FILE, 'utf8'));
        res.json(stores);
    } catch (error) {
        res.status(500).json({ error: 'Error al leer tiendas' });
    }
});

// Crear tienda
app.post('/api/proveedor/tiendas', (req, res) => {
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
        
        res.json({ success: true, tienda: nuevaTienda });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear tienda' });
    }
});

// Eliminar tienda
app.delete('/api/proveedor/tiendas/:id', (req, res) => {
    try {
        const stores = JSON.parse(fs.readFileSync(STORES_FILE, 'utf8'));
        const tiendaId = parseInt(req.params.id);
        
        const index = stores.findIndex(s => s.id === tiendaId);
        if (index !== -1) {
            const tiendaEliminada = stores[index];
            stores.splice(index, 1);
            fs.writeFileSync(STORES_FILE, JSON.stringify(stores, null, 2));
            res.json({ success: true, tienda: tiendaEliminada });
        } else {
            res.status(404).json({ error: 'Tienda no encontrada' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar tienda' });
    }
});

// Obtener todas las solicitudes
app.get('/api/proveedor/solicitudes', (req, res) => {
    try {
        const requests = JSON.parse(fs.readFileSync(REQUESTS_FILE, 'utf8'));
        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: 'Error al leer solicitudes' });
    }
});

// Actualizar estado de solicitud
app.put('/api/proveedor/solicitudes/:id', (req, res) => {
    try {
        const { estado, comentarios, productosAprobados } = req.body;
        const solicitudId = parseInt(req.params.id);
        
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
        
        res.json({ 
            success: true, 
            solicitud: requests[requestIndex],
            message: `Solicitud ${estado} correctamente`
        });
    } catch (error) {
        console.error('Error al actualizar solicitud:', error);
        res.status(500).json({ error: 'Error al actualizar solicitud' });
    }
});

// Obtener estadísticas
app.get('/api/proveedor/estadisticas', (req, res) => {
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
        res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
});

// ========== RUTAS PARA TIENDAS ==========

// Login tienda
app.post('/api/tienda/login', (req, res) => {
    const { username, password } = req.body;
    
    try {
        const stores = JSON.parse(fs.readFileSync(STORES_FILE, 'utf8'));
        const store = stores.find(s => s.username === username && s.activa);
        
        if (!store) {
            return res.status(401).json({ success: false, error: 'Tienda no encontrada' });
        }

        if (store.password !== password) {
            return res.status(401).json({ success: false, error: 'Contraseña incorrecta' });
        }

        res.json({ 
            success: true, 
            store: {
                id: store.id,
                storename: store.storename,
                username: store.username
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error en autenticación' });
    }
});

// Obtener productos para tiendas
app.get('/api/tienda/productos', (req, res) => {
    const { username, password } = req.headers;
    
    try {
        const stores = JSON.parse(fs.readFileSync(STORES_FILE, 'utf8'));
        const store = stores.find(s => s.username === username && s.activa);
        
        if (!store || store.password !== password) {
            return res.status(401).json({ error: 'No autorizado' });
        }
        
        const productos = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
        res.json(productos);
    } catch (error) {
        res.status(500).json({ error: 'Error al leer productos' });
    }
});

// Crear solicitud de compra
app.post('/api/tienda/solicitudes', (req, res) => {
    const { tiendaId, productos, total, comentarios } = req.body;
    
    console.log('📦 Nueva solicitud desde tienda:', { tiendaId, total, productos });
    
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
        
        res.json({ 
            success: true, 
            solicitud: nuevaSolicitud,
            message: 'Solicitud enviada correctamente' 
        });
    } catch (error) {
        console.error('Error al crear solicitud:', error);
        res.status(500).json({ error: 'Error al crear solicitud: ' + error.message });
    }
});

// Obtener solicitudes de una tienda
app.get('/api/tienda/:id/solicitudes', (req, res) => {
    const tiendaId = parseInt(req.params.id);
    
    try {
        const requests = JSON.parse(fs.readFileSync(REQUESTS_FILE, 'utf8'));
        const tiendaSolicitudes = requests.filter(r => r.tiendaId === tiendaId);
        res.json(tiendaSolicitudes);
    } catch (error) {
        res.status(500).json({ error: 'Error al leer solicitudes' });
    }
});

// Obtener productos aprobados para una tienda
app.get('/api/tienda/:id/productos-aprobados', (req, res) => {
    const tiendaId = parseInt(req.params.id);
    
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
        res.status(500).json({ error: 'Error al leer productos aprobados' });
    }
});

// Obtener registro de actividades
app.get('/api/tienda/:id/registro-actividades', (req, res) => {
    const tiendaId = parseInt(req.params.id);
    
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
        res.status(500).json({ error: 'Error al leer registro de actividades' });
    }
});

// ========== MANEJO DE ERRORES ==========

// Ruta no encontrada
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Ruta no encontrada',
        path: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
    });
});

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error('🔥 Error global:', err);
    
    res.status(err.status || 500).json({
        success: false,
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined,
        timestamp: new Date().toISOString()
    });
});

// ========== INICIAR SERVIDOR ==========

app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 ============================================`);
    console.log(`🚀 Servidor API corriendo en puerto ${PORT}`);
    console.log(`🚀 Configurado para GitHub Pages + Render`);
    console.log(`🚀 ============================================`);
    console.log(`🔗 URL: http://localhost:${PORT}`);
    console.log(`🔗 GitHub Pages: https://salazarroman429-ui.github.io`);
    console.log(`\n📋 Endpoints de prueba:`);
    console.log(`   • GET  /ping           - Prueba básica`);
    console.log(`   • GET  /api/test-cors  - Prueba CORS`);
    console.log(`   • GET  /api/debug      - Info de debug`);
    console.log(`\n🔑 Credenciales:`);
    console.log(`   • Proveedor: Admin429 / adm429`);
    console.log(`   • Tienda demo: tienda1 / tienda123`);
    console.log(`\n⚠️  Logs detallados activados`);
});
