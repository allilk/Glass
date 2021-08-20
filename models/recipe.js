let mongoose = require("mongoose"),
  Schema = mongoose.Schema;

let RecipeSchema = new Schema({
  title: {
    type: String,
    trim: true,
    required: true,
  },
  ingredients: {
    amount: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    }
  },
  steps: {
    type: String,
    required: true,
  },
  details: {
    created_by: {
      type: String,
    },
    created: {
      type: Date,
      default: Date.now,
    },
    updated_by: {
      type: String,
    },
    updated_last: {
      type: Date,
      default: Date.now,
    },
  },
  id: {
    type: String,
    unique: true,
    required: true,
  },
});

mongoose.model("Recipe", RecipeSchema);
