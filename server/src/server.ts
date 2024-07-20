import * as dotenv from "dotenv";
import * as path from "path";
import express from "express";
import * as mongoose from "mongoose";
import * as bodyParser from "body-parser";
import cors from "cors";
import * as admin from "firebase-admin";
import { Request, Response, NextFunction } from "express";

dotenv.config();

if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  throw new Error(
    "FIREBASE_SERVICE_ACCOUNT_KEY is not defined in the environment variables"
  );
}
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
const serviceAccount = require(path.resolve(serviceAccountPath));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI is not defined in the environment variables");
}

const uri = process.env.MONGO_URI;
mongoose
  .connect(uri)
  .then(() =>
    console.log("MongoDB database connection established successfully")
  )
  .catch((err) => console.error("Could not connect to MongoDB...", err));

// Extend the Request interface to include user
interface AuthenticatedRequest extends Request {
  user?: admin.auth.DecodedIdToken;
}

// Middleware to check Firebase ID token
const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).send("Unauthorized");
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).send("Unauthorized");
  }
};

import Recipe from "./models/recipe";
app.post("/recipes", authenticate, async (req:AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).send('Unauthorized');
  }
  const newRecipe = new Recipe({ ...req.body, userId: req.user.uid });
  try {
    await newRecipe.save();
    res.status(201).send(newRecipe);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get("/recipes", async (req: Request, res: Response) => {
  try {
    const recipes = await Recipe.find();
    res.status(200).send(recipes);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/recipes/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
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

app.put("/recipes/:id", authenticate, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).send('Unauthorized');
  }
  const { id } = req.params;
  try {
    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return res.status(404).send("Recipe not found");
    }
    if (recipe.userId !== req.user.uid) {
      return res.status(403).send("Forbidden");
    }
    const updatedRecipe = await Recipe.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.status(200).send(updatedRecipe);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.delete("/recipes/:id", authenticate, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).send('Unauthorized');
  }
  const { id } = req.params;
  try {
    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return res.status(404).send("Recipe not found");
    }
    if (recipe.userId !== req.user.uid) {
      return res.status(403).send("Forbidden");
    }
    await Recipe.findByIdAndDelete(id);
    res.status(200).send("Recipe deleted");
  } catch (error) {
    res.status(500).send(error);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
