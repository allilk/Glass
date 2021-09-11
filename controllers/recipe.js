let mongoose = require("mongoose"),
	Recipe = mongoose.model("Recipe"),
	randomstring = require("randomstring");

const generateIdentifier = () => {
	const s = randomstring.generate(5);

	Recipe.findOne({ id: s }, function (err, result) {
		if (result) {
			return generateIdentifier();
		}
	});
	return s;
};
exports.new = (req, res) => {
	const identifier = generateIdentifier();
	req.body = {
		...req.body,
		id: identifier,
		details: { created_by: req.user.id },
	};
	let newRecipe = new Recipe(req.body);
	newRecipe.save(function (err, recipe) {
		if (err) {
			return res.status(400).send({
				message: err,
			});
		} else {
			return res.json(recipe);
		}
	});
};
exports.get = function (req, res) {
	Recipe.findOne(
		{
			id: req.body.id,
		},
		function (err, recipe) {
			if (err) {
				return res.status(400).send({
					message: err,
				});
			} else {
				return res.json(recipe);
			}
		}
	);
};
exports.get_all = (req, res) => {
	const maxLimit = 100;
	const page = parseInt(req.query.page);
	const limit =
		parseInt(req.query.limit) > maxLimit
			? maxLimit
			: parseInt(req.query.limit) || 10;
	const skipIndex = (page - 1) * limit;
	Recipe.find((err, result) => {
		if (err) {
			return res.status(400).send({
				message: err,
			});
		} else if (result.length == 0) {
			return res.status(400).send({
				message: "No data available!",
			});
		} else {
			return res.json(result);
		}
	})
		.sort({ "details.created": -1 })
		.limit(limit)
		.skip(skipIndex)
		.exec();
};
exports.update = function (req, res) {
	Recipe.findOne({ id: req.body.id }, function (err, recipe) {
		recipe.title = req.body.title || recipe.title;
		recipe.steps = req.body.steps || recipe.steps;
		recipe.ingredients = req.body.ingredients || recipe.ingredients;
		recipe.updated_last = Date.now();
		recipe.updated_by = req.user._id;
		recipe.save(function (err, response) {
			if (err) {
				return res.status(400).send({
					message: err,
				});
			} else {
				return res.json(response);
			}
		});
	});
};
