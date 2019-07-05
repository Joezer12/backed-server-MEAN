/* eslint-disable no-console */
// =====================================================================
// Imports
// =====================================================================
var express = require('express');
var bcrypt = require('bcryptjs'); // Para encriptado de información
var verificarToken = require('../middleware/autenticacion').verificaToken;
// =====================================================================
// Inicialización de variables
// =====================================================================
var Usuario = require('../models/usuario');
var router = express();

// =====================================================================
// GET -- Obtener todos los usuarios
// =====================================================================
router.get('/', (req, res) => {
  var desde = req.query.desde || 0;
  desde = Number(desde);

  Usuario.find({}, 'nombre email img role google')
    .skip(desde)
    .limit(5)
    .exec((err, usuarios) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Fallo al cargar usuarios',
          error: err
        });
      }
      Usuario.count({}, (err, count) => {
        res.status(200).json({
          ok: true,
          usuarios: usuarios,
          page: desde + 1 + ' al ' + (desde + 5),
          total: count
        });
      });
    });
});

// ===================================================================================================
// MIDDLEWARE -- Verificación de Token
// Se coloca en esta parte, para que todas las peticiones después de este punto requieran validación
// No obstante esto no es práctico ni flexible y lo mejor es manejarlo por serparado
// ===================================================================================================
// router.use('/', (req, res, next) => {
//   var token = req.query.token;

//   jwt.verify(token, SEED, (err, decoded) => {
//     if (err) {
//       return res.status(401).json({
//         ok: false,
//         mensaje: 'Acceso restringido, token no valido',
//         error: err
//       });
//     }
//     next();
//   });
// });
// ===================================================================================================
// POST -- Crear un nuevo usuario
// ===================================================================================================
router.post('/', (req, res) => {
  var body = req.body;
  var usuario = new Usuario({
    nombre: body.nombre,
    email: body.email,
    password: bcrypt.hashSync(body.password, 10),
    img: body.img,
    role: body.role
  });

  usuario.save((err, usuarioGuardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Fallo al crear usuario',
        error: err
      });
    }
    console.log('usuario token: ', req.usuario);

    res.status(201).json({
      ok: true,
      usuario: usuarioGuardado,
      usuarioToken: req.usuario
    });
  });
});

// ===================================================================================================
// PUT -- Actualizar usuario
// ===================================================================================================
router.put('/:id', verificarToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;

  Usuario.findById(id, 'nombre email img role').exec((err, usuario) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar usuario',
        error: err
      });
    }
    if (!usuario) {
      return res.status(404).json({
        ok: false,
        mensaje: 'El usuario con el id: ' + id + 'no existe...',
        error: { message: 'No existe usuario con ese ID' }
      });
    }

    usuario.nombre = body.nombre;
    usuario.email = body.email;
    usuario.role = body.role;

    usuario.save((err, usuarioGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar usuario',
          error: err
        });
      }
      res.status(200).json({
        ok: true,
        usuario: usuarioGuardado
      });
    });
  });
});

// ===================================================================================================
// DELETE -- Eliminar un usuario
// ===================================================================================================
router.delete('/:id', verificarToken, (req, res) => {
  var id = req.params.id;

  Usuario.findByIdAndRemove(id, (err, usuarioRemovido) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'No se encontro dicho usuario',
        error: err
      });
    }
    if (!usuarioRemovido) {
      return res.status(404).json({
        ok: false,
        mensaje: 'El usuario con el id: ' + id + ' no existe...',
        error: { message: 'No existe usuario con ese ID' }
      });
    }
    res.status(200).json({
      ok: true,
      usuario: usuarioRemovido
    });
  });
});

// ===================================================================================================
// Export del módulo
// ===================================================================================================
module.exports = router;
