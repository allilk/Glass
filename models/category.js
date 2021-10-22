const mongoose = require("mongoose"),
	Schema = mongoose.Schema;

const categorySchema = new Schema({
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

mongoose.model("Category", categorySchema, "categories");
