// STORES AND LOADS TO AND FROM LOCAL STORAGE MODULE

// loads saved myRecipes from local storage if they exist
export const loadMyData = () => {
  const myStoredRecipes = localStorage.getItem("myStoredRecipes");

  if (myStoredRecipes) {
    return JSON.parse(myStoredRecipes);
  } else {
    return [];
  }
};

// loads saved allRecipes from local storage if they exist
// export const storedAllRecipes = localStorage.getItem("allRecipes");
//   if (storedAllRecipes) {
//     allRecipes = JSON.parse(storedAllRecipes);
//   }

// saves myRecipes to local storage
export const saveMyRecipes = (recipesArray) => {
  localStorage.setItem("myStoredRecipes", JSON.stringify(recipesArray));
};

// saves allRecipes to local storage
// export const saveAllRecipes = () => {
//   localStorage.setItem("allRecipes", JSON.stringify(allRecipes));
// };
