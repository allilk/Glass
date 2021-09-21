let mongoose = require("mongoose"),
	Recipe = mongoose.model("Recipe"),
	Category = mongoose.model("Category"),
	User = mongoose.model("User"),
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
const getRecipe = async (identifier) => {
	let res = await Recipe.findOne({ id: identifier })
		.populate("details.category")
		.populate(
			"details.created_by",
			"-hash_password -email -recipes  -__v -created"
		)
		.then((x) => {
			return x;
		});
	return res;
};
exports.new = (req, res) => {
	const identifier = generateIdentifier();
	const newRecipe = new Recipe({
		...req.body,
		id: identifier,
		details: { created_by: req.user._id, category: req.category },
	});

	newRecipe.save().exec(async (err, result) => {
		if (err) {
			return res.status(400).send({
				item: {},
				message: err,
			});
		} else {
			await User.findOne({ _id: req.user._id }, (user) => {
				user.recipes = [result._id, ...user.recipes];
				user.save();
			});
			return res.status(200).send({
				item: result,
				message: "success",
			});
		}
	});
};


exports.get = (req, res) => {
	getRecipe(req.body.id).then((recipe) => {
		if (!recipe) {
			return res.status(204).send({
				message: "No recipe found.",
			});
		}
		return res.json(recipe);
	});
};
exports.get_all = (req, res) => {
	const maxLimit = 100;
	const page = parseInt(req.query.page) || 1;
	const limit =
		parseInt(req.query.limit) > maxLimit
			? maxLimit
			: parseInt(req.query.limit) || 10;
	const skipIndex = (page - 1) * limit;

	let filters = {};

	const allowableFilters = {
		category: "details.category.name",
	};
	Object.entries(allowableFilters).forEach((entry) => {
		const [key, value] = entry;

		if (req.query[key]) {
			filters[value] = req.query[key];
		}
	});
	Recipe.find()
		.where(filters)
		.populate("details.category")
		.sort({ "details.created": -1 })
		.limit(limit)
		.skip(skipIndex)
		.exec((err, result) => {
			if (err) {
				return res.status(400).send({
					items: [],
					count: 0,
					message: err,
				});
			} else {
				return res.status(result.length > 0 ? 200 : 204).send({
					items: result,
					count: result.length,
					message: "success",
				});
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
