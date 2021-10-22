const mongoose = require("mongoose"),
	Schema = mongoose.Schema;

const bcrypt = require("bcrypt");

const userSchema = new Schema({
	fullName: {
		type: String,
		trim: true,
		required: true,
	},
	email: {
		type: String,
		unique: true,
		lowercase: true,
		trim: true,
		required: true,
	},
	hash_password: {
		type: String,
	},
	created: {
		type: Date,
		default: Date.now,
	},
	recipes: [
		{
			type: Schema.Types.ObjectId,
			ref: "Recipe",
			required: true,
		},
	],
	id: {
		type: String,
		unique: true,
		required: true,
	},
	refreshToken: {
		type: String,
	},
});

userSchema.methods.comparePassword = function (password) {
	return bcrypt.compareSync(password, this.hash_password);
};

mongoose.model("User", userSchema);
