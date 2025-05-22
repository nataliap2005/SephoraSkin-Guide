const express = require('express');
const favoritosController = require('./controllers/favoritosController.js');
const morgan = require('morgan');
const app = express();
app.use(morgan('dev'));
app.use(express.json());
app.use(favoritosController);

app.listen(3002, () => {
    console.log('backProductos ejecutandose en el puerto 3003');
}); 