const mongoose = require("mongoose"),
	Schema = mongoose.Schema;

const ingredientSchema = new Schema({
	name: {
		type: String,
		trim: true,
		required: true,
	},
	id: {
		type: String,
		unique: true,
		required: true,
	},
});

mongoose.model("Recipe", ingredientSchema);
