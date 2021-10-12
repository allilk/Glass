let mongoose = require("mongoose"),
	Category = mongoose.model("Category"),
	randomstring = require("randomstring"),
	{ alcoholic, nonAlcoholic } = require("../categories");
const generateIdentifier = () => {
	const s = randomstring.generate(3);

	Category.findOne({ id: s }, function (err, result) {
		if (result) {
			return generateIdentifier();
		}
	});
	return s;
};
const arrayEquals = (a, b) => {
	a.sort();
	b.sort();
	if (a === b) return true;
	if (a == null || b == null) return false;
	if (a.length !== b.length) return false;

	for (let i = 0; i < a.length; ++i) {
		if (a[i] !== b[i]) return false;
	}

	return true;
};
const checkForCat = () => {
	Category.find({}, (err, results) => {
		const presets = nonAlcoholic.concat(alcoholic);
		const newArr =
			results.length != 0
				? results.map((obj) => {
						return obj.name;
				  })
				: [];
		if (!arrayEquals(newArr, presets)) {
			console.log("Categories not found. Creating...");
			Category.deleteMany(() => {
				presets.forEach((preset) => {
					const identifier = generateIdentifier();
					new Category({
						name: preset,
						id: identifier,
					}).save();
				});
			});
		}
	});
};
module.exports = {
	getAll: (req, res) => {
		Category.find((err, result) => {
			if (err) {
				return res.status(400).send({
					items: [],
					count: 0,
					message: err,
				});
			}
			return res.status(result.length > 0 ? 200 : 204).send({
				items: result,
				count: result.length,
				message: "success",
			});
		})
	}
}
checkForCat();
