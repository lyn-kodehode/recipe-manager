// DISPLAYS AND UPDATES REAL TIME
const showDateTime = () => {
  // new instance of Date class
  const now = new Date();
  // customized output
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
  // console.log(now.toLocaleString("en-US", customDate));
};
// updates time and date every second (1000ms)
setInterval(showDateTime, 1000);
// initial timeDate function call
showDateTime();
// **************************************************
// DOM CONTENT LOADS
document.addEventListener("DOMContentLoaded", () => {
  const allSections = document.querySelectorAll("section");
  // const welcomeSection = document.getElementById("welcome-section");
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
  // const dashContainer = document.getElementById("dashboard-container");
  const savedDash = document.getElementById("saved-dash");
  const completedDash = document.getElementById("completed-dash");

  let allRecipes = [];
  let myRecipes = [];

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
    console.log(`Previous page: ${previousSectionId}`);
    console.log(`Current page: ${currentSectionId}`);
  }

  // LOADS LANDING SECTION INITIALLY
  showSection("welcome-section");
  // updateDashboard();

  // LOADS JSON FILE FROM LOCAL FOLDER
  function loadJsonData() {
    return fetch("./recipes.json")
      .then((response) => response.json())
      .then((data) => {
        allRecipes = Array.isArray(data) ? data : data.recipes;
        // saveAllrecipes();
        return allRecipes;
      })
      .catch((error) => console.error("Error loading JSON:", error));
  }

  // DASHBOARD UPDATER
  const updateDashboard = () => {
    savedDash.textContent = myRecipes.length;
    completedDash.textContent = myRecipes.filter(
      (recipe) => recipe.completed
    ).length;
  };

  // dashboard function call
  updateDashboard();

  // SEARCH INPUT FUNCTION
  const searchRecipes = (recipesArray, searchTerm) => {
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
  };

  // SORT ALLRECIPES
  const ascendingOrder = (recipesArray) => {
    return [...recipesArray].sort((a, b) => a.name.localeCompare(b.name));
  };

  const descendingOrder = (recipesArray) => {
    return [...recipesArray].sort((a, b) => b.name.localeCompare(a.name));
  };

  const byTime = (recipesArray) => {
    return [...recipesArray].sort((a, b) => {
      return a.cookTimeMinutes - b.cookTimeMinutes;
    });
  };

  const numServings = (recipesArray) => {
    return [...recipesArray].sort((a, b) => {
      return a.servings - b.servings;
    });
  };

  // RADIO BUTTON HANDLER
  const radioSelectionHandler = (
    event,
    targetSectionVariable,
    sectionId,
    recipesArray
  ) => {
    showSection(sectionId);
    targetSectionVariable.replaceChildren();
    if (event.target.value === "ascending") {
      showAllCards(ascendingOrder(recipesArray), targetSectionVariable);
    } else if (event.target.value === "descending") {
      showAllCards(descendingOrder(recipesArray), targetSectionVariable);
    } else if (event.target.value === "by-time") {
      showAllCards(byTime(recipesArray), targetSectionVariable);
    } else if (event.target.value === "num-servings") {
      showAllCards(numServings(recipesArray), targetSectionVariable);
    } else {
      return;
    }
  };

  // RANDOMIZER
  const randomizer = (recipes) => {
    return recipes[Math.floor(Math.random() * recipes.length)];
  };

  // RANDOM RECIPE SECTION
  // DISPLAYS A RANDOM FULL RECIPE
  const showRandomRecipe = (recipes) => {
    randomRecipeContainer.replaceChildren();
    const randomRecipe = randomizer(recipes);
    randomRecipeContainer.appendChild(createRecipeCard(randomRecipe));
  };

  // THERE IS A BUG IN THIS BUTTON --fixed :)
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

    if (alreadySaved) {
      saveBtn.textContent = "Saved";
      saveBtn.disabled = true;
      saveBtn.classList.add("save-success");
    } else {
      saveBtn.textContent = "Save Recipe";
      saveBtn.addEventListener("click", () => {
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
      checkDeleteSaveDiv.append(
        deleteRecipeButton(recipe),
        completedCheckbox(recipe)
      );
    } else {
      checkDeleteSaveDiv.append(saveRecipeButton(recipe));
    }
    checkDeleteSaveDiv.style.display = "flex";
    checkDeleteSaveDiv.style.gap = "1.5rem";
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
    // buttonsDiv.appendChild(closeRecipeButton());
    // buttonsDiv.appendChild(printRecipeButton());
    // buttonsDiv.appendChild(buttonDecider(recipe));
    buttonsDiv.append(
      closeRecipeButton(),
      printRecipeButton(),
      buttonDecider(recipe)
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
      // buttonDecider(),
      showRecipeBtn
    );
    // currentPage.append(recipeCard);
    return recipeCard;
  };

  // ALL CARDS SECTION
  // DISPLAYS ALL RECIPE CARDS
  const showAllCards = (recipesArray, targetSectionVariable) => {
    targetSectionVariable.replaceChildren();
    // currentPage.replaceChildren();
    recipesArray.forEach((recipe) => {
      targetSectionVariable.appendChild(createRecipeCard(recipe));
    });
  };

  // MAIN PROGRAM AFTER JSON LOADS
  loadJsonData().then((allRecipes) => {
    // loadJsonData().then(() => {
    homeLink.addEventListener("click", function (event) {
      event.preventDefault();
      showSection("welcome-section");
      // updateDashboard();
    });

    allRecipesLink.addEventListener("click", function (event) {
      event.preventDefault();
      showSection("all-cards-section");
      // (array, sectionVariable)
      showAllCards(allRecipes, allCardsContainer);
    });

    randomRecipeLink.addEventListener("click", function (event) {
      event.preventDefault();
      showSection("random-recipe-section");
      // (array, sectionVariable)
      showRandomRecipe(allRecipes, randomRecipeContainer);
      // showAllCards([randomizer(allRecipes)], randomRecipeContainer);
    });

    myRecipesLink.addEventListener("click", (event) => {
      event.preventDefault();
      showSection("my-recipe-cards-section");
      // (array, sectionVariable)

      const incompleteRecipes = myRecipes.filter((recipe) => !recipe.completed);
      showAllCards(incompleteRecipes, myRecipesContainer);

      // showAllCards(myRecipes, myRecipesContainer);
      if (myRecipes.length === 0) {
        myRecipesContainer.textContent = "No recipes saved";
      }
      console.log(myRecipes);
    });

    completedLink.addEventListener("click", (event) => {
      event.preventDefault();
      showSection("completed-recipes-section");

      const completedRecipes = myRecipes.filter((recipe) => recipe.completed);
      showAllCards(completedRecipes, completedRecipesContainer);

      // savedDash.textContent = myRecipes.length;
      //     completedDash.textContent = myRecipes.filter(
      //       (recipe) => recipe.completed
      //     ).length;
    });

    radioButtons.forEach((radio) => {
      // radio.addEventListener("change", radioSelectionHandler);
      radio.addEventListener("change", () => {
        /*   if (currentSectionId === 'all-cards-section'){
        } else{

        } */
        radioSelectionHandler(
          event,
          allCardsContainer,
          currentSectionId,
          allRecipes
        );
        radioSelectionHandler(
          event,
          myRecipesContainer,
          currentSectionId,
          myRecipes
        );
      });
    });

    // button type=submit
    searchForm.addEventListener("submit", (event) => {
      event.preventDefault();
      showSection("all-cards-section");
      const searchTerm = searchInput.value;
      // console.log(`You typed: ${searchTerm}`);

      if (!searchTerm) return;

      const searchResults = searchRecipes(allRecipes, searchTerm);

      allCardsContainer.replaceChildren();
      if (searchResults.length > 0) {
        showAllCards(searchResults, allCardsContainer);
      } else {
        allCardsContainer.textContent = `No recipes found for ${searchTerm}`;
      }

      console.log(searchResults);
    });

    // console.log(allRecipes);
  });
});
