require("dotenv").config();

const JWT = require("jsonwebtoken"),
	createError = require("http-errors");
const mongoose = require("mongoose"),
	User = mongoose.model("User");

module.exports = {
	generateAccessToken: (userId) => {
		return new Promise((resolve, reject) => {
			const payload = {};
			const accessTokenSecret = process.env.ACCESS_SECRET;
			const options = {
				expiresIn: "1h",
				issuer: "cream.glass",
				audience: userId.toString(),
			};
			JWT.sign(payload, accessTokenSecret, options, (err, token) => {
				if (err) {
					console.log(err.message);
					reject(createError.InternalServerError());
					return;
				}
				resolve(token);
			});
		});
	},
	verifyAccessToken: (req, res, next) => {
		const accessTokenSecret = process.env.ACCESS_SECRET;
		if (!req.headers["authorization"])
			return next(createError.Unauthorized());
		const authHeader = req.headers["authorization"];
		const bearerToken = authHeader.split(" ");
		const token = bearerToken[1];

		JWT.verify(token, accessTokenSecret, (err, payload) => {
			if (err) {
				const message =
					err.name === "JsonWebTokenError"
						? "Unauthorized"
						: err.message;
				return next(createError.Unauthorized(message));
			}
			req.payload = payload;
			next();
		});
	},
	generateRefreshToken: (userId) => {
		const refreshTokenSecret = process.env.REFRESH_SECRET;
		return new Promise((resolve, reject) => {
			const payload = {};
			const options = {
				expiresIn: "1y",
				issuer: "cream.glass",
				audience: userId.toString(),
			};
			JWT.sign(payload, refreshTokenSecret, options, (err, token) => {
				if (err) {
					console.log(err.message);
					reject(createError.InternalServerError());
				}
				resolve(token);
			});
		});
	},
	verifyRefreshToken: (refreshToken) => {
		const refreshTokenSecret = process.env.REFRESH_SECRET;
		return new Promise((resolve, reject) => {
			JWT.verify(refreshToken, refreshTokenSecret, (err, payload) => {
				if (err) return reject(createError.Unauthorized());
				const userId = payload.audience;

				User.findById(userId, (err, user) => {
					if (err) {
						console.log(err.message);
						reject(createError.InternalServerError());
						return;
					}
					if (refreshToken === user.refreshToken)
						return resolve(userId);
					reject(createError.Unauthorized());
				});
			});
		});
	},
};
