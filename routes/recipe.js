const multer = require("multer");

// 4Mb
const maxSize = 4 * 1000 * 1000;

const upload = multer({
	dest: "uploads/",
	limits: { fileSize: maxSize },
}).single("file");


module.exports = function (app) {
	let recipeHandlers = require("../controllers/recipe.js");
	let userHandlers = require("../controllers/user.js");
	let imageHandlers = require("../controllers/image.js");
	app.get("/recipe", recipeHandlers.get_all);
	app.post("/recipe/get", recipeHandlers.get);
	app.route("/recipe/new").post(
		userHandlers.loginRequired,
		recipeHandlers.new
	);
	app.route("/recipe/update").put(
		userHandlers.loginRequired,
		recipeHandlers.update
	);
	app.post(
		"/image/upload",
		[userHandlers.loginRequired, upload],
		imageHandlers.upload
	);
	app.post("/image/get", imageHandlers.get);
};
