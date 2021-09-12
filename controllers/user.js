let mongoose = require("mongoose"),
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
	let newUser = new User({ id: generateIdentifier(), ...req.body });
	newUser.hash_password = bcrypt.hashSync(req.body.password, 10);
	User.findOne(
		{
			email: req.body.email,
		},
		(err, user) => {
			if (!user) {
				newUser.save((err, user) => {
					if (err) {
						return res.status(400).send({
							message: err,
						});
					} else {
						user.hash_password = undefined;
						return res.json(user);
					}
				});
			} else {
				return res.json(400).send({
					message: "Email is already registered.",
				});
			}
		}
	);
};
exports.sign_in = function (req, res) {
	User.findOne(
		{
			email: req.body.email,
		},
		function (err, user) {
			if (err) throw err;
			if (!user || !user.comparePassword(req.body.password)) {
				return res.status(401).json({
					message: "Authentication failed. Invalid user or password.",
				});
			}
			return res.json({
				token: jwt.sign(
					{
						email: user.email,
						fullName: user.fullName,
						id: user.id,
						_id: user._id,
					},
					"RESTFULAPIs",
					{ expiresIn: "1h" }
				),
				refreshToken: "",
			});
		}
	);
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
	User.findOne({ id: req.body.id }).populate('recipes').exec((err, user) => {
		user.hash_password = undefined
		if (err) {
			return req.status(401).json({ message: err });
		} else {
			return res.json(user);
		}
	})
};

exports.refresh_token = (req, res) => {};
