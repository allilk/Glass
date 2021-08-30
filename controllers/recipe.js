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
	req.body.created_by = req.user._id;
	const identifier = generateIdentifier();
	req.body.id = identifier;
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
exports.get_all = function (req, res) {
	Recipe.find(function (err, recipes) {
		if (err) {
			return res.status(400).send({
				message: err,
			});
		} else {
			return res.json(recipes);
		}
	});
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
