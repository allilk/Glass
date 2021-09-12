module.exports = function (app) {
	let categoryHandlers = require("../controllers/category.js");
	app.route("/category").get(categoryHandlers.get_all);
};
