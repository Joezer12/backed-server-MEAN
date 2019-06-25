// ===================================================================================================
// IMPORTS
// ===================================================================================================
var express = require('express');
var verificarToken = require('../middleware/autenticacion').verificaToken;
var Hospital = require('../models/hospital');

// ===================================================================================================
// INICIALIZACION
// ===================================================================================================
var hosp = express();

// ===================================================================================================
// GET -- Método para obtener hospitales de MongoDB
// ===================================================================================================
hosp.get('/', (req, res) => {
  var desde = req.query.desde || 0;
  desde = Number(desde);

  Hospital.find({})
    .populate('usuario', 'nombre email')
    .skip(desde)
    .limit(5)
    .exec((err, hospitales) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Fallo al cargar hospitales',
          error: err
        });
      }
      Hospital.count((err, count) => {
        res.status(200).json({
          ok: true,
          hospitales: hospitales,
          total: count
        });
      });
    });
});

// ===================================================================================================
// POST -- Método para insertar un Hospital en MongoDB
// ===================================================================================================
hosp.post('/', verificarToken, (req, res) => {
  var body = req.body;
  var hospital = new Hospital({
    nombre: body.nombre,
    usuario: req.usuario._id
  });

  hospital.save((err, hospitalGuardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Fallo al crear hospital',
        error: err
      });
    }

    res.status(201).json({
      ok: true,
      hospital: hospitalGuardado,
      usuarioToken: req.usuario
    });
  });
});

// ===================================================================================================
// PUT -- Actualizar usuario
// ===================================================================================================
hosp.put('/:id', verificarToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;

  Hospital.findById(id, (err, hospital) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar hospital',
        error: err
      });
    }
    if (!hospital) {
      return res.status(404).json({
        ok: false,
        mensaje: 'El hospital con el id: ' + id + 'no existe...',
        error: { message: 'No existe un hospital con ese ID' }
      });
    }

    hospital.nombre = body.nombre;
    hospital.usuario = req.usuario._id;

    hospital.save((err, hosptialGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar hospital',
          error: err
        });
      }
      res.status(200).json({
        ok: true,
        usuario: hosptialGuardado
      });
    });
  });
});

// ===================================================================================================
// DELETE -- Eliminar un usuario
// ===================================================================================================
hosp.delete('/:id', verificarToken, (req, res) => {
  var id = req.params.id;

  Hospital.findByIdAndRemove(id, (err, hospitalRemovido) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'No se encontro dicho hosptial',
        error: err
      });
    }
    if (!hospitalRemovido) {
      return res.status(404).json({
        ok: false,
        mensaje: 'El hospital con el id: ' + id + ' no existe...',
        error: { message: 'No existe un hosptial con ese ID' }
      });
    }
    res.status(200).json({
      ok: true,
      hospital: hospitalRemovido
    });
  });
});

// ===================================================================================================
// Export del módulo
// ===================================================================================================
module.exports = hosp;
