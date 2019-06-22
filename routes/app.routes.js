var express = require('express');

var router = express();

// Rutas
router.get('/', (req, res) => {
  res.status(200).json({
    ok: true,
    mensaje: 'Peticion realizada correctamente'
  });
});

module.exports = router;
