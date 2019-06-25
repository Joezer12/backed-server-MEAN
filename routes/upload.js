// ===================================================================================================
// IMPORTS
// ===================================================================================================
var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');
var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');
// ===================================================================================================
// INICIALIZACIONES
// ===================================================================================================
var app = express();
app.use(fileUpload());
// ===================================================================================================
// METODOS -- GET
// ===================================================================================================
app.put('/:coleccion/:id', (req, res) => {
  var tipo = req.params.coleccion;
  var id = req.params.id;
  var tiposValidos = ['medico', 'hospital', 'usuario'];

  if (tiposValidos.indexOf(tipo) < 0) {
    return res.status(400).json({
      ok: false,
      mensaje: 'Las colecciones válidas solo son: ' + tiposValidos.join(', '),
      error: { mensaje: 'Colección no válida' }
    });
  }

  if (!req.files) {
    return res.status(400).json({
      ok: false,
      mensaje: 'Se requiere que se suba una imagen',
      error: { mensaje: 'Se requiere subir una imagen' }
    });
  }

  // Obteniendo nombre del archivo
  var imagen = req.files.imagen;
  var nombreCortado = String(imagen.name).split('.');
  var ext = nombreCortado[nombreCortado.length - 1];
  var extPermitidas = ['jpg', 'jpeg', 'bmp', 'png', 'gif'];

  if (extPermitidas.indexOf(ext) < 0) {
    return res.status(400).json({
      ok: false,
      mensaje: 'Archivo no valido, solo se permite: ' + extPermitidas.join(', '),
      error: { mensaje: 'Extension no valida' }
    });
  }

  // Asignandole un nombre al Archivo a guardar en el servidor.
  var fileName = `${id}-${new Date().getMilliseconds()}.${ext}`;

  //Mover el archivo de una Path a una carpeta definida en el servidor
  var path = `./uploads/${tipo}/${fileName}`;
  imagen.mv(path, err => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al guardar el archivo',
        error: { mensaje: 'Error al mover el archivo', err }
      });
    }

    subirPorTipo(tipo, id, fileName, res);
    // res.status(200).json({
    //   ok: true,
    //   mensaje: 'Peticion realizada correctamente',
    //   path: path,
    //   imagen: imagen.name
    // });
  });
});

function subirPorTipo(tipo, id, fileName, res) {
  var tipoModel;
  var pathViejo = `./uploads/${tipo}/`;
  switch (tipo) {
    case 'usuario':
      tipoModel = Usuario;
      break;
    case 'hospital':
      tipoModel = Hospital;
      break;
    case 'medico':
      tipoModel = Medico;
      break;
    default:
      return res.status(501).json({
        ok: false,
        mensaje: 'No implementado',
        error: { mensaje: 'No implementado' }
      });
  }

  tipoModel.findById(id, (err, respuesta) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar ' + tipo,
        error: { mensaje: 'Error al buscar ' + tipo }
      });
    }
    if (!respuesta) {
      return res.status(404).json({
        ok: false,
        mensaje: 'No se encontró ' + tipo + ' en la Base de Datos',
        error: { mensaje: 'No se encontró ' + tipo }
      });
    }

    pathViejo += respuesta.img;
    // Borra imagen vieja, si existiera
    if (fs.existsSync(pathViejo)) {
      fs.unlink(pathViejo, err => {
        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: 'Error al eliminar imagen anterior',
            path: pathViejo
          });
        }
      });
    }
    respuesta.img = fileName;
    respuesta.save((err, modeloActualizado) => {
      if (tipo === 'usuario') {
        modeloActualizado.password = ':)';
      }
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al ligar nueva imagen',
          error: { mensaje: 'Error al ligar nueva imagen' }
        });
      }
      return res.status(200).json({
        ok: true,
        mensaje: 'Imagen actualizada',
        [tipo]: modeloActualizado
      });
    });
  });
}

// ===================================================================================================
// EXPORT
// ===================================================================================================
module.exports = app;
