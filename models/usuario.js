// ===================================================================================================
// IMPORTS
// Libería de mongoose para la conexión y unique-validator para validaciones de campos únicos
// ===================================================================================================
var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

// Asignamos una variable Schema a la cual llamaremos para inicializar nuestras tablas con
// cada uno de los parametros que tendra el obejto (o en SQL cada columna de una tabla)
var Schema = mongoose.Schema;

// ===================================================================================================
// ROLES VALIDOS -- Creación de un enum
// ===================================================================================================
var rolesValidos = {
  values: ['ADMIN_ROLE', 'USER_ROLE'],
  message: '{VALUE} no es un rol permitido'
};
// ===================================================================================================
// Creación de la tabla usando Schema
// ===================================================================================================
var usuarioSchema = new Schema({
  // aquí se asigna cada parametro: para definirlo se abren { } y dentro de estas se
  // establece el type, required es tipo boolean, pero se le puede agregar el mensaje de requisito
  nombre: { type: String, required: [true, 'El nombre es requisito'] },
  email: { type: String, unique: true, required: [true, 'El email es requisito'] },
  password: { type: String, password: [true, 'El password es requisito'] },
  img: { type: String, required: false },
  role: { type: String, required: true, default: 'USER_ROLE', enum: rolesValidos }
});

// ===================================================================================================
// Validación de campos únicos, se agrega {PATH} para indicar el campo automaticamente
// ===================================================================================================
usuarioSchema.plugin(uniqueValidator, { message: 'Este {PATH} ya existe' });

module.exports = mongoose.model('Usuario', usuarioSchema);
