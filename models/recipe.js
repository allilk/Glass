let mongoose = require("mongoose"),
	Schema = mongoose.Schema;

let RecipeSchema = new Schema({
	name: {
		type: String,
		trim: true,
		required: true,
	},
	image: {
		type: String,
	},
	ingredients: [
		{
			name: {
				type: String,
				required: true,
			},
			amount: {
				type: String,
				required: true,
			},
			measure: {
				type: String,
				required: true,
			},
		},
	],
	steps: {
		type: String,
		required: true,
	},
	details: {
		created_by: {
			type: Schema.Types.ObjectId,
			ref: "User",
		},
		created: {
			type: Date,
			default: Date.now,
		},
		// updated_by: {
		//   type: Schema.Types.ObjectId,
		//   ref: "User",
		// },
		updated_last: {
			type: Date,
			default: Date.now,
		},
		category: {
			type: String,
		},
		alcoholic: {
			type: Boolean,
			default: false,
		}
	},
	id: {
		type: String,
		unique: true,
		required: true,
	},
});

mongoose.model("Recipe", RecipeSchema, "recipes");
