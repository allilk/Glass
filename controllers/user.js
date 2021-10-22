const mongoose = require("mongoose"),
	User = mongoose.model("User"),
	Token = mongoose.model("Token");

const bcrypt = require("bcrypt");

const { generateUserId } = require("../helpers/other");
const {
	generateAccessToken,
	generateRefreshToken,
	verifyRefreshToken,
} = require("../helpers/jwt_helper");

module.exports = {
	register: async (req, res) => {
		const { email } = req.body;

		const newUser = new User({ id: generateUserId(7), ...req.body });
		newUser.hash_password = bcrypt.hashSync(req.body.password, 10);

		await User.findOne({ email }, async (err, user) => {
			if (err) {
				return res.status(400).send({
					user: {},
					message: err,
				});
			}
			if (!user) {
				await newUser.save();
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
	login: async (req, res) => {
		const { email, password } = req.body;

		await User.findOne({ email }, async (err, user) => {
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

			if (!user.refreshToken) {
				user.refreshToken = await generateRefreshToken(user._id);
				user.save();
			} else {
				const validToken = await verifyRefreshToken(user.refreshToken);
				if (!validToken) {
					user.refreshToken = await generateRefreshToken(user._id);
					user.save();
				}
			}
			return res.status(200).send({
				accessToken,
				refreshToken: user.refreshToken,
				_id: user._id,
				id: user.id,
			});
		});
	},
	refreshToken: async (req, res) => {
		const { refreshToken, accessToken } = req.body;
		if (!refreshToken) throw createError.BadRequest();
		const userId = await verifyRefreshToken(refreshToken);
		// blacklist token
		await new Token({ token: accessToken, type: "accessToken" }).save();

		const accToken = await signAccessToken(userId);
		const refToken = await signRefreshToken(userId);
		res.status(200).send({
			accessToken: accToken,
			refreshToken: refToken,
		});
	},
	profile: async (req, res) => {
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
