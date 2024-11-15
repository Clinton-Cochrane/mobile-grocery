import * as dotenv from "dotenv";
import express from "express";
import * as mongoose from "mongoose";
import * as bodyParser from "body-parser";
import cors from "cors";
import { Request, Response } from "express";
import Recipe from "./models/recipe";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({ origin: "*" }));
app.use(bodyParser.json());

if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI is not defined in the environment variables");
}

const uri = process.env.MONGO_URI;
mongoose
  .connect(uri!)
  .then(() =>
    console.log("MongoDB database connection established successfully")
  )
  .catch((err) => console.error("Could not connect to MongoDB...", err));

app.post("/recipes", async (req: Request, res: Response) => {
  const newRecipe = new Recipe({ ...req.body });
  try {
    await newRecipe.save();
    res.status(201).send(newRecipe);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get("/recipes", async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      pageSize = 20,
      search = "",
      difficulty,
      ingredient,
      currentLetter,
    } = req.query;
    const query: any = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    //currentLetter
    if (currentLetter) {
      query.title = { $regex: `^${currentLetter}`, $options: "i" };
    }

    //difficulty filter
    if (difficulty) {
      query.difficulty = difficulty;
    }

    // Ingredient filter (check if ingredient exists in the ingredients array)
    if (ingredient) {
      query.ingredients = { $in: [ingredient] };
    }

    const recipes = await Recipe.find(query)
      .sort({ title: 1 })
      .skip((+page - 1) * +pageSize)
      .limit(+pageSize);
    const totalRecipes = await Recipe.countDocuments(query);
    res.json({
      recipes,
      totalRecipes,
      totalPages: Math.ceil(totalRecipes / +pageSize),
      currentPage: +page,
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/recipes/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  // Check if the provided id is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid recipe ID format" });
  }

  try {
    const recipe = await Recipe.findById(id);
    if (!recipe) {
      res.status(404).send("Recipe not found");
    } else {
      res.status(200).send(recipe);
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

app.put("/recipes/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const updatedRecipe = await Recipe.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedRecipe) {
      res.status(404).send("Recipe not found");
    } else {
      res.status(200).send(updatedRecipe);
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

app.delete("/recipes/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const recipe = await Recipe.findByIdAndDelete(id);
    if (!recipe) {
      res.status(404).send("Recipe not found");
    } else {
      res.status(200).send("Recipe deleted");
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
