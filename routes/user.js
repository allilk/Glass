module.exports = function (app) {
  let userHandlers = require("../controllers/user.js");
  app
    .route("/profile")
    .post(userHandlers.loginRequired, userHandlers.profile);
  app
    .route("/profile/get")
    .post(userHandlers.profile_get);
  app.route("/auth/register").post(userHandlers.register);
  app.route("/auth/login").post(userHandlers.sign_in);
};
