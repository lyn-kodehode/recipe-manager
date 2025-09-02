// API SERVICE MODULE
// handles all online recipe fetching and transformations

const APP_URL = "https://www.themealdb.com/api/json/v1/1/search.php";

// API request to fetch online recipes
export const getRecipesOnline = async (searchFor) => {
  if (!searchFor) {
    console.error(`Search cannot be empty.`);
    return [];
  }
  try {
    const response = await fetch(`${APP_URL}?s=${searchFor}`);
    if (!response.ok) {
      throw new Error(`HTTP error status: ${response.status}`);
    }
    const data = await response.json();

    // Check if data.meals exists and is an array
    if (data && data.meals && Array.isArray(data.meals)) {
      return data.meals;
    } else if (Array.isArray(data)) {
      return data;
    } else {
      throw new Error("No recipes found");
    }
  } catch (error) {
    console.error("Error fetching recipes: ", error);
    // always return an empty array so code doesn't break
    return [];
  }
};

// transforms mealDB into recipes.json format
export const transformOneRecipe = (oneRecipe) => {
  const ingredients = [];
  let instructions = [];

  for (let i = 1; i <= 20; i++) {
    const ingredient = oneRecipe[`strIngredient${i}`];
    const measure = oneRecipe[`strMeasure${i}`];

    // If ingredient exists AND if it has content after trimming and not just spaces
    // ingredient.trim() !== ""
    if (ingredient && ingredient.trim()) {
      // measure && measure.trim() or returns empty string
      ingredients.push(`${measure?.trim() || ""} ${ingredient.trim()}`.trim());
    }
  }

  if (oneRecipe.strInstructions) {
    // removes "STEP" + any number + dash/colon
    let cleanText = oneRecipe.strInstructions.replace(
      /STEP\s*\d+\s*[-:]?\s*/gi,
      ""
    );

    // splits by line breaks
    // filters by length, removes short strings
    // trims and returns trimmed array
    instructions = cleanText
      .split(/\r\n|\r|\n|\t/)
      .filter((step) => step.trim().length > 5)
      .map((step) => step.trim());
  }

  // 5min per step
  const estimatedCookTime = instructions.length * 5;
  // roughly from 15-120 mins per recipe
  const cookTimeMinutes = Math.min(Math.max(estimatedCookTime, 15), 120);

  return {
    id: parseInt(oneRecipe.idMeal),
    name: oneRecipe.strMeal,
    ingredients: ingredients,
    instructions: instructions,
    cookTimeMinutes: cookTimeMinutes,
    difficulty: "Medium",
    mealType: [oneRecipe.strCategory],
    caloriesPerServing: 400,
    servings: 4,
    cuisine: oneRecipe.strArea,
    image: oneRecipe.strMealThumb,
  };
};

export const transformRecipes = (recipesArray) =>
  recipesArray.map((recipe) => transformOneRecipe(recipe));
