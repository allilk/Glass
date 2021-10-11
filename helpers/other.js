const mongoose = require("mongoose"),
	User = mongoose.model("User");
const randomstring = require("randomstring");
exports.generateIdentifier = (length) => {
	const identifier = randomstring.generate(length);

	User.findOne({ id: identifier }, function (err, result) {
		if (result) {
			return generateIdentifier();
		}
	});
	return identifier;
};
