// Requires, aquí se importan las librerias mediante requires.
var express = require('express');
var mongoose = require('mongoose');

// Inicialización de variables, una vez importadas para poder usarlas se necesita
// asignarlas a una variable.
var app = express();

// Conexión a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
  if (err) throw err;

  console.log('MongoDb/hospitalDB en puerto 27017: \x1b[32m%s\x1b[0m', 'online');
});

// Rutas
app.get('/', (req, res, next) => {
  res.status(200).json({
    ok: true,
    mensaje: 'Peticion realizada correctamente'
  });
});

// Escuchar peticiones
app.listen(3000, () => {
  console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m', 'online');
});
