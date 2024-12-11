import axios from 'axios';
const API_BASE_URL = process.env.API_BASE_URL;

interface recipe {
  title: string;
  ingredients: string[];
  instructions: string[];
  description?: string;
  total_time?: string;
  prep_time?: string;
  difficulty?: string;
  url?: string;
  saturated_fat?: string;
  fat?: string;
  calories?: string;
  carbohydrate?: string;
  sugar?: string;
  fiber?: string;
  protein?: string;
  cholesterol?: string;
  sodium?: string;
  utensils?: string;
}

export const getRecipes = async (
  newPage: number,
  pageSize: number,
  searchTerm: string,
  difficulty: string,
  ingredient: string,
) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/recipes`, {
      params: {
        page: newPage,
        pageSize,
        search: searchTerm,
        difficulty,
        ingredient,
      },
    });
    return response.data;
  } catch (error) {
    console.error("API Error:");
    throw error;
  }
};

export const createRecipe = async (recipe: recipe) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/recipes`, recipe);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateRecipe = async (id: string, recipe: recipe) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/recipes/${id}`, recipe);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteRecipe = async (id: string) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/recipes/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getRecipeById = async (id: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/recipes/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// const mockRecipes = [
//   { id: '1', title: 'Mock Recipe 1', ingredients: ['Ingredient 1', 'Ingredient 2'], instructions: 'Mock instructions 1' },
//   { id: '2', title: 'Mock Recipe 2', ingredients: ['Ingredient A', 'Ingredient B'], instructions: 'Mock instructions 2' },
// ];

// //Mock Functions
// export const createRecipe = async (recipe: {title: string; ingredients:string[]; instructions: string}) => {
//   const newRecipe = {...recipe, id: (mockRecipes.length + 1).toString()};
//   mockRecipes.push(newRecipe);
//   console.log('Recipe Created: ',newRecipe);
//   return newRecipe
// };

// export const getRecipes = async () => {
//   console.log('Fetching recipes');
//   return mockRecipes
// };

// export const updateRecipe = async(id: string, recipe:{title:string;ingredients:string[];instructions:string}) => {
//   const index = mockRecipes.findIndex((r) => r.id === id);
//   if (index === -1) throw new Error ('Recipe not found');
//   mockRecipes[index] = {...recipe, id};
//   console.log('Recipe updated: ', mockRecipes[index]);
//   return mockRecipes[index];
// };

// export const deleteRecipe = async(id:string) => {
//   const index = mockRecipes.findIndex((r) => r.id ===id);
//   if(index === -1) throw new Error('Recipe not found');
//   const deletedRecipe = mockRecipes.splice(index, 1)[0];
//   return deleteRecipe;
// };

// export const getRecipeById = async(id:string) => {
//   const recipe = mockRecipes.find((r) => r.id === id);
//   console.log('Fetched recipe by ID:', recipe);
//   if (recipe === undefined) throw new Error('Recipe not found');
//   return recipe;
// };
