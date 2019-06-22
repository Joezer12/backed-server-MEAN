// ===================================================================================================
// IMPORTS
// ===================================================================================================
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

// ===================================================================================================
// INICIALIZACION
// ===================================================================================================

// ===================================================================================================
// MIDDLEWARE -- Verificación de Token
// ===================================================================================================
exports.verificaToken = function(req, res, next) {
  var token = req.query.token;

  jwt.verify(token, SEED, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        ok: false,
        mensaje: 'Acceso restringido, token no valido',
        error: err
      });
    }
    req.usuario = decoded.usuarioDB;
    next();
    // Si quito el next() y uso el siguiente código, se puede obtener lo que viene en el decodec
    // return res.status(401).json({
    //   ok: true,
    //   decoded: decoded
    // });
  });
};
