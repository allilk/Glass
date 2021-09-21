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
const checkForCat = () => {
	Category.find({}, (err, results) => {
		const presets = nonAlcoholic.concat(alcoholic);
		const newArr = results.length != 0 ? results.map((obj) => {
			return obj.name
		}) : []
		if (newArr != presets) {
			console.log("Categories not found. Creating...")
			Category.deleteMany(() => {
				presets.forEach((preset) => {
					const identifier = generateIdentifier();
					new Category({
						name: preset,
						id: identifier,
					}).save()
				});
			});
		}
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
	Category.find((err, result) => {
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

checkForCat();
