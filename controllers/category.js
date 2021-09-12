let mongoose = require("mongoose"),
	Category = mongoose.model("Category");

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
