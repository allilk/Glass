let express = require("express"),
  app = express(),
  port = process.env.PORT || 8080,
  User = require("./models/user"),
  Recipe = require("./models/recipe"),
  bodyParser = require("body-parser"),
  jsonwebtoken = require("jsonwebtoken"),
  cors = require("cors");

app.use(cors());
const mongoose = require("mongoose");
const option = {
  socketTimeoutMS: 30000,
  keepAlive: true,
  reconnectTries: 30000,
  useNewUrlParser: true,
};

// const mongoURI = process.env.MONGODB_URI;
mongoose.connect('', option)

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(function (req, res, next) {
  if (
    req.headers &&
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "JWT"
  ) {
    jsonwebtoken.verify(
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
let routes = require("./routes/user");
routes(app);
let recipeRoutes = require("./routes/recipe");

recipeRoutes(app);
app.use(function (req, res) {
  res.status(404).send({ url: req.originalUrl + " not found" });
});

app.listen(port);

console.log(" RESTful API server started on: " + port);

module.exports = app;
