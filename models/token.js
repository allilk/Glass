let mongoose = require("mongoose"),
	Schema = mongoose.Schema;

let TokenSchema = new Schema({
	token: {
		type: String,
		required: true,
	},
	type: {
		type: String,
		required: true,
	},
});

mongoose.model("Token", TokenSchema, "tokens");
