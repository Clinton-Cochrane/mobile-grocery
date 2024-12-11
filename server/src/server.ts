import * as dotenv from "dotenv";
import express from "express";
import * as mongoose from "mongoose";
import * as bodyParser from "body-parser";
import cors from "cors";
import { Request, Response } from "express";
import Recipe from "./models/recipe";
import Redis from "ioredis";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const redis = new Redis(process.env.REDIS_URI || "redis://172.21.251.178:6379");

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
    redis.del("recipes:*");
    res.status(201).send(newRecipe);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get("/health", async (req, res) => {
  try {
    const mongoStatus =
      mongoose.connection.readyState === 1 ? "Healthy" : "Unhealthy";
    const redisPing = await redis.ping();
    const redisStatus = redisPing === "PONG" ? "Healthy" : "Unhealthy";

    res.status(200).json({
      mongoStatus,
      redisStatus,
      uptime: process.uptime(), // Server uptime
      memoryUsage: process.memoryUsage(),
    });
  } catch (error: any) {
    res
      .status(500)
      .json({ error: "Health check failed", details: error.message });
  }
});

app.get("/recipes", async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 20;
    const searchTerm = typeof req.query.search === 'string' ? req.query.search : '';
    const baseQuery = {
      ...(req.query.difficulty && { difficulty: req.query.difficulty }),
      ...(req.query.search && { title: { $regex: new RegExp(searchTerm, 'i') } }),


    };
    const cacheKey = `recipes:page=${page}&size=${pageSize}&query=${JSON.stringify(baseQuery)}`;
    // const cachedData = await redis.get(cacheKey).catch((err) => {
    //   console.error("Redis error:", err);
    //   return null; // Fallback to fetching from MongoDB
    // });

    //   if (cachedData) {
    //     console.log("Serving from cache");
    //     return res.json(JSON.parse(cachedData));
    //   }

    const lastId = req.query.lastId || null;
    console.log("Base Query:", baseQuery);

    const results = await Recipe.aggregate([
      { $match: baseQuery },
      {
        $facet: {
          recipes: [
            { $sort: { title: 1 } },
            { $skip: (page - 1) * pageSize },
            { $limit: pageSize },
            {
              $project: {
                title: 1,
                ingredients: 1,
                utensils: 1,
                difficulty: 1,
                'total time': 1,
              },
            },
          ],
          totalCount: [{ $count: "count" }],
        },
      },
    ]);

    const recipes = results[0]?.recipes || [];
    const globalTotalRecipes = results[0]?.totalCount[0]?.count || 0;
    const globalTotalPages = Math.ceil(globalTotalRecipes / pageSize);
    const lastRecipeId = recipes.length
      ? recipes[recipes.length - 1]._id
      : null;

    // redis.set(
    //   cacheKey,
    //   JSON.stringify({
    //     recipes,
    //     globalTotalRecipes,
    //     globalTotalPages,
    //     lastRecipeId,
    //   }),
    //   "EX",
    //   3600
    // ); // Cache for 1 hour
    res.json({
      recipes,
      globalTotalRecipes,
      globalTotalPages,
      currentPage: page,
      isLastPage: page >= globalTotalPages,
      lastRecipeId,
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
      await redis.del("recipes:*");
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
      await redis.del("recipes:*");
      res.status(200).send("Recipe deleted");
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
