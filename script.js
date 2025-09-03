// IMPORTS
import {
  loadLocalData,
  searchRecipesLocal,
} from "./modules/localDataService.js";
import {
  randomizer,
  ascendingOrder,
  descendingOrder,
  filterCompleted,
  filterIncomplete,
  filterByCaloriesAndTime,
} from "./modules/recipeUtilities.js";
import { loadMyData, saveMyRecipes } from "./modules/storageService.js";
import { getRecipesOnline, transformRecipes } from "./modules/apiService.js";

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
  const calorieSlider = document.getElementById("calorie-range");
  const calorieLabel = document.querySelector("label[for='calorie-range']");
  const cooktimeSlider = document.getElementById("cooktime-range");
  const cooktimeLabel = document.querySelector("label[for='cooktime-range']");
  const rangeSliders = document.querySelectorAll('input[type="range"]');

  let myRecipes = loadMyData();
  let allRecipes = [];
  let completedRecipes = [];
  let incompleteRecipes = [];

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
    console.log(`Previous page: ${previousSectionId}`);
    console.log(`Current page: ${currentSectionId}`);
  }

  // LOADS LANDING SECTION INITIALLY
  showSection("welcome-section");

  // DASHBOARD UPDATER
  const updateDashboard = () => {
    savedDash.textContent = myRecipes.length;
    completedDash.textContent = filterCompleted(myRecipes).length;
  };

  // dashboard initial function call
  updateDashboard();

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

  // // CLOSE RECIPE BUTTON
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
      saveMyRecipes(myRecipes);
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
        saveMyRecipes(myRecipes);
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
      saveMyRecipes(myRecipes);
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

  console.log("Functions check:", {
    saveMyRecipes: typeof saveMyRecipes,
    updateDashboard: typeof updateDashboard,
    completedCheckbox: typeof completedCheckbox,
  });

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

  // DISPLAYS ALL RECIPE CARDS
  const showAllCards = (recipesArray, targetSectionContainer) => {
    targetSectionContainer.replaceChildren();
    recipesArray.forEach((recipe) => {
      targetSectionContainer.appendChild(createRecipeCard(recipe));
    });
  };

  // MAIN PROGRAM AFTER JSON LOADS
  const mainProgram = async () => {
    // completedRecipes = filterCompleted(myRecipes);
    // incompleteRecipes = filterIncomplete(myRecipes);
    let localRecipes = [];

    // loads local json data
    try {
      localRecipes = await loadLocalData();
      console.log("Loaded local recipes:", localRecipes.length);
      console.log("First local recipe:", localRecipes[0]);

      // copies local data to allRecipes array for initial data loading
      allRecipes = [...localRecipes];
      // console.log("allRecipes after initialization:", allRecipes.length);
    } catch (error) {
      console.error("Failed to load local recipes:", error);
    }

    // fetches api data first then local json data if not permitted
    const searchHandler = async (searchTerm) => {
      // searches local recipes for the search term
      const localResults = searchRecipesLocal(localRecipes, searchTerm);
      console.log(`Local "${searchTerm}" results:`, localResults.length);

      try {
        // gets online recipes for the search term
        const onlineRecipes = await getRecipesOnline(searchTerm);
        console.log(
          `Raw online "${searchTerm}" results:`,
          onlineRecipes.length
        );

        // transforms online results to match local data
        const transformedOnlineRecipes = transformRecipes(onlineRecipes);
        console.log(
          `Transformed online results:`,
          transformedOnlineRecipes.length
        );

        // pulls results after lcoal data search
        allRecipes = [...localResults];

        // loops through transformed online recipes if it exists or not
        transformedOnlineRecipes.forEach((onlineRecipe) => {
          const recipeExists = allRecipes.some(
            (localRecipe) =>
              localRecipe.name.toLowerCase() === onlineRecipe.name.toLowerCase()
          );

          if (!recipeExists) {
            allRecipes.push(onlineRecipe);
          }
        });

        console.log(`Final online + local results:`, allRecipes.length);
        return allRecipes;
      } catch (error) {
        // console.log(`Error combining results:`, error);
        console.log(`Only local results:`, localResults.length);
        // if online fails, just return local search results
        return localResults;
      }
    };

    // SEARCH INPUT EVENT
    // Try online first, fallback to local if online fails
    searchForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      showSection("all-cards-section");

      const searchTerm = searchInput.value.trim();
      if (!searchTerm) {
        allCardsContainer.textContent = `Search cannot be empty.`;
        return;
      }
      allCardsContainer.textContent = `Searching for ${searchTerm} recipes...`;

      // gets combined local+online results via searchHandler()
      allRecipes = await searchHandler(searchTerm);
      // allCardsContainer.textContent = `Found ${recipes.length} recipes for ${searchTerm}`;

      // Show results
      allCardsContainer.replaceChildren();
      if (allRecipes.length > 0) {
        showAllCards(allRecipes, allCardsContainer);
      }
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

      if (allRecipes.length === 0) {
        allCardsContainer.textContent = "Discover recipes by searching.";
      } else {
        showAllCards(allRecipes, allCardsContainer);
      }
    });

    // RANDOM RECIPE link
    randomRecipeLink.addEventListener("click", function (event) {
      event.preventDefault();
      showSection("random-recipe-section");
      showAllCards([randomizer(allRecipes)], randomRecipeContainer);
    });

    // MY RECIPES link
    myRecipesLink.addEventListener("click", (event) => {
      event.preventDefault();
      showSection("my-recipe-cards-section");
      incompleteRecipes = filterIncomplete(myRecipes);
      showAllCards(incompleteRecipes, myRecipesContainer);

      if (incompleteRecipes.length === 0) {
        myRecipesContainer.textContent = "Check your completed recipes.";
      }
      if (myRecipes.length === 0) {
        myRecipesContainer.textContent = "No recipes saved";
      }
    });

    // COMPLETED RECIPES link
    completedLink.addEventListener("click", (event) => {
      event.preventDefault();
      showSection("completed-recipes-section");
      completedRecipes = filterCompleted(myRecipes);
      showAllCards(completedRecipes, completedRecipesContainer);

      if (completedRecipes.length === 0) {
        completedRecipesContainer.textContent = "No recipes completed.";
      }
    });

    // RADIO BUTTONS event
    radioButtons.forEach((radio) => {
      radio.addEventListener("change", (event) => {
        completedRecipes = filterCompleted(myRecipes);
        incompleteRecipes = filterIncomplete(myRecipes);
        if (currentSectionId === "all-cards-section") {
          radioSelectionHandler(event, allCardsContainer, allRecipes);
        } else if (currentSectionId === "completed-recipes-section") {
          radioSelectionHandler(
            event,
            completedRecipesContainer,
            completedRecipes
          );
        } else if (currentSectionId === "my-recipe-cards-section") {
          radioSelectionHandler(event, myRecipesContainer, incompleteRecipes);
        }
      });
    });

    // all sliders
    rangeSliders.forEach((slider) => {
      slider.addEventListener("input", (event) => {
        event.preventDefault();
        const calorieValue = calorieSlider.value;
        calorieLabel.textContent = `Calories (${calorieValue}):`;
        const cooktimeValue = cooktimeSlider.value;
        cooktimeLabel.textContent = `Cooking times in (${cooktimeValue}) mins:`;
        if (currentSectionId === "all-cards-section") {
          const withinCaloriesAndTime = filterByCaloriesAndTime(
            allRecipes,
            calorieValue,
            cooktimeValue
          );
          showAllCards(withinCaloriesAndTime, allCardsContainer);
        } else if (currentSectionId === "my-recipe-cards-section") {
          incompleteRecipes = filterIncomplete(myRecipes);
          const withinCaloriesAndTime = filterByCaloriesAndTime(
            incompleteRecipes,
            calorieValue,
            cooktimeValue
          );
          showAllCards(withinCaloriesAndTime, myRecipesContainer);
        } else {
          completedRecipes = filterCompleted(myRecipes);
          const withinCaloriesAndTime = filterByCaloriesAndTime(
            completedRecipes,
            calorieValue,
            cooktimeValue
          );

          showAllCards(withinCaloriesAndTime, completedRecipesContainer);
        }
      });
    });
  };

  mainProgram();
});
