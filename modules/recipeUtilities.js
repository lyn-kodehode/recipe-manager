// RECIPE UTILITIES MODULE
// This module contains sorting, filtering, and utility functions

// SORT FUNCTIONS (RADIO BUTTONS)
export const ascendingOrder = (recipesArray) =>
  [...recipesArray].sort((a, b) => a.name.localeCompare(b.name));

export const descendingOrder = (recipesArray) =>
  [...recipesArray].sort((a, b) => b.name.localeCompare(a.name));

// export const byTime = (recipesArray) =>
//   [...recipesArray].sort((a, b) => a.cookTimeMinutes - b.cookTimeMinutes);

// export const numServings = (recipesArray) =>
//   [...recipesArray].sort((a, b) => a.servings - b.servings);

// RANDOMIZER
export const randomizer = (recipes) =>
  recipes[Math.floor(Math.random() * recipes.length)];

// FILTER FUNCTIONS

// filter by maximum calories
export const filterByCalories = (recipesArray, maxCalories) =>
  recipesArray.filter((recipe) => recipe.caloriesPerServing <= maxCalories);

// filter by maximum cooking time
export const filterByCookTime = (recipesArray, maxTime) =>
  recipesArray.filter((recipe) => recipe.cookTimeMinutes <= maxTime);

// filter completed saved recipes
export const filterCompleted = (recipesArray) =>
  recipesArray.filter((recipe) => recipe.completed === true);

// filter incompleted saved recipes
export const filterIncomplete = (recipesArray) =>
  recipesArray.filter((recipe) => recipe.completed === false);

// Filter by both calories AND cooking time
export const filterByCaloriesAndTime = (recipesArray, maxCalories, maxTime) =>
  recipesArray
    .filter((recipe) => recipe.caloriesPerServing <= maxCalories)
    .filter((recipe) => recipe.cookTimeMinutes <= maxTime);

// FUTURE FEATURES (commented out until needed):
// Filter by difficulty level (add UI for this later)
// export const filterByDifficulty = (recipesArray, difficulty) => {
//   return recipesArray.filter(recipe =>
//     recipe.difficulty.toLowerCase() === difficulty.toLowerCase()
//   );
// };

// Filter by meal type (add UI for this later)
// export const filterByMealType = (recipesArray, mealType) => {
//   return recipesArray.filter(recipe =>
//     recipe.mealType.some(type =>
//       type.toLowerCase().includes(mealType.toLowerCase())
//     )
//   );
// };
