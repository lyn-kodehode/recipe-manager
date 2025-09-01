// SHOW REAL DATE/TIME
const showDateTime = () => {
  const now = new Date();
  const customDate = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };
  const timeContainer = document.getElementById("time-container");
  timeContainer.textContent = now.toLocaleString("en-US", customDate);
};
setInterval(showDateTime, 1000);
showDateTime();
// **************************************************
// DOM CONTENT LOADS
document.addEventListener("DOMContentLoaded", () => {
  const allSections = document.querySelectorAll("section");
  const allCardsContainer = document.getElementById("all-cards-section");
  const fullRecipesContainer = document.getElementById("full-recipes-section");
  const myRecipesContainer = document.getElementById("my-recipe-cards-section");
  const randomRecipeContainer = document.getElementById(
    "random-recipe-section"
  );
  const completedRecipesContainer = document.getElementById(
    "completed-recipes-section"
  );
  const completedLink = document.getElementById("completed-recipes-link");
  const homeLink = document.getElementById("home-link");
  const allRecipesLink = document.getElementById("all-recipes-link");
  const randomRecipeLink = document.getElementById("random-recipe-link");
  const myRecipesLink = document.getElementById("my-recipes-link");
  const radioButtons = document.querySelectorAll('input[name="sort"]');
  const searchForm = document.getElementById("search-form");
  const searchInput = document.getElementById("search-input");
  const savedDash = document.getElementById("saved-dash");
  const completedDash = document.getElementById("completed-dash");
  // const rangeSliders = document.querySelectorAll('input[type="range]');
  const calorieSlider = document.getElementById("calorie-range");
  const calorieLabel = document.querySelector("label[for='calorie-range']");
  const cooktimeSlider = document.getElementById("cooktime-range");
  const cooktimeLabel = document.querySelector("label[for='cooktime-range']");
  const rangeSliders = document.querySelectorAll('input[type="range"]');
  // const checkboxForm = document.getElementById("checkbox-form");
  const APP_URL = "https://www.themealdb.com/api/json/v1/1/search.php";

  let allRecipes = [];
  let myRecipes = [];
  let transformedRecipes = [];

  // LOAD recipes from local storage if they exist
  const storedMyRecipes = localStorage.getItem("myRecipes");
  if (storedMyRecipes) {
    myRecipes = JSON.parse(storedMyRecipes);
  }
  /* const storedAllRecipes = localStorage.getItem("allRecipes");
  if (storedAllRecipes) {
    allRecipes = JSON.parse(storedAllRecipes);
  } */

  // SAVES TO LOCAL STORAGE
  const saveMyRecipes = () => {
    localStorage.setItem("myRecipes", JSON.stringify(myRecipes));
  };
  /*   const saveAllrecipes = () => {
    localStorage.setItem("allRecipes", JSON.stringify(allRecipes));
  }; */

  // SECTION TRACKER FUNCTION
  let currentSectionId = "welcome-section";
  let previousSectionId = null;

  function showSection(sectionId) {
    // hides all sections
    allSections.forEach((section) => (section.style.display = "none"));
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
      // retrieves the dataset display value on HTML or use 'flex' as an option
      const displayType = targetSection.dataset.display || "flex";
      targetSection.style.display = displayType;
      // saves the previous section
      previousSectionId = currentSectionId;
      // updates the currebt section
      currentSectionId = sectionId;
    }
    // console.log(`Previous page: ${previousSectionId}`);
    // console.log(`Current page: ${currentSectionId}`);
  }

  // LOADS LANDING SECTION INITIALLY
  showSection("welcome-section");

  // LOADS JSON FILE FROM LOCAL FOLDER
  /*  async function loadJsonData() {
    try {
      const response = await fetch("./recipes.json");
      const data = await response.json();
      allRecipes = Array.isArray(data) ? data : data.recipes;
      return allRecipes;
    } catch (error) {
      console.error("Error loading JSON: ", error);
      return [];
    }
  } */

  // API request
  const getRecipesOnline = async (searchFor) => {
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
      if (Array.isArray(data)) {
        allRecipes = data;
      }
      // empty array so code doesn't break
      else {
        allRecipes = data.meals;
        if (!allRecipes.length) {
          throw new Error("No recipes found");
        }
        // console.log('Recipes found:',allRecipes);
        return allRecipes;
      }
    } catch (error) {
      console.error("Error fetching recipes: ", error);
      // always return an empty array so code doesn't break
      return [];
    }
  };

  // DASHBOARD UPDATER
  const updateDashboard = () => {
    savedDash.textContent = myRecipes.length;
    completedDash.textContent = myRecipes.filter(
      (recipe) => recipe.completed
    ).length;
  };

  // dashboard initial function call
  updateDashboard();

  // SEARCH FUNCTION when using local JSON
  /*   const searchRecipesLocal = (recipesArray, searchTerm) => {
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
      // search: cuisine[], tags[], mealType[]
    });
  }; */

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
        ingredients.push(
          `${measure?.trim() || ""} ${ingredient.trim()}`.trim()
        );
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

  // SORT FUNCTIONS
  const ascendingOrder = (recipesArray) =>
    [...recipesArray].sort((a, b) => a.name.localeCompare(b.name));

  const descendingOrder = (recipesArray) =>
    [...recipesArray].sort((a, b) => b.name.localeCompare(a.name));

  const byTime = (recipesArray) =>
    [...recipesArray].sort((a, b) => a.cookTimeMinutes - b.cookTimeMinutes);

  const numServings = (recipesArray) =>
    [...recipesArray].sort((a, b) => a.servings - b.servings);

  // RADIO BUTTON HANDLER
  const radioSelectionHandler = (
    event,
    targetSectionContainer,
    recipesArray
  ) => {
    targetSectionContainer.replaceChildren();
    if (event.target.value === "ascending") {
      showAllCards(ascendingOrder(recipesArray), targetSectionContainer);
    } else if (event.target.value === "descending") {
      showAllCards(descendingOrder(recipesArray), targetSectionContainer);
    } else if (event.target.value === "by-time") {
      showAllCards(byTime(recipesArray), targetSectionContainer);
    } else if (event.target.value === "num-servings") {
      showAllCards(numServings(recipesArray), targetSectionContainer);
    } else {
      return;
    }
  };

  // RANDOMIZER
  const randomizer = (recipes) => {
    return recipes[Math.floor(Math.random() * recipes.length)];
  };

  // CLOSE RECIPE BUTTON
  const closeRecipeButton = () => {
    const closeBtn = document.createElement("button");
    closeBtn.classList.add("close-btn");
    closeBtn.textContent = "Close";
    closeBtn.addEventListener("click", () => {
      if (previousSectionId) {
        showSection(previousSectionId);
      } else {
        // default landing page
        showSection("welcome-section");
      }
    });
    return closeBtn;
  };

  // PRINT RECIPE BUTTON
  const printRecipeButton = () => {
    const printBtn = document.createElement("button");
    printBtn.classList.add("print-btn");
    printBtn.textContent = "Print Recipe";
    printBtn.addEventListener("click", () => {
      window.print();
    });
    return printBtn;
  };

  // DELETE BUTTON
  const deleteRecipeButton = (recipe) => {
    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("delete-btn");
    deleteBtn.textContent = "Delete Recipe";

    deleteBtn.addEventListener("click", () => {
      myRecipes = myRecipes.filter(
        (savedRecipe) => savedRecipe.name !== recipe.name
      );
      saveMyRecipes();
      updateDashboard();
      showAllCards(myRecipes, myRecipesContainer);
      if (myRecipes.length === 0) {
        myRecipesContainer.textContent = "No recipes saved";
      }
      window.alert(`${recipe.name} deleted!`);
    });
    return deleteBtn;
  };

  // SAVE RECIPE BUTTON`
  const saveRecipeButton = (recipe) => {
    const saveBtn = document.createElement("button");
    const alreadySaved = myRecipes.some(
      (savedRecipe) => savedRecipe.name === recipe.name
    );

    saveBtn.classList.add("save-btn");

    if (alreadySaved) {
      saveBtn.classList.remove("save-btn");
      saveBtn.textContent = "Saved";
      saveBtn.disabled = true;
      saveBtn.classList.add("save-success");
    } else {
      saveBtn.textContent = "Save Recipe";
      saveBtn.addEventListener("click", () => {
        saveBtn.classList.remove("save-btn");
        // this creates a new object + completed key:value
        myRecipes.push({ ...recipe, completed: false });
        saveMyRecipes();
        updateDashboard();
        saveBtn.textContent = "Saved";
        saveBtn.disabled = true;
        saveBtn.classList.add("save-success");
        window.alert(`${recipe.name} saved!`);
      });
    }
    return saveBtn;
  };

  // COMPLETED CHECKBOX
  const completedCheckbox = (recipe) => {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = recipe.completed;
    checkbox.addEventListener("change", () => {
      recipe.completed = checkbox.checked;
      saveMyRecipes();
      updateDashboard();
    });
    return checkbox;
  };

  // BUTTON DECIDER
  const buttonDecider = (recipe) => {
    const checkDeleteSaveDiv = document.createElement("div");
    checkDeleteSaveDiv.classList.add("check-delete-save-div");
    if (
      previousSectionId === "my-recipe-cards-section" ||
      previousSectionId === "completed-recipes-section"
    ) {
      // ***
      checkDeleteSaveDiv.style.display = "flex";
      checkDeleteSaveDiv.style.gap = "1.5rem";
      // ***
      checkDeleteSaveDiv.append(
        completedCheckbox(recipe),
        deleteRecipeButton(recipe)
      );
    } else {
      checkDeleteSaveDiv.append(saveRecipeButton(recipe));
    }
    return checkDeleteSaveDiv;
  };

  // CREATES A FULL RECIPE ARTICLE
  const createFullRecipe = (recipe) => {
    fullRecipesContainer.replaceChildren();

    const recipeArticle = document.createElement("article");
    recipeArticle.classList.add("recipe-article");
    const leftDiv = document.createElement("div");
    leftDiv.classList.add("left-div");
    const recipeImg = document.createElement("img");
    recipeImg.classList.add("recipe-image");
    recipeImg.src = recipe.image;
    recipeImg.style.height = "400px";
    leftDiv.appendChild(recipeImg);

    const rightDiv = document.createElement("div");
    rightDiv.classList.add("right-div");
    const recipeInfoDiv = document.createElement("div");
    recipeInfoDiv.classList.add("recipe-info-div");
    const ingredientsDiv = document.createElement("div");
    ingredientsDiv.classList.add("ingredients-div");
    const insructionsDiv = document.createElement("div");
    insructionsDiv.classList.add("insructions-div");

    const recipeName = document.createElement("h3");
    recipeName.textContent = recipe.name;
    const ingredientsTitle = document.createElement("h4");
    ingredientsTitle.textContent = "Ingredients:";
    const ingredientsList = document.createElement("ul");
    ingredientsList.classList.add("ingredients-list");
    recipe.ingredients.forEach((ingredient) => {
      const ingredientItem = document.createElement("li");
      ingredientItem.textContent = ingredient;
      ingredientsList.appendChild(ingredientItem);
    });

    const instructionsTitle = document.createElement("h4");
    instructionsTitle.textContent = "Instructions:";
    const recipeInstructions = document.createElement("p");
    recipeInstructions.textContent = recipe.instructions.join(" ");

    const buttonsDiv = document.createElement("div");
    buttonsDiv.classList.add("buttons-div");
    buttonsDiv.append(
      buttonDecider(recipe),
      printRecipeButton(),
      closeRecipeButton()
    );

    ingredientsDiv.append(ingredientsTitle, ingredientsList);
    insructionsDiv.append(instructionsTitle, recipeInstructions);
    recipeInfoDiv.append(ingredientsDiv, insructionsDiv);
    rightDiv.append(recipeName, recipeInfoDiv, buttonsDiv);

    recipeArticle.append(leftDiv, rightDiv);
    fullRecipesContainer.appendChild(recipeArticle);
    // return recipeArticle;
  };

  // BUILDS A RECIPE CARD
  const createRecipeCard = (recipe) => {
    const recipeCard = document.createElement("article");
    recipeCard.classList.add("recipe-card");
    const imgCard = document.createElement("img");
    imgCard.loading = "lazy";
    imgCard.classList.add("image-card");
    imgCard.src = recipe.image;
    const nameCard = document.createElement("h3");
    nameCard.textContent = recipe.name;
    const difficultyLevel = document.createElement("p");
    difficultyLevel.textContent = recipe.difficulty;
    difficultyLevel.classList.add("difficulty");
    const mealTypeCard = document.createElement("p");
    mealTypeCard.classList.add("meal-type");
    mealTypeCard.textContent = recipe.mealType.join(", ");

    const mealInfoDiv = document.createElement("div");
    mealInfoDiv.classList.add("meal-info-div");
    const minDiv = document.createElement("div");
    minDiv.classList.add("min-div");
    const cookingTime = document.createElement("h4");
    cookingTime.textContent = recipe.cookTimeMinutes;
    const minutes = document.createElement("p");
    minutes.textContent = "Min";

    const calDiv = document.createElement("div");
    calDiv.classList.add("cal-div");
    const calories = document.createElement("h4");
    calories.textContent = recipe.caloriesPerServing;
    const kCal = document.createElement("p");
    kCal.textContent = "Kcal";

    const servDiv = document.createElement("div");
    servDiv.classList.add("serv-div");
    const servings = document.createElement("h4");
    servings.textContent = recipe.servings;
    const persons = document.createElement("p");
    persons.textContent = "Serv";
    persons.classList.add("persons");

    // SHOW FULLRECIPE BUTTON
    const showRecipeBtn = document.createElement("div");
    showRecipeBtn.id = "show-recipe-btn";
    showRecipeBtn.textContent = "Show Recipe";
    showRecipeBtn.addEventListener("click", () => {
      showSection("full-recipes-section");
      createFullRecipe(recipe);
    });

    servDiv.append(servings, persons);
    calDiv.append(calories, kCal);
    minDiv.append(cookingTime, minutes);
    mealInfoDiv.append(minDiv, calDiv, servDiv);
    recipeCard.append(
      imgCard,
      nameCard,
      difficultyLevel,
      mealTypeCard,
      mealInfoDiv,
      showRecipeBtn
    );
    console.log(recipe.image);
    return recipeCard;
  };

  // ALL CARDS SECTION
  // DISPLAYS ALL RECIPE CARDS
  const showAllCards = (recipesArray, targetSectionContainer) => {
    targetSectionContainer.replaceChildren();
    recipesArray.forEach((recipe) => {
      targetSectionContainer.appendChild(createRecipeCard(recipe));
    });
  };

  // MAIN PROGRAM AFTER JSON LOADS
  const mainProgram = async () => {
    try {
      allRecipes = await getRecipesOnline();

      // SEARCH event
      searchForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        showSection("all-cards-section");
        const searchTerm = searchInput.value.trim();

        // if (!searchTerm) return;
        if (!searchTerm) {
          allCardsContainer.textContent = `Search cannot be empty.`;
          return;
        }

        allCardsContainer.textContent = `Searching online for ${searchTerm} recipes`;

        try {
          allRecipes = await getRecipesOnline(searchTerm);
          transformedRecipes = allRecipes.map((oneRecipe) =>
            transformOneRecipe(oneRecipe)
          );
          // console.log(`MealDBRecipes transformed: `, transformedRecipes);
          showSection("all-cards-section");
          if (transformedRecipes.length > 0) {
            showAllCards(transformedRecipes, allCardsContainer);
          } else {
            allCardsContainer.textContent = `No recipes found for ${searchTerm}. Try searching chicken, pasta...`;
          }
        } catch (error) {
          console.error("Search failed: ", error);
          allCardsContainer.textContent = `Search failed. Please try again.`;
        }

        // SEARCH using local JSON
        /* const searchResults = searchRecipesLocal(allRecipes, searchTerm);
        allCardsContainer.replaceChildren();
        if (searchResults.length > 0) {
          showAllCards(searchResults, allCardsContainer);
        } else {
          allCardsContainer.textContent = `No recipes found for ${searchTerm}`;
        } */
      });

      // HOME link
      homeLink.addEventListener("click", function (event) {
        event.preventDefault();
        showSection("welcome-section");
      });

      // ALL RECIPES link
      allRecipesLink.addEventListener("click", function (event) {
        event.preventDefault();
        showSection("all-cards-section");

        // showAllCards(allRecipes, allCardsContainer);
        showAllCards(transformedRecipes, allCardsContainer);
        if (transformedRecipes.length === 0) {
          allCardsContainer.textContent = "Discover recipes by searching.";
        }
      });

      // RANDOM RECIPE link
      randomRecipeLink.addEventListener("click", function (event) {
        event.preventDefault();
        showSection("random-recipe-section");
        // showRandomRecipe(allRecipes, randomRecipeContainer);
        // showAllCards([randomizer(allRecipes)], randomRecipeContainer);
        showAllCards([randomizer(transformedRecipes)], randomRecipeContainer);
      });

      // MY RECIPES link
      myRecipesLink.addEventListener("click", (event) => {
        event.preventDefault();
        showSection("my-recipe-cards-section");
        // (array, sectionVariable)

        const incompleteRecipes = myRecipes.filter(
          (recipe) => !recipe.completed
        );

        showAllCards(incompleteRecipes, myRecipesContainer);
        if (incompleteRecipes.length === 0) {
          myRecipesContainer.textContent = "Check your completed recipes.";
        }
        if (myRecipes.length === 0) {
          myRecipesContainer.textContent = "No recipes saved";
        }
        // console.log(myRecipes);
      });

      // COMPLETED RECIPES link
      completedLink.addEventListener("click", (event) => {
        event.preventDefault();
        showSection("completed-recipes-section");

        const completedRecipes = myRecipes.filter((recipe) => recipe.completed);

        showAllCards(completedRecipes, completedRecipesContainer);
        if (completedRecipes.length === 0) {
          completedRecipesContainer.textContent = "No recipes completed.";
        }
      });

      // RADIO BUTTONS event
      radioButtons.forEach((radio) => {
        radio.addEventListener("change", (event) => {
          if (currentSectionId === "all-cards-section") {
            // recipesArray = allRecipes;
            recipesArray = transformedRecipes;
            targetSectionContainer = allCardsContainer;
            radioSelectionHandler(event, targetSectionContainer, recipesArray);
          } else if (currentSectionId === "completed-recipes-section") {
            recipesArray = myRecipes.filter((recipe) => recipe.completed);
            targetSectionContainer = completedRecipesContainer;
            radioSelectionHandler(event, targetSectionContainer, recipesArray);
          } else if (currentSectionId === "my-recipe-cards-section") {
            recipesArray = myRecipes.filter((recipe) => !recipe.completed);
            targetSectionContainer = myRecipesContainer;
            radioSelectionHandler(event, targetSectionContainer, recipesArray);
          }
        });
      });

      // calorie slider
      /*    const currentValue = calorieSlider.value;
      console.log(currentValue);
      calorieSlider.addEventListener("input", (event) => {
        event.preventDefault();
        const newValue = calorieSlider.value;
        // console.log(newValue);
        const withinCalories = myRecipes
          .filter((recipe) => !recipe.completed)
          .filter((recipe) => recipe.caloriesPerServing <= newValue);
        calorieLabel.textContent = `Calories (${newValue}):`;
        console.log(withinCalories);
      }); */

      // cooktimeSlider.addEventListener("input", (event) => {
      //   event.preventDefault();
      //   // cooktimeSlider
      //   // cooktimeLabel.textContent = `Cooking times in (${minutes}) mins:`;
      //   console.log(event.target);
      // });

      // all sliders
      // works only on myRecipes Section
      rangeSliders.forEach((slider) => {
        slider.addEventListener("input", (event) => {
          event.preventDefault();
          // console.log(event.target.id);
          if (event.target.id === "calorie-range") {
            // console.log("this is calorie range");
            // const currentValue = calorieSlider.value;
            // console.log(currentValue);
            const newValue = calorieSlider.value;
            // console.log(newValue);
            const withinCalories = myRecipes
              .filter((recipe) => !recipe.completed)
              .filter((recipe) => recipe.caloriesPerServing <= newValue);
            calorieLabel.textContent = `Calories (${newValue}):`;
            // console.log(withinCalories);
            showAllCards(withinCalories, myRecipesContainer);
          }
          // (event.target.id === 'cooktime-range')
          else {
            // console.log("this is cooking time range");
            // const currentValue = cooktimeSlider.value;
            // console.log(currentValue);
            const newValue = cooktimeSlider.value;
            cooktimeLabel.textContent = `Cooking times in (${newValue}) mins:`;
            const withinMinutes = myRecipes
              .filter((recipe) => !recipe.completed)
              .filter((recipe) => recipe.cookTimeMinutes <= newValue);
            calorieLabel.textContent = `Calories (${newValue}):`;
            // console.log(withinMinutes);
            showAllCards(withinMinutes, myRecipesContainer);
          }
        });
      });
    } catch (error) {
      console.error("Failed to run the program: ", error);
    }
  };

  mainProgram();
});
