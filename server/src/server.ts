import * as dotenv from "dotenv";
import express, { Request, Response } from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import Redis from "ioredis";
import Recipe from "./models/recipe";

dotenv.config();

// Initialize server and dependencies
const app = express();
const port = process.env.PORT || 5000;
const redis = new Redis(process.env.REDIS_URI || "redis://localhost:6379");

// Middleware
app.use(cors({ origin: "*" }));
app.use(bodyParser.json());

// MongoDB Connection
if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI is not defined in environment variables");
}
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Utility Functions
const clearRecipeCache = async () => {
  try {
    await redis.del("recipes:*");
  } catch (err) {
    console.error("Redis cache clear error:", err);
  }
};

// Routes

// Health Check
app.get("/health", async (_req, res) => {
  try {
    const mongoStatus =
      mongoose.connection.readyState === 1 ? "Healthy" : "Unhealthy";
    const redisPing = await redis.ping();
    const redisStatus = redisPing === "PONG" ? "Healthy" : "Unhealthy";

    res.status(200).json({
      mongoStatus,
      redisStatus,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
    });
  } catch (error: any) {
    res
      .status(500)
      .json({ error: "Health check failed", details: error.message });
  }
});

// Create a Recipe
app.post("/recipes", async (req: Request, res: Response) => {
  try {
    const newRecipe = new Recipe(req.body);
    await newRecipe.save();
    await clearRecipeCache();
    res.status(201).json(newRecipe);
  } catch (error) {
    console.error("Error creating recipe:", error);
    res.status(400).json({
      error: "Failed to create recipe",
      details: (error as any).message,
    });
  }
});

// Fetch Paginated Recipes with Filters
app.get("/recipes", async (req: Request, res: Response) => {
  const { page = 1, pageSize = 10 } = req.query;

  const search = typeof req.query.search === "string" ? req.query.search : "";
  const difficulty = typeof req.query.difficulty === "string" ? req.query.difficulty : "";

  const query: any = {};
  if (difficulty) query.difficulty = { $regex: new RegExp(difficulty, "i") };
  if (search) query.title = { $regex: new RegExp(search, "i") };

  console.log("Constructed Query:", query);

  try {
    const results = await Recipe.aggregate([
      { $match: query },
      {
        $facet: {
          recipes: [
            { $sort: { title: 1 } },
            { $skip: (Number(page) - 1) * Number(pageSize) },
            { $limit: Number(pageSize) },
            {
              $project: {
                title: 1,
                ingredients: 1,
                utensils: 1,
                difficulty: 1,
                "total time": 1,
              },
            },
          ],
          totalCount: [{ $count: "count" }],
        },
      },
    ]);

    const recipes = results[0]?.recipes || [];
    const totalRecipes = results[0]?.totalCount[0]?.count || 0;
    const totalPages = Math.ceil(totalRecipes / Number(pageSize));

    res.json({ recipes, totalRecipes, totalPages, currentPage: page });
  } catch (error) {
    console.error("Error fetching recipes:", error);
    res.status(500).json({ error: "Failed to fetch recipes", details: (error as any).message });
  }
});




// Fetch a Single Recipe by ID
app.get("/recipes/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid recipe ID format" });
  }

  try {
    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }
    res.json(recipe);
  } catch (error) {
    console.error("Error fetching recipe by ID:", error);
    res.status(500).json({
      error: "Failed to fetch recipe",
      details: (error as any).message,
    });
  }
});

// Update a Recipe by ID
app.put("/recipes/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const updatedRecipe = await Recipe.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedRecipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }
    await clearRecipeCache();
    res.json(updatedRecipe);
  } catch (error) {
    console.error("Error updating recipe:", error);
    res.status(400).json({
      error: "Failed to update recipe",
      details: (error as any).message,
    });
  }
});

// Delete a Recipe by ID
app.delete("/recipes/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const deletedRecipe = await Recipe.findByIdAndDelete(id);
    if (!deletedRecipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }
    await clearRecipeCache();
    res.json({ message: "Recipe deleted successfully" });
  } catch (error) {
    console.error("Error deleting recipe:", error);
    res.status(500).json({
      error: "Failed to delete recipe",
      details: (error as any).message,
    });
  }
});

// Start Server
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
