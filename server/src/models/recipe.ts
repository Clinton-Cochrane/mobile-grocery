import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

const recipeSchema = new Schema({
  title: { type: String, required: true },
  ingredients: [{ type: String, required: true }],
  instructions: { type: [String], required: true },
  created_at: { type: Date, default: Date.now },
});

const Recipe = mongoose.model('Recipe', recipeSchema);

export default Recipe;
