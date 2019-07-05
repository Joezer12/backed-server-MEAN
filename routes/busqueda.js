/* eslint-disable no-undef */
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

function buscarHospitales(busqueda, rgx, desde, limite) {
  return new Promise((resolve, reject) => {
    Hospital.find({ nombre: rgx })
      .skip(desde)
      .limit(limite)
      .populate('usuario', 'nombre email')
      .exec((err, hospitales) => {
        if (err) {
          return reject('Error al buscar hospitales', err);
        }
        Hospital.count({ nombre: rgx }).exec((err, count) => {
          if (err) {
            return reject('Error al buscar usuarios', err);
          }
          resolve({ hospitales, count });
        });
      });
  });
}

function buscarMedicos(busqueda, rgx, desde, limite) {
  return new Promise((resolve, reject) => {
    Medico.find({ nombre: rgx })
      .skip(desde)
      .limit(limite)
      .populate('usuario', 'nombre email')
      .populate('hospital', 'nombre')
      .exec((err, medicos) => {
        if (err) {
          return reject('Error al buscar médicos', err);
        }
        Medico.count({ nombre: rgx }).exec((err, count) => {
          if (err) {
            return reject('Error al buscar usuarios', err);
          }
          resolve({ medicos, count });
        });
      });
  });
}

function buscarUsuarios(busqueda, rgx, desde, limite) {
  return new Promise((resolve, reject) => {
    Usuario.find({}, 'nombre email role google')
      .skip(desde)
      .limit(limite)
      .or([{ nombre: rgx }, { email: rgx }])
      .exec((err, usuarios) => {
        if (err) {
          return reject('Error al buscar usuarios', err);
        }
        Usuario.count()
          .or([{ nombre: rgx }, { email: rgx }])
          .exec((err, count) => {
            if (err) {
              return reject('Error al buscar usuarios', err);
            }
            resolve({ usuarios, count });
          });
      });
  });
}

// ===================================================================================================
// BUSQUEDA -- Especifica por colección
// ===================================================================================================
busqueda.get('/:tabla/:busqueda', (req, res) => {
  var busqueda = req.params.busqueda;
  var tabla = req.params.tabla;
  var desde = req.query.desde || 0;
  var limite = req.query.limite || 5;
  var hasta;
  var rgx = new RegExp(busqueda, 'i');
  var promesa;

  desde = Number(desde);
  limite = Number(limite);
  switch (tabla) {
    case 'medicos':
      promesa = buscarMedicos(busqueda, rgx, desde, limite);
      break;
    case 'hospitales':
      promesa = buscarHospitales(busqueda, rgx, desde, limite);
      break;
    case 'usuarios':
      promesa = buscarUsuarios(busqueda, rgx, desde, limite);
      break;
    default:
      res.status(400).json({
        ok: false,
        mensaje: 'Los tipos de colecciones son: medicos, hospitales y usuarios',
        error: { mensaje: 'Colección no valida' }
      });
  }

  promesa.then(resp => {
    hasta = desde + 5 > resp.count ? resp.count : desde + 5;
    res.status(200).json({
      ok: true,
      [tabla]: resp.usuarios || resp.medicos || resp.hospitales,
      total: resp.count,
      page: desde + 1 + ' al ' + hasta
    });
  });
});

// ===================================================================================================
// EXPORT
// ===================================================================================================
module.exports = busqueda;
