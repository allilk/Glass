const express = require("express"),
	router = express.Router();
const UserController = require("../controllers/user.js");
// const { verifyAccessToken: loginRequired } = require("../helpers/jwt_helper");

router.post("/login", UserController.login);
router.post("/register", UserController.register);
router.post("/profile", UserController.profile);

module.exports = router;
