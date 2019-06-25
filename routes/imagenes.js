// ===================================================================================================
// IMPORTS
// ===================================================================================================
const express = require('express');
const fs = require('fs');
const path = require('path');

// ===================================================================================================
// INICIALIZACIONES
// ===================================================================================================
const app = express();

// ===================================================================================================
// METODOS -- GET
// ===================================================================================================
app.get('/:tipo?/:img?', (req, res) => {
  var tipo = req.params.tipo;
  var img = req.params.img;
  var coleccionesValidas = ['medico', 'usuario', 'hospital'];

  //   var path = `./uploads/${tipo}/`;

  if (!tipo || !img) {
    res.status('400').json({
      ok: false,
      mensaje: 'Se requiere la colección y la imagen a recuperar',
      error: 'Colección o imagen no proporcionada'
    });
  }

  if (coleccionesValidas.indexOf(tipo) < 0) {
    res.status('400').json({
      ok: false,
      mensaje: 'Las colecciones validas son: ' + coleccionesValidas.join(', '),
      error: 'Colección no valida'
    });
  }

  var pathImagen = path.resolve(__dirname, `../uploads/${tipo}/${img}`);

  if (!fs.existsSync(pathImagen)) {
    pathImagen = path.resolve(__dirname, `../assets/no-img.jpg`);
  }

  res.sendFile(pathImagen);
});

// ===================================================================================================
// EXPORT
// ===================================================================================================
module.exports = app;
