#!/user/bin/env node
/*
?Shebang or Hashbang (#!) is the first line of the file
 which tells the OS which interpreter to use.
*/
import axios from "axios";
import chalk from "chalk";
import inquirer from "inquirer";
import gradient from "gradient-string";
import chalkAnimation from "chalk-animation";
import figlet from "figlet";
import { createSpinner } from "nanospinner";

const gameData = {
  //? Hold the player name
  playerName: "",
  //? All available categories
  categories: [
    {
      id: "9",
      category: "General Knowledge",
    },
    {
      id: "11",
      category: "Film",
    },
    {
      id: "21",
      category: "Sports",
    },
    {
      id: "15",
      category: "Games",
    },
    {
      id: "18",
      category: "Computer Science",
    },
    {
      id: "23",
      category: "History",
    },
  ],
  //? Hold question's category
  selectedCategoryId: "",
  //? Hold game level
  selectedLevel: "Easy",
  //? Hold question's amount
  amountOfQuestions: 5,
  //? Hold all questions loaded
  questionsList: [],
};

/**
 * @purpose - Sleep for  a specified amount of time
 * @param {*} ms - The value to sleep in  milliseconds
 */
const sleep = (ms = 2000) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * ? Display animated welcome message to the player
 */
async function welcome() {
  const rainbowTitle = chalkAnimation.rainbow("Who Want To Be A Millionaire?");

  await sleep();
  rainbowTitle.stop();

  console.log(`
  ${chalk.bgBlue("How To Play")}
  I am a process on your computer.
  If you get any question wrong I will be ${chalk.bgRed("killed")}
  So get all the question right...
  `);
}

async function askName() {
  const answer = await inquirer.prompt({
    name: "player_name",
    type: "input",
    message: "What is your name?",
    default() {
      return "Anonymous";
    },
  });

  gameData.playerName = answer.player_name;
}

async function chooseCategory() {
  const availableCategories = gameData.categories.map(
    (entry) => entry.category
  );
  //? Prompt player with categories
  const playerAnswer = await promptPlayer(
    "category",
    "Choose a category?",
    availableCategories
  );

  //? Get the selected category id
  gameData.categories.forEach((entry) => {
    if (entry.category == playerAnswer) {
      gameData.selectedCategoryId = entry.id;
    }
  });
}

/**
 * @purpose - Load questions from the third party API and save them in the questions list.
 */
async function loadQuestions() {
  try {
    //? Send GET request to opentdb.com to get a list of questions.
    const response = await axios.get(
      `https://opentdb.com/api.php?amount=${gameData.amountOfQuestions}&category=${gameData.selectedCategoryId}&difficulty=easy&type=multiple`
    );

    //? Check if the response is successful
    if (response.data.response_code === 0) {
      //* Loop over the data coming from the API response.
      response.data.results.forEach(async (entry) => {
        //* Add the correct answer to the incorrect_answers array and shuffle it
        const choices = prepareAnswers(
          entry.incorrect_answers,
          entry.correct_answer
        );

        //? Push the question in the list
        gameData.questionsList.push({
          //* The question text
          question: entry.question,
          //* All available answers
          choices,
          //* Complete answer text
          answerText: entry.correct_answer,
        });
      });
    } else {
      throw new Error();
    }
  } catch (error) {
    console.log(
      chalk.red(
        `Sorry ${gameData.playerName}, no questions available right now!`
      )
    );
    console.log(chalk.blueBright("Please come back soon."));

    //! End the response.
    process.exit(1);
  }
}

/**
 * @purpose - Concatenate all answers together and shuffle them.
 * @param {array} incorrectAnswers - All question's incorrect answers
 * @param {string} correctAnswer - Question's correct answer.
 * @returns Array of all choices
 */
function prepareAnswers(incorrectAnswers, correctAnswer) {
  let choices = [...incorrectAnswers, correctAnswer];
  choices = choices.sort((a, b) => 0.5 - Math.random());
  return choices;
}

/**
 * @purpose - Display all questions to the player and handle his answers
 * @returns true if the player won the game, false otherwise.
 */
async function play() {
  //? Ensure that there is available questions
  if (gameData.questionsList) {
    for (let counter = 0; counter < gameData.questionsList.length; counter++) {
      const entry = gameData.questionsList[counter];

      console.log("Answer: ", chalk.red(entry.answerText));

      //* The id of the question (used to get player input later)
      let questionName = `question_${counter}`;

      //? Prompt player with question
      const playerAnswer = await promptPlayer(
        questionName,
        entry.question,
        Object.values(entry.choices)
      );

      //? Check the answer
      const isCorrect = await handleAnswer(playerAnswer, entry.answerText);

      //! If the answer is Incorrect, the player is loser 💔
      if (!isCorrect) return false;
    }

    //? Indicate that the player is winner. 🥇🏆
    return true;
  } else {
    console.log(
      chalk.bgRed(
        `Sorry ${gameData.playerName}, no questions available right now.`
      )
    );
    return process.exit(1);
  }
}

/**
 * @purpose - Prompt the player with the question and all available answers.
 * @param {string} name - The id of the question
 * @param {string} message - The question text
 * @param {array} choices - All available answers.
 * @returns Player answer
 */
async function promptPlayer(name, message, choices) {
  const answer = await inquirer.prompt({
    name,
    type: "list",
    message,
    choices,
  });

  return answer[name];
}

/**
 * @purpose - Check if the player answer is correct or not.
 * @param {string} playerAnswer
 * @param {string} questionAnswer
 * @returns true if the answer is correct, false otherwise
 */
async function handleAnswer(playerAnswer, questionAnswer) {
  const spinner = createSpinner("Checking answer...").start();
  await sleep();
  if (playerAnswer == questionAnswer) {
    spinner.success({ text: `Nice work ${gameData.playerName}.` });
    //? Indicate that the player answer is correct. 👌🏻
    return true;
  } else {
    spinner.error({ text: `Game Over, you lose ${gameData.playerName}!` });
    //? Indicate that the player answer is Incorrect. ❌❌
    return false;
  }
}

/**
 *? Display Winning ascii representation to the player.
 */
function winner() {
  console.clear();
  const msg =
    `Congrats, ${gameData.playerName} !\n $ 1, 0 0 0 , 0 0 0 for you`.toUpperCase();

  figlet(msg, (err, data) => {
    if (!err) {
      console.log(gradient.pastel.multiline(data));

      console.log(
        chalk.blueBright(
          "\n\nProgramming isn't about what you know; it's about making the command line look cool!"
        )
      );
    }
  });
}

/**
 *! Display Losing ascii representation to the player.
 */
function loser() {
  console.clear();
  const msg = `oops, ${gameData.playerName} !\n you are loser`.toUpperCase();

  figlet(msg, (err, data) => {
    if (!err) {
      console.log(gradient.pastel.multiline(data));
    }
  });
}

/**
 * ? Run the Game
 */
async function runGame() {
  await welcome(); //? Greeting message
  await askName(); //? Ask for the player name
  await chooseCategory();
  await loadQuestions(); //? Load questions from the API

  const win = await play(); //? Start the game

  //* Check if the player won the game
  if (win) {
    winner();
  } else {
    loser();
  }
}

//? Start the game process
runGame();
