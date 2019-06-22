/* eslint-disable no-console */
// =====================================================================
// REQUIRES, aquí se importan las librerias mediante requires.
// =====================================================================
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

// Importando rutas
var appRoutes = require('./routes/app.routes');
var usuarioRoutes = require('./routes/usuario.routes');
var loginRoutes = require('./routes/login');

// Inicialización de variables, una vez importadas para poder usarlas se necesita
// asignarlas a una variable.
var app = express();

// Body-parser
// Liga: https://github.com/expressjs/body-parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Conexión a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', err => {
  if (err) throw err;

  console.log('MongoDb/hospitalDB en puerto 27017: \x1b[32m%s\x1b[0m', 'online');
});

// Rutas
app.use('/login', loginRoutes);
app.use('/usuario', usuarioRoutes);
app.use('/', appRoutes); // Esto es un middle Ware

// Escuchar peticiones
app.listen(3000, () => {
  console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m', 'online');
});
