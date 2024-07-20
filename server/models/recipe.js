import { Schema as _Schema, model } from "mongoose";

const Schema = _Schema;

const recipeSchema = new Schema({
  title: { type: String, required: true },
  ingredients: [{ type: String, required: true }],
  instructions: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
});

const Recipe = model("Recipe", recipeSchema);

module.exports = Recipe;
