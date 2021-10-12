const mongoose = require("mongoose"),
	User = mongoose.model("User");
const bcrypt = require("bcrypt");
const { generateIdentifier } = require("../helpers/other");
const { generateAccessToken } = require("../helpers/jwt_helper");

module.exports = {
	register: (req, res) => {
		const { email } = req.body;

		const newUser = new User({ id: generateIdentifier(7), ...req.body });
		newUser.hash_password = bcrypt.hashSync(req.body.password, 10);

		User.findOne({ email }, (err, user) => {
			if (err) {
				return res.status(400).send({
					user: {},
					message: err,
				});
			}
			if (!user) {
				newUser.save();
				return res.status(200).send({
					user,
					message: "success",
				});
			} else {
				return res.status(403).send({
					user: {},
					message: "Email is already registered!",
				});
			}
		}).populate("-hash_password");
	},
	login: (req, res) => {
		const { email, password } = req.body;

		User.findOne({ email }, async (err, user) => {
			if (err) {
				return res.status(400).send({
					accessToken: "",
					refreshToken: "",
					message: err,
				});
			} else if (!user || !user.comparePassword(password)) {
				return res.status(401).send({
					accessToken: "",
					refreshToken: "",
					message: "Authentication failed. Invalid user or password.",
				});
			}
			const accessToken = await generateAccessToken(user._id);
			return res.status(200).send({
				accessToken,
				refreshToken: "",
			});
		});
	},
	profile: async (req, res, next) => {
		const { id } = req.body;
		const user = await User.findOne({ id })
			.select("-hash_password -email -__v")
			.populate("recipes", "-ingredients -steps");

		return res.status(user ? 200 : 204).send({
			user,
			message: "success",
		});
	},
};
