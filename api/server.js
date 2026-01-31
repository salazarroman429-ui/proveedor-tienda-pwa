const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Permitir acceso desde GitHub Pages
app.use(cors({
    origin: '*',
    credentials: true
}));

app.use(express.json());

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
    // Archivo de productos
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

    // Archivo de tiendas
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

    // Archivo de solicitudes
    if (!fs.existsSync(REQUESTS_FILE)) {
        fs.writeFileSync(REQUESTS_FILE, JSON.stringify([], null, 2));
    }
}

initializeFiles();

// Middleware para servir PWAs
app.use('/proveedor', express.static(path.join(__dirname, '../proveedor-pwa')));
app.use('/tienda', express.static(path.join(__dirname, '../tienda-pwa')));

// ========== RUTAS ==========

// Página principal
app.get('/', (req, res) => {
    res.send(`
        <h1>🚀 API Proveedor-Tienda PWA</h1>
        <p><strong>Estado:</strong> ✅ Funcionando</p>
        <p><strong>URL API:</strong> https://tu-api.onrender.com/api</p>
        <p><strong>Proveedor PWA:</strong> https://salazarroman429-ui.github.io/proveedor-tienda-pwa/proveedor/</p>
        <p><strong>Tienda PWA:</strong> https://salazarroman429-ui.github.io/proveedor-tienda-pwa/tienda/</p>
        <hr>
        <h2>Acceso local:</h2>
        <p><a href="/proveedor">Aplicación Proveedor</a> (Usuario: Admin429, Contraseña: adm429)</p>
        <p><a href="/tienda">Aplicación Tienda</a> (Usuario: tienda1, Contraseña: tienda123)</p>
        <hr>
        <h3>Endpoints disponibles:</h3>
        <p><a href="/api/status">/api/status</a> - Ver estado</p>
        <p><a href="/api/proveedor/productos">/api/proveedor/productos</a> - Ver productos</p>
        <p><a href="/api/proveedor/estadisticas">/api/proveedor/estadisticas</a> - Ver estadísticas</p>
    `);
});

// ========== RUTAS GENERALES ==========

// Estado
app.get('/api/status', (req, res) => {
    res.json({
        success: true,
        status: 'online',
        message: 'API funcionando correctamente',
        timestamp: new Date().toISOString(),
        port: PORT,
        version: '2.0.0'
    });
});

// ========== RUTAS DEL PROVEEDOR ==========

// Login proveedor
app.post('/api/proveedor/login', (req, res) => {
    const { username, password } = req.body;
    
    if (username === PROVEEDOR_CREDENTIALS.username && 
        password === PROVEEDOR_CREDENTIALS.password) {
        res.json({ success: true, message: 'Login exitoso' });
    } else {
        res.status(401).json({ success: false, error: 'Credenciales incorrectas' });
    }
});

// Obtener productos
app.get('/api/proveedor/productos', (req, res) => {
    try {
        const data = fs.readFileSync(PRODUCTS_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        res.status(500).json({ error: 'Error al leer productos' });
    }
});

// Agregar producto
app.post('/api/proveedor/productos', (req, res) => {
    try {
        const data = fs.readFileSync(PRODUCTS_FILE, 'utf8');
        const productos = JSON.parse(data);
        
        const nuevoProducto = {
            id: productos.length > 0 ? Math.max(...productos.map(p => p.id)) + 1 : 1,
            ...req.body,
            fecha: new Date().toISOString()
        };
        
        productos.push(nuevoProducto);
        fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(productos, null, 2));
        
        res.json({ success: true, producto: nuevoProducto });
    } catch (error) {
        res.status(500).json({ error: 'Error al guardar producto' });
    }
});

// Actualizar producto
app.put('/api/proveedor/productos/:id', (req, res) => {
    try {
        const data = fs.readFileSync(PRODUCTS_FILE, 'utf8');
        const productos = JSON.parse(data);
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
        const data = fs.readFileSync(PRODUCTS_FILE, 'utf8');
        let productos = JSON.parse(data);
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

// Obtener todas las tiendas (gestión por proveedor)
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
        
        // Verificar si el usuario ya existe
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
        
        // Leer archivos
        const requests = JSON.parse(fs.readFileSync(REQUESTS_FILE, 'utf8'));
        const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
        
        const requestIndex = requests.findIndex(r => r.id === solicitudId);
        if (requestIndex === -1) {
            return res.status(404).json({ error: 'Solicitud no encontrada' });
        }
        
        // Actualizar solicitud
        requests[requestIndex].estado = estado;
        requests[requestIndex].comentarios = comentarios || '';
        requests[requestIndex].fechaActualizacion = new Date().toISOString();
        
        // Si se acepta la solicitud, actualizar inventario
        if (estado === 'aceptada' && productosAprobados) {
            let stockSuficiente = true;
            const productosNoDisponibles = [];
            
            // Verificar stock
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
            
            // Actualizar stock
            for (const productoAprobado of productosAprobados) {
                const productoIndex = products.findIndex(p => p.id === productoAprobado.productoId);
                if (productoIndex !== -1) {
                    products[productoIndex].cantidad -= productoAprobado.cantidadAprobada;
                    // Registrar movimiento
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
            
            // Guardar cantidad aprobada total
            requests[requestIndex].cantidadAprobada = productosAprobados
                .reduce((sum, p) => sum + p.cantidadAprobada, 0);
            requests[requestIndex].productosAprobados = productosAprobados;
            
            // Guardar cambios en productos
            fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
        }
        
        // Guardar cambios en solicitudes
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

// Obtener productos para tiendas (con autenticación)
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
    
    console.log('📦 Nueva solicitud recibida:', { tiendaId, total, productos });
    
    try {
        const requests = JSON.parse(fs.readFileSync(REQUESTS_FILE, 'utf8'));
        const stores = JSON.parse(fs.readFileSync(STORES_FILE, 'utf8'));
        
        const tienda = stores.find(s => s.id === tiendaId);
        if (!tienda) {
            return res.status(404).json({ error: 'Tienda no encontrada' });
        }

        // Validar stock disponible
        const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
        const productosNoDisponibles = [];
        
        console.log('🔍 Verificando stock...');
        console.log('Productos en sistema:', products.length);
        console.log('Productos solicitados:', productos);
        
        for (const producto of productos) {
            // Convertir a número para comparar
            const productId = parseInt(producto.id);
            const product = products.find(p => p.id === productId);
            
            console.log(`Producto ID ${producto.id} (convertido: ${productId}):`, 
                product ? `Encontrado (stock: ${product.cantidad})` : 'No encontrado');
            
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
            console.log('❌ Productos no disponibles:', productosNoDisponibles);
            return res.status(400).json({ 
                success: false, 
                error: 'Stock insuficiente',
                productosNoDisponibles 
            });
        }

        console.log('✅ Stock verificado correctamente');

        const nuevaSolicitud = {
            id: requests.length > 0 ? Math.max(...requests.map(r => r.id)) + 1 : 1,
            tiendaId,
            tiendaNombre: tienda.storename,
            productos: productos.map(p => ({
                id: parseInt(p.id), // Guardar como número
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
        
        console.log('✅ Solicitud creada exitosamente:', nuevaSolicitud.id);
        
        res.json({ 
            success: true, 
            solicitud: nuevaSolicitud,
            message: 'Solicitud enviada correctamente' 
        });
    } catch (error) {
        console.error('❌ Error al crear solicitud:', error);
        res.status(500).json({ error: 'Error al crear solicitud: ' + error.message });
    }
});

// Obtener solicitudes de una tienda específica
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
        
        // Filtrar solicitudes aceptadas de esta tienda
        const solicitudesAceptadas = requests.filter(r => 
            r.tiendaId === tiendaId && r.estado === 'aceptada'
        );
        
        // Extraer productos aprobados
        solicitudesAceptadas.forEach(solicitud => {
            if (solicitud.productosAprobados) {
                solicitud.productosAprobados.forEach(producto => {
                    // Buscar información completa del producto
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

// Obtener registro de actividades de una tienda
app.get('/api/tienda/:id/registro-actividades', (req, res) => {
    const tiendaId = parseInt(req.params.id);
    
    try {
        const requests = JSON.parse(fs.readFileSync(REQUESTS_FILE, 'utf8'));
        const activities = [];
        
        // Filtrar todas las solicitudes de esta tienda
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
            
            // Si fue actualizada, agregar actividad de actualización
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
        
        // Ordenar por fecha (más recientes primero)
        activities.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        
        res.json(activities);
    } catch (error) {
        res.status(500).json({ error: 'Error al leer registro de actividades' });
    }
});

// ========== INICIAR SERVIDOR ==========

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor API corriendo en puerto ${PORT}`);
    console.log(`🔗 http://localhost:${PORT}`);
    console.log(`📦 Proveedor: http://localhost:${PORT}/proveedor`);
    console.log(`🏪 Tienda: http://localhost:${PORT}/tienda`);
    console.log(`\n🔑 Credenciales por defecto:`);
    console.log(`   Proveedor - Usuario: Admin429, Contraseña: adm429`);
    console.log(`   Tienda Demo - Usuario: tienda1, Contraseña: tienda123`);
});
