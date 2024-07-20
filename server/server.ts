import path from "path";
import admin from "firebase-admin";
import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";

import Recipe from "./models/recipe";
require("dotenv").config();

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

app.post("/recipes", async (req, res) => {
  const newRecipe = new Recipe(req.body);
  try {
    await new Recipe.save();
    res.status(201).send(newRecipe);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get("/recipes", async (req, res) => {
  try {
    const recipes = await Recipe.find();
    res.status(200).send(recipes);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/recipes/:id", async (req, res) => {
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

app.put("/recipes/:id", async (req, res) => {
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

app.delete("recipes/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deletedRecipe = await Recipe.findByIdAndDelete(id);
    if (!deletedRecipe) {
      res.status(404).send("Recipe not found");
    } else {
      res.status(200).send("Recipe Deleted");
    }
  } catch (error) {
    res.send(500).send(error);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
