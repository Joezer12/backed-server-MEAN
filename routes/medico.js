// ===================================================================================================
// IMPORTS
// ===================================================================================================
var express = require('express');
var verificarToken = require('../middleware/autenticacion').verificaToken;
var Medico = require('../models/medico');

// ===================================================================================================
// INICIALIZACION
// ===================================================================================================
var medico = express();

// ===================================================================================================
// GET -- Método para obtener hospitales de MongoDB
// ===================================================================================================
medico.get('/', (req, res) => {
  var desde = req.query.desde || 0;
  desde = Number(desde);

  Medico.find({})
    .skip(desde)
    .limit(5)
    .populate('usuario', 'nombre email')
    .populate('hospital', 'nombre')
    .exec((err, medicos) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Fallo al cargar medicos',
          error: err
        });
      }
      Medico.count((err, count) => {
        res.status(200).json({
          ok: true,
          medicos: medicos,
          page: desde + ' de ' + (desde + 5),
          total: count
        });
      });
    });
});

// ===================================================================================================
// POST -- Método para insertar un Hospital en MongoDB
// ===================================================================================================
medico.post('/', verificarToken, (req, res) => {
  var body = req.body;
  var medico = new Medico({
    nombre: body.nombre,
    usuario: req.usuario._id,
    hospital: body.hospital
  });

  medico.save((err, medicoGuardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Fallo al crear médico',
        error: err
      });
    }

    res.status(201).json({
      ok: true,
      medico: medicoGuardado,
      usuarioToken: req.usuario
    });
  });
});

// ===================================================================================================
// PUT -- Actualizar usuario
// ===================================================================================================
medico.put('/:id', verificarToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;

  Medico.findById(id, (err, medico) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar médico',
        error: err
      });
    }
    if (!medico) {
      return res.status(404).json({
        ok: false,
        mensaje: 'El médico con el id: ' + id + 'no existe...',
        error: { message: 'No existe un médico con ese ID' }
      });
    }

    medico.nombre = body.nombre;
    medico.usuario = req.usuario._id;
    medico.hospital = body.hospital;

    medico.save((err, medicoGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar al médico',
          error: err
        });
      }
      res.status(200).json({
        ok: true,
        medico: medicoGuardado
      });
    });
  });
});

// ===================================================================================================
// DELETE -- Eliminar un usuario
// ===================================================================================================
medico.delete('/:id', verificarToken, (req, res) => {
  var id = req.params.id;

  Medico.findByIdAndRemove(id, (err, medicoRemovido) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'No se encontro dicho médico',
        error: err
      });
    }
    if (!medicoRemovido) {
      return res.status(404).json({
        ok: false,
        mensaje: 'El médico con el id: ' + id + ' no existe...',
        error: { message: 'No existe un médico con ese ID' }
      });
    }
    res.status(200).json({
      ok: true,
      medico: medicoRemovido
    });
  });
});

// ===================================================================================================
// EXPORT -- Exporta el módulo para usarlo en app.js
// ===================================================================================================
module.exports = medico;
