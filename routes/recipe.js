module.exports = function (app) {
  let recipeHandlers = require("../controllers/recipe.js");
  let userHandlers = require("../controllers/user.js");
  app.route("/recipe").get(recipeHandlers.get_all);
  app.route("/recipe/get").post(recipeHandlers.get);
  app
    .route("/recipe/new")
    .post(userHandlers.loginRequired, recipeHandlers.new);
  app
    .route("/recipe/update")
    .put(userHandlers.loginRequired, recipeHandlers.update);
};
