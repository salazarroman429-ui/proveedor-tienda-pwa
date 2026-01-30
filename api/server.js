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

// Datos iniciales
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

// ========== RUTAS ==========

// Página principal
app.get('/', (req, res) => {
    res.send(`
        <h1>🚀 API Proveedor-Tienda PWA</h1>
        <p><strong>Estado:</strong> ✅ Funcionando</p>
        <p><strong>URL API:</strong> https://tu-api.onrender.com/api</p>
        <p><strong>Proveedor PWA:</strong> https://TUNOMBRE.github.io/proveedor-tienda-pwa/proveedor/</p>
        <p><strong>Tienda PWA:</strong> https://TUNOMBRE.github.io/proveedor-tienda-pwa/tienda/</p>
        <hr>
        <p><a href="/api/status">/api/status</a> - Ver estado</p>
        <p><a href="/api/proveedor/productos">/api/proveedor/productos</a> - Ver productos</p>
    `);
});

// Estado
app.get('/api/status', (req, res) => {
    res.json({
        success: true,
        status: 'online',
        message: 'API funcionando correctamente',
        timestamp: new Date().toISOString(),
        port: PORT
    });
});

// Login proveedor
app.post('/api/proveedor/login', (req, res) => {
    const { username, password } = req.body;
    
    if (username === "Admin429" && password === "adm429") {
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

// Login tienda
app.post('/api/tienda/login', (req, res) => {
    const { username, password } = req.body;
    
    try {
        const stores = JSON.parse(fs.readFileSync(STORES_FILE, 'utf8'));
        const store = stores.find(s => s.username === username && s.activa);
        
        if (!store || store.password !== password) {
            return res.status(401).json({ success: false, error: 'Credenciales incorrectas' });
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
        res.status(500).json({ success: false, error: 'Error en login' });
    }
});

// Crear solicitud
app.post('/api/tienda/solicitudes', (req, res) => {
    try {
        const { tiendaId, productos, total, comentarios } = req.body;
        
        // Leer datos
        const stores = JSON.parse(fs.readFileSync(STORES_FILE, 'utf8'));
        const requests = JSON.parse(fs.readFileSync(REQUESTS_FILE, 'utf8'));
        
        // Verificar tienda
        const tienda = stores.find(s => s.id === tiendaId);
        if (!tienda) {
            return res.status(404).json({ error: 'Tienda no encontrada' });
        }
        
        // Crear solicitud
        const nuevaSolicitud = {
            id: requests.length + 1,
            tiendaId,
            tiendaNombre: tienda.storename,
            productos: productos,
            total,
            comentarios: comentarios || '',
            fecha: new Date().toISOString(),
            estado: 'pendiente'
        };
        
        // Guardar
        requests.push(nuevaSolicitud);
        fs.writeFileSync(REQUESTS_FILE, JSON.stringify(requests, null, 2));
        
        res.json({ 
            success: true, 
            solicitud: nuevaSolicitud,
            message: 'Solicitud enviada correctamente' 
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear solicitud' });
    }
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor API corriendo en puerto ${PORT}`);
    console.log(`🔗 http://localhost:${PORT}`);
});
