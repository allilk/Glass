const express = require("express"),
	router = express.Router();
const RecipeController = require("../controllers/recipe.js");
const { verifyAccessToken: loginRequired } = require("../helpers/jwt_helper");

router.get("/", RecipeController.getAll);
router.post("/get", RecipeController.get);
router.post("/new", loginRequired, RecipeController.new);
router.post("/delete", loginRequired, RecipeController.delete)

module.exports = router;
