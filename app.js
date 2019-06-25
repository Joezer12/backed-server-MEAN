/* eslint-disable no-console */
// =====================================================================
// IMPORTS -- Aquí se importan las librerias mediante requires.
// =====================================================================
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

// ===================================================================================================
// IMPORTANDO RUTAS
// ===================================================================================================
var appRoutes = require('./routes/app.routes');
var hospRoutes = require('./routes/hospital');
var medicoRoutes = require('./routes/medico');
var usuarioRoutes = require('./routes/usuario.routes');
var loginRoutes = require('./routes/login');
var busquedaRoutes = require('./routes/busqueda');
var uploadRoutes = require('./routes/upload');
var imgRoutes = require('./routes/imagenes');

// ===================================================================================================
// INICIALIZACION VARIABLES -- Una vez importadas para poder usarlas se necesita asignarlas a una variable.
// ===================================================================================================
var app = express();
// Body-parser
// Liga: https://github.com/expressjs/body-parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// ===================================================================================================
// CONEXIÓN A LA BASE DE DATOS
// ===================================================================================================
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', err => {
  if (err) throw err;

  console.log('MongoDb/hospitalDB en puerto 27017: \x1b[32m%s\x1b[0m', 'online');
});

// ===================================================================================================
// SERVER INDEX CONFIG -- Esta configuración permite accesar a un carpeta y sus subcarpetas del servidor
// desde la la aplicación (para este caso este servicio REST @localhost:3000/uploads),
// ===================================================================================================
// var serveIndex = require('serve-index');
// app.use(express.static(__dirname + '/'));
// app.use('/uploads', serveIndex(__dirname + '/uploads'));

// ===================================================================================================
// RUTAS
// ===================================================================================================
app.use('/login', loginRoutes);
app.use('/usuario', usuarioRoutes);
app.use('/hospital', hospRoutes);
app.use('/medico', medicoRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/upload', uploadRoutes);
app.use('/img', imgRoutes);

app.use('/', appRoutes); // Esto es un middle Ware

// ===================================================================================================
// CORRIENDO EL SERVICIO -- Con Listen se le indica a la app que escuche cualquier petición en la ruta
// localhost:3000
// ===================================================================================================
// Escuchar peticiones
app.listen(3000, () => {
  console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m', 'online');
});
