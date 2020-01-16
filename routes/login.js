// ===================================================================================================
// IMPORTS
// ===================================================================================================
var express = require('express');
var bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
var Usuario = require('../models/usuario');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;
var CLIENT_ID = require('../config/config').CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);
var verityToken = require('../middleware/autenticacion').verificaToken;
// ===================================================================================================
// INICIALIZACION de variables y librerías
// ===================================================================================================
var login = express();

// ===================================================================================================
// POST -- Autenticación normal
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
// POST -- Autenticación normal
// ===================================================================================================
login.get('/renuevatoken', verityToken, (req, res) => {
  // ===================================================================================================
  // TOKEN -- Aquí se debe generar
  // ===================================================================================================
  // usuario.password = '';
  var token = jwt.sign({ usuario: req.usuario }, SEED, { expiresIn: 60 * 60 });

  res.status(201).json({
    ok: true,
    token: token
  });
});

// ===================================================================================================
// POST -- Autenticación por Google
// ===================================================================================================
login.post('/google', async (req, res) => {
  var token = req.body.token;
  var googleUser;
  try {
    googleUser = await verify(token);
  } catch (e) {
    return res.status(403).json({
      ok: false,
      mensaje: 'No se pudo autenticar Google',
      error: { mensaje: 'Token no valido', error: e }
    });
  }
  Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Fallo al buscar usuario',
        error: err
      });
    }

    if (!usuarioDB) {
      var usuario = new Usuario({
        nombre: googleUser.nombre,
        email: googleUser.email,
        img: googleUser.img,
        google: true,
        password: ':)'
      });
      // eslint-disable-next-line no-console
      console.log(usuario);

      usuario.save((err, usuarioDB) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: 'Fallo al guardar usuario',
            error: err
          });
        }
        var token = jwt.sign({ usuarioDB }, SEED, { expiresIn: 60 * 60 });

        res.status(201).json({
          ok: true,
          mensaje: 'Login correcto',
          usuario: usuarioDB,
          id: usuarioDB.id,
          token: token
        });
      });
      return res.status(400).json({
        ok: false,
        mensaje: 'Credenciales no validas - email',
        error: err
      });
    } else {
      if (!usuarioDB.google) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Debe usar su autenticación normal'
        });
      } else {
        var token = jwt.sign({ usuarioDB }, SEED, { expiresIn: 60 * 60 });

        res.status(201).json({
          ok: true,
          mensaje: 'Login correcto',
          usuario: usuarioDB,
          id: usuarioDB.id,
          token: token
        });
      }
    }
  });

  // return res.status(200).json({
  //   ok: true,
  //   mensaje: 'Google Login',
  //   googleUser: googleUser
  // });
});

async function verify(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: CLIENT_ID // Specify the CLIENT_ID of the app that accesses the backend
    // Or, if multiple clients access the backend:
    //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    // HTTP_PROXY = 'hin4460:Leunamme123@10.27.1.20:8080'
  });
  const payload = ticket.getPayload();
  // const userid = payload['sub'];
  // If request specified a G Suite domain:
  //const domain = payload['hd'];
  // eslint-disable-next-line no-console
  // console.log(payload);

  return {
    nombre: payload.name,
    email: payload.email,
    img: payload.picture,
    google: true
  };
}

// ===================================================================================================
// EXPORT del módulo
// ===================================================================================================
module.exports = login;
