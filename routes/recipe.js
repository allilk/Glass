const express = require("express"),
	router = express.Router();
const RecipeController = require("../controllers/recipe.js");
const { verifyAccessToken: loginRequired } = require("../helpers/jwt_helper");

router.get("/", RecipeController.getAll);
router.post("/get", RecipeController.get);
router.post("/new", loginRequired, RecipeController.new);

module.exports = router;
