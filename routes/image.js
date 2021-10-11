const express = require("express"),
	router = express.Router();
const { verifyAccessToken: loginRequired } = require("../helpers/jwt_helper");
const ImageController = require("../controllers/image.js");
const multer = require("multer"),
	maxSize = 4 * 1000 * 1000;
const upload = multer({
	dest: "uploads/",
	limits: { fileSize: maxSize },
}).single("file");

router.post("/upload", [loginRequired, upload], ImageController.upload);
router.post("/get", ImageController.get);

module.exports = router;
