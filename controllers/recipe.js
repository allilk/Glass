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
	const createRecipe = (cat) => {
		// initalize new recipe
		const identifier = generateIdentifier();
		let newRecipe = new Recipe({
			...req.body,
			id: identifier,
			details: { created_by: req.user._id, category: cat._id },
		});
		// Save new recipe
		newRecipe.save().then(async (recipe) => {
			User.findOne({ _id: req.user._id }, (err, user) => {
				user.recipes = [recipe._id, ...user.recipes];
				user.save();
			});
			let rec = await getRecipe(recipe.id);
			return res.json(rec);
		});
	};
	// initalize new category
	let newCat = new Category({
		name: req.body["details.category"],
		id: generateIdentifier(),
	});
	// make sure it doesnt exist
	Category.findOne(
		{ name: req.body["details.category"] },
		(err, category) => {
			if (!category) {
				if (err) {
					return res.status(400).send({
						message: err,
					});
				} else {
					newCat.save();
					createRecipe(newCat);
				}
			} else {
				createRecipe(category);
			}
		}
	);
};
exports.get = (req, res) => {
	getRecipe(req.body.id).then((recipe) => {

		if (!recipe) {
			return res.status(401).send({
				message: "No recipe found.",
			});
		}
		return res.json(recipe);
	});
};
exports.get_all = async (req, res) => {
	const maxLimit = 100;
	const page = parseInt(req.query.page) || 1;
	const limit =
		parseInt(req.query.limit) > maxLimit
			? maxLimit
			: parseInt(req.query.limit) || 10;
	const skipIndex = (page - 1) * limit;

	let filters = {};

	if (req.query.category) {
		await Category.findOne()
			.where({ name: req.query.category })
			.exec()
			.then((result) => {
				if (result) {
					filters["details.category"] = result._id;
				}
			});
	}
	Recipe.find()
		.where(filters)
		.sort({ "details.created": -1 })
		.limit(limit)
		.skip(skipIndex)
		.exec((err, result) => {
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
