require("dotenv").config();

const express = require("express"),
	app = express(),
	rateLimit = require("express-rate-limit"),
	cors = require("cors");

const mongoose = require("mongoose"),
	port = process.env.PORT || 3030;

const User = require("./models/user"),
	Recipe = require("./models/recipe"),
	Category = require("./models/category"),
	Token = require("./models/token"),
	userRoutes = require("./routes/user"),
	recipeRoutes = require("./routes/recipe"),
	imageRoutes = require("./routes/image"),
	categoryRoutes = require("./routes/category");

const option = {
	socketTimeoutMS: 30000,
	keepAlive: true,
	useNewUrlParser: true,
	useFindAndModify: false,
	useCreateIndex: true,
	useUnifiedTopology: true,
};

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 100,
});

mongoose.connect(process.env.MONGO_URI, option);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(limiter);

app.use("/auth", userRoutes);
app.use("/recipe", recipeRoutes);
app.use("/image", imageRoutes);
app.use("/category", categoryRoutes);

app.use((req, res) => {
	res.status(404).send({ url: req.originalUrl + " not found" });
});

app.listen(port);

console.log(" RESTful API server started on: " + port);

module.exports = app;
