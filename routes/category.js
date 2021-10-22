const express = require("express"),
	router = express.Router();

const CategoryController = require("../controllers/category.js");

router.get("/", CategoryController.getAll);

module.exports = router;
