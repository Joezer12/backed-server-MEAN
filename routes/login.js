// ===================================================================================================
// IMPORTS
// ===================================================================================================
var express = require('express');
var bcrypt = require('bcryptjs');
var Usuario = require('../models/usuario');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

// ===================================================================================================
// INICIALIZACION de variables y librerías
// ===================================================================================================
var login = express();

// ===================================================================================================
// POST --
// ===================================================================================================
login.post('/', (req, res) => {
  var body = req.body;
  Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Fallo al buscar usuario',
        error: err
      });
    }

    if (!usuarioDB) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Credenciales no validas - email',
        error: err
      });
    }

    if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Credenciales no validas - password',
        error: err
      });
    }

    // ===================================================================================================
    // TOKEN -- Aquí se debe generar
    // ===================================================================================================
    usuarioDB.password = '';
    var token = jwt.sign({ usuarioDB }, SEED, { expiresIn: 60 * 60 });

    res.status(201).json({
      ok: true,
      mensaje: 'Login correcto',
      usuario: usuarioDB,
      id: usuarioDB.id,
      token: token
    });
  });
});
// ===================================================================================================
// EXPORT del módulo
// ===================================================================================================
module.exports = login;
