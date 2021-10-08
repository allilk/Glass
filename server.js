const express = require("express"),
	app = express(),
	mongoose = require("mongoose"),
	port = process.env.PORT || 3030;
let jsonWebToken = require("jsonwebtoken"),
	cors = require("cors"),
	rateLimit = require("express-rate-limit");
let User = require("./models/user"),
	Recipe = require("./models/recipe"),
	Category = require("./models/category"),
	userRoutes = require("./routes/user"),
	recipeRoutes = require("./routes/recipe"),
	categoryRoutes = require("./routes/category");
	require("dotenv").config();

const option = {
	socketTimeoutMS: 30000,
	keepAlive: true,
	useNewUrlParser: true,
	useFindAndModify: false,
	useCreateIndex: true,
	useUnifiedTopology: true
};

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 100,
});

mongoose.connect(
	process.env.MONGO_URI,
	option
);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(limiter);
app.use((req, res, next) => {
	if (
		req.headers &&
		req.headers.authorization &&
		req.headers.authorization.split(" ")[0] === "JWT"
	) {
		jsonWebToken.verify(
			req.headers.authorization.split(" ")[1],
			"RESTFULAPIs",
			function (err, decode) {
				if (err) req.user = undefined;
				req.user = decode;
				next();
			}
		);
	} else {
		req.user = undefined;
		next();
	}
});

userRoutes(app);
recipeRoutes(app);
categoryRoutes(app);

app.use((req, res) => {
	res.status(404).send({ url: req.originalUrl + " not found" });
});

app.listen(port);

console.log(" RESTful API server started on: " + port);

module.exports = app;
