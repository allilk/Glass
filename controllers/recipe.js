const mongoose = require("mongoose"),
	Recipe = mongoose.model("Recipe"),
	User = mongoose.model("User");

const { generateRecipeId } = require("../helpers/other");
const ImageController = require("../controllers/image.js");

module.exports = {
	new: (req, res) => {
		const identifier = generateRecipeId(5);
		const userId = req.payload.aud;
		const newRecipe = new Recipe({
			...req.body,
			id: identifier,
			details: { created_by: userId, category: req.body.category },
		});

		newRecipe.save(async (err, result) => {
			if (err) {
				return res.status(400).send({
					item: {},
					message: err,
				});
			} else {
				const user = await User.findOne({ _id: userId });
				if (user) {
					user.recipes = [...user.recipes, result._id];
					user.save();
				}
				return res.status(200).send({
					item: result,
					message: "success",
				});
			}
		});
	},
	get: async (req, res) => {
		const identifier = req.body.id;
		const recipe = await Recipe.findOne({ id: identifier }).populate(
			"details.created_by",
			"-hash_password -email -recipes  -__v -created"
		);

		return res.status(recipe ? 200 : 204).send({
			item: recipe,
			message: "success",
		});
	},
	getAll: (req, res) => {
		const maxLimit = 100;
		const page = parseInt(req.query.page) || 1;
		const limit =
			parseInt(req.query.limit) > maxLimit
				? maxLimit
				: parseInt(req.query.limit) || 10;
		const skipIndex = (page - 1) * limit;

		let filters = {};

		const allowableFilters = {
			category: "details.category",
		};
		Object.entries(allowableFilters).forEach((entry) => {
			const [key, value] = entry;

			if (req.query[key]) {
				filters[value] = req.query[key];
			}
		});
		Recipe.find()
			.where(filters)
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
	},
	update: (req, res) => {},
	delete: async (req, res) => {
		const identifier = req.body.id;
		const recipe = await Recipe.findOneAndDelete({ id: identifier });
		const user = recipe.details.created_by;
		if (recipe.image) {
			ImageController.delete(recipe.image);
		}
		await User.findByIdAndUpdate(
			{ _id: user },
			{ $pull: { recipes: recipe._id } },
			(err, result) => {
				if (err) {
					return res.status(400).send({
						user: "",
						message: err,
					});
				}
				return res.status(200).send({
					user: result,
					message: "success",
				});
			}
		);
	},
};

// exports.update = function (req, res) {
// 	Recipe.findOne({ id: req.body.id }, function (err, recipe) {
// 		recipe.title = req.body.title || recipe.title;
// 		recipe.steps = req.body.steps || recipe.steps;
// 		recipe.ingredients = req.body.ingredients || recipe.ingredients;
// 		recipe.updated_last = Date.now();
// 		recipe.updated_by = req.user._id;
// 		recipe.save(function (err, response) {
// 			if (err) {
// 				return res.status(400).send({
// 					message: err,
// 				});
// 			} else {
// 				return res.json(response);
// 			}
// 		});
// 	});
// };
