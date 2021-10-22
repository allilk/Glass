const mongoose = require("mongoose"),
	Schema = mongoose.Schema;

const tokenSchema = new Schema({
	token: {
		type: String,
		required: true,
	},
	type: {
		type: String,
		required: true,
	},
});

mongoose.model("Token", tokenSchema);
