const APP_URL = "https://www.themealdb.com/api/json/v1/1/search.php";
const searchInput = document.getElementById("search-input");
const searchForm = document.getElementById("search-form");

// global recipe array variable
let recipesOnline = [];
let transformedRecipes = [];

const getRecipesOnline = async (searchFor = "beef") => {
  try {
    const response = await fetch(`${APP_URL}?s=${searchFor}`);
    // console.log("Response: ", response);
    if (!response.ok) {
      throw new Error(`HTTP error status: ${response.status}`);
    }
    const data = await response.json();
    // console.log("Data: ", data);
    if (Array.isArray(data)) {
      recipesOnline = data;
    }
    // empty array so code doesn't break
    else {
      recipesOnline = data.meals;
      if (!recipesOnline.length) {
        throw new Error("No recipes found");
      }
      // console.log('Recipes found:',recipesOnline);
      // recipesOnline.length varies depending on the search term
      return recipesOnline;
    }
  } catch (error) {
    console.error("Error fetching recipes: ", error);
    // always return an empty array so code doesn't break
    return [];
  }
};
// getRecipesOnline();

// transforms mealDB into recipes.json format
const transformOneRecipe = (oneRecipe) => {
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

// COPY to  local folder function
// data = the recipe array you pass in
// null = replacer function (we don't need one, so null)
// 2 = number of spaces for indentation (makes it pretty and readable)
const copyToLocal = (dataToCopy) => {
  const jsonString = JSON.stringify(dataToCopy, null, 2);

  //  navigator.clipboard = browser API for clipboard access
  // .writeText() = method to write text to clipboard
  // .then() = what to do if copying succeeds (it's a Promise)
  navigator.clipboard
    .writeText(jsonString)
    .then(() => {
      console.log("✅ JSON copied to clipboard!");
      window.alert(
        "Recipe data copied to clipboard! You can paste it into a file."
      );
    })
    .catch((error) => {
      console.error("Failed to copy: ", error);
      window.alert("❌ Failed to copy to clipboard");
    });
};

// SEARCH INPUT FUNCTION
// set event function as async so we can use await
// this returns the actual data instead of promise
searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const searchTerm = searchInput.value.trim();
  // if searchinput is empty, return
  if (!searchTerm) return;

  // remember to use await when calling an async function
  recipesOnline = await getRecipesOnline(searchTerm);
  // console.log("Recipes found:", recipesOnline);

  // .map() returns a new array
  // .forEach() returns undefined
  transformedRecipes = recipesOnline.map((onlineRecipe) =>
    transformOneRecipe(onlineRecipe)
  );
  console.log(`MealDBRecipes transformed: `, transformedRecipes);
  // console.log(transformedRecipes[0].ingredients);
  // console.log(transformedRecipes[0].instructions);

  // option to copy fetched JSON to local folder
  // copyToLocal(recipesOnline);
});
