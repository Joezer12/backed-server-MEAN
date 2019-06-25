var express = require('express');
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

var busqueda = express();

// ===================================================================================================
// BUSQUEDA -- General
// ===================================================================================================
busqueda.get('/todo/:busqueda', (req, res) => {
  var busqueda = req.params.busqueda;
  var rgx = new RegExp(busqueda, 'i');

  Promise.all([buscarHospitales(busqueda, rgx), buscarMedicos(busqueda, rgx), buscarUsuarios(busqueda, rgx)]).then(
    respuestas => {
      res.status(200).json({
        ok: true,
        hospitales: respuestas[0],
        medicos: respuestas[1],
        usuarios: respuestas[2]
      });
    }
  );
});

function buscarHospitales(busqueda, rgx) {
  return new Promise((resolve, reject) => {
    Hospital.find({ nombre: rgx })
      .populate('usuario', 'nombre email')
      .exec((err, hospitales) => {
        if (err) {
          return reject('Error al buscar hospitales', err);
        } else {
          resolve(hospitales);
        }
      });
  });
}

function buscarMedicos(busqueda, rgx) {
  return new Promise((resolve, reject) => {
    Medico.find({ nombre: rgx })
      .populate('usuario', 'nombre email')
      .populate('hospital', 'nombre')
      .exec((err, medicos) => {
        if (err) {
          return reject('Error al buscar médicos', err);
        } else {
          resolve(medicos);
        }
      });
  });
}

function buscarUsuarios(busqueda, rgx) {
  return new Promise((resolve, reject) => {
    Usuario.find({}, 'nombre email role')
      .or([{ nombre: rgx }, { email: rgx }])
      .exec((err, usuarios) => {
        if (err) {
          return reject('Error al buscar usuarios', err);
        } else {
          resolve(usuarios);
        }
      });
  });
}

// ===================================================================================================
// BUSQUEDA -- Especifica por colección
// ===================================================================================================
busqueda.get('/coleccion/:tabla/:busqueda', (req, res) => {
  var busqueda = req.params.busqueda;
  var tabla = req.params.tabla;
  var rgx = new RegExp(busqueda, 'i');
  var promesa;

  switch (tabla) {
    case 'medicos':
      promesa = buscarMedicos(busqueda, rgx);
      break;
    case 'hospitales':
      promesa = buscarHospitales(busqueda, rgx);
      break;
    case 'usuarios':
      promesa = buscarUsuarios(busqueda, rgx);
      break;
    default:
      res.status(400).json({
        ok: false,
        mensaje: 'Los tipos de colecciones son: medicos, hospitales y usuarios',
        error: { mensaje: 'Colección no valida' }
      });
  }

  promesa.then(respuesta => {
    res.status(200).json({
      ok: true,
      [tabla]: respuesta
    });
  });
});

// ===================================================================================================
// EXPORT
// ===================================================================================================
module.exports = busqueda;
