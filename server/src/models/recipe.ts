import * as mongoose from "mongoose";

const Schema = mongoose.Schema;

const recipeSchema = new Schema({
  title: { type: String, required: true },
  ingredients: [{ type: String, required: true }],
  instructions: { type: [String], required: true },
  description: { type: String, required: false },
  total_time: { type: String, required: false },
  prep_time: { type: String, required: false },
  difficulty: { type: String, required: false },
  url: { type: String, required: false },
  saturated_fat: { type: String, required: false },
  fat: { type: String, required: false },
  calories: { type: String, required: false },
  carbohydrate: { type: String, required: false },
  sugar: { type: String, required: false },
  fiber: { type: String, required: false },
  protein: { type: String, required: false },
  cholesterol: { type: String, required: false },
  sodium: { type: String, required: false },
  utensils: { type: String, required: false },
});

const Recipe = mongoose.model("Recipe", recipeSchema);

export default Recipe;
