import mongoose from "mongoose";
import Recipe from "./models/recipe";
import dotenv from "dotenv";

dotenv.config();

const debugIngredients = async () => {
    try {
        const recipes = await Recipe.find();
        for (const recipe of recipes) {
            console.log(`Inspecting recipe: ${recipe.title}`);

            const transformedIngredients = recipe.ingredients.flatMap((ingredient: any, index: number) => {
                if (Array.isArray(ingredient)) {
                    console.log("It is an array");
                    if (ingredient.length === 1) {
                        // Handle single-element arrays
                        return {
                            name: ingredient[0]?.trim() || "unknown",
                            quantity: 0,
                            measurement: "unknown",
                        };
                    } else if (ingredient.length > 1) {
                        // Handle regular array tuple
                        const [rawAmountMeasurement, rawName] = ingredient;
                        if (!rawAmountMeasurement || !rawName) {
                            console.warn(`Invalid tuple at index ${index} in recipe "${recipe.title}"`);
                            return undefined;
                        }
            
                        const [quantity, ...measurementParts] = rawAmountMeasurement.split(" ");
                        return {
                            name: rawName.trim() || "unknown",
                            quantity: parseFloat(quantity) || 0,
                            measurement: measurementParts.join(" ").trim() || "unknown",
                        };
                    }
                } else if (typeof ingredient === "string") {
                    console.log("It is a standalone string:", ingredient);
                    // Handle standalone strings
                    return {
                        name: ingredient.trim() || "unknown",
                        quantity: 0,
                        measurement: "unknown",
                    };
                } else if (typeof ingredient === "object" && ingredient !== null) {
                    // Convert Mongoose document to plain object
                    const plainIngredient = ingredient.toObject ? ingredient.toObject() : ingredient;
            
                    console.log("It is an object:", plainIngredient);
                    if ("0" in plainIngredient && "1" in plainIngredient) {
                        const rawAmountMeasurement = plainIngredient["0"];
                        const rawName = plainIngredient["1"];
            
                        if (!rawAmountMeasurement || !rawName) {
                            console.warn(`Invalid keyed object at index ${index} in recipe "${recipe.title}"`);
                            return undefined;
                        }
            
                        const [quantity, ...measurementParts] = rawAmountMeasurement.split(" ");
                        return {
                            name: rawName.trim() || "unknown",
                            quantity: parseFloat(quantity) || 0,
                            measurement: measurementParts.join(" ").trim() || "unknown",
                        };
                    }
            
                    // Assume normalized format
                    return {
                        name: plainIngredient.name?.trim() || "unknown",
                        quantity: plainIngredient.quantity || 0,
                        measurement: plainIngredient.measurement?.trim() || "unknown",
                    };
                } else {
                    console.warn(`Unexpected ingredient format in recipe "${recipe.title}" at index ${index}:`, ingredient);
                    return undefined;
                }
            }).filter((ingredient): ingredient is NonNullable<typeof ingredient> => ingredient !== undefined); // Filter undefined
            
            recipe.ingredients = new mongoose.Types.DocumentArray(transformedIngredients);
            await recipe.save();
            

            recipe.ingredients = new mongoose.Types.DocumentArray(transformedIngredients);
            await recipe.save();
            console.log(`Updated ingredients for recipe: ${recipe.title}`);
        }
        console.log("Inspection completed.");
    } catch (error) {
        console.error("Error during inspection:", error);
    } finally {
        mongoose.disconnect();
    }
};

const main = async () => {
    try {
        const mongoURI = process.env.MONGO_URI;
        if (!mongoURI) {
            throw new Error("MONGO_URI is not defined in environment variables");
        }
        await mongoose.connect(mongoURI);
        console.log("Connected to MongoDB");

        await debugIngredients();
    } catch (error) {
        console.error("Error connecting to MongoDB or inspecting data:", error);
    }
};

main();
