// LOCAL DATA FETCHING AND SEARCHING MODULE

let localData = [];

// LOADS JSON FILE FROM LOCAL FOLDER
export const loadLocalData = async () => {
  try {
    const response = await fetch("./recipes.json");
    const data = await response.json();
    localData = Array.isArray(data) ? data : data.recipes;
    return localData;
  } catch (error) {
    console.error("Error loading JSON: ", error);
    return [];
  }
};

// SEARCH LOCAL RECIPES FUNCTION
export const searchRecipesLocal = (recipesArray, searchTerm) => {
  const lowerCaseTerm = searchTerm.toLowerCase().trim();
  return recipesArray.filter((recipe) => {
    const nameSearch = recipe.name.toLowerCase().includes(lowerCaseTerm);
    const ingredientsSearch = recipe.ingredients
      .join(" ")
      .toLowerCase()
      .includes(lowerCaseTerm);
    const instructionsSearch = recipe.instructions
      .join(" ")
      .toLowerCase()
      .includes(lowerCaseTerm);
    return nameSearch || ingredientsSearch || instructionsSearch;
    // additional search todo: cuisine[], tags[], mealType[]
  });
};

// COMBINED FUNCTION - FUTURE USE
// export const loadAndSearchLocal = async (searchTerm) => {
//   if (!localData.length) {
//     // loads if not cached already
//     await loadLocalData();
//   }
//   return searchRecipesLocal(localData, searchTerm);
// };
