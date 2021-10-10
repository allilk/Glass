require("dotenv").config();

const mongoose = require("mongoose"),
	jwt = require("jsonwebtoken"),
	bcrypt = require("bcrypt"),
	randomstring = require("randomstring"),
	User = mongoose.model("User");

const generateIdentifier = () => {
	const s = randomstring.generate(7);

	User.findOne({ id: s }, function (err, result) {
		if (result) {
			return generateIdentifier();
		}
	});
	return s;
};
exports.register = (req, res) => {
	const { email } = req.body;

	const newUser = new User({ id: generateIdentifier(), ...req.body });
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
};
exports.login = (req, res) => {
	const { email, password } = req.body;

	User.findOne({ email }, (err, user) => {
		if (err) {
			return res.status(400).send({
				accessToken: "",
				refreshToken: "",
				message: err,
			});
		}
		if (!user || !user.comparePassword(password)) {
			return res.status(401).send({
				accessToken: "",
				refreshToken: "",
				message: "Authentication failed. Invalid user or password.",
			});
		}
		return res.status(200).send({
			accessToken: jwt.sign(
				{
					_id: user._id,
				},
				process.env.ACCESS_SECRET,
				{ expiresIn: "1h" }
			),
			refreshToken: "",
		});
	});
};

exports.loginRequired = function (req, res, next) {
	if (req.user) {
		next();
	} else {
		return res.status(401).json({ message: "Unauthorized user!!" });
	}
};
exports.profile = function (req, res, next) {
	if (req.user) {
		res.send(req.user);
		next();
	} else {
		return res.status(401).json({ message: "Invalid token" });
	}
};

exports.profile_get = (req, res) => {
	User.findOne({ id: req.body.id })
		.populate("recipes", "-hash_password")
		.exec((err, user) => {
			if (err) {
				return req.status(400).json({ message: err });
			} else {
				return res.json(user);
			}
		});
};

exports.refresh_token = (req, res) => {};
