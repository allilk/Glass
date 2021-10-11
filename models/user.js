let mongoose = require("mongoose"),
  bcrypt = require("bcrypt"),
  Schema = mongoose.Schema;

let UserSchema = new Schema({
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
  recipes: [{
    type: Schema.Types.ObjectId,
    ref: "Recipe",
    required: true,
  }],
  id: {
    type: String,
    unique: true,
    required: true,
  },
  refreshToken: {
    type: String,
  }
});

UserSchema.methods.comparePassword = function (password) {
  return bcrypt.compareSync(password, this.hash_password);
};

mongoose.model("User", UserSchema);
