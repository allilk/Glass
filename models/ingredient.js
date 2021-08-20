let mongoose = require("mongoose"),
  Schema = mongoose.Schema;

let IngredientSchema = new Schema({
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

mongoose.model("Recipe", IngredientSchema);
