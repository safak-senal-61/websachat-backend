// src/controllers/auth/index.js

/**
 * Bu dosya, auth klasöründeki tüm controller fonksiyonlarını tek bir nesne altında birleştirir.
 * Rota (routes) tanımlamalarında import işlemini basitleştirir.
 * Örneğin: const authController = require('./controllers/auth');
 */

const registerController = require('./register_controller');
const authController = require('./auth_controller');
const emailController = require('./email_controller');
const passwordController = require('./password_controller');
const userController = require('./user_controller');

module.exports = {
  ...registerController,
  ...authController,
  ...emailController,
  ...passwordController,
  ...userController,
};
