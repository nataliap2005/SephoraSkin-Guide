const express = require('express');
const morgan = require('morgan');
const app = express();
const productRoutes = require('./controllers/productosController');

app.use(morgan('dev')); // Registra las peticiones en formato "dev"
app.use(express.json());
app.use('/productos', productRoutes); // Todas las rutas estarán bajo /productos

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
