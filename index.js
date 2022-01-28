#!/user/bin/env node
/*
?Shebang or Hashbang (#!) is the first line of the file
 which tells the OS which interpreter to use.
*/
import dotenv from "dotenv";
dotenv.config();
import axios from "axios";
import chalk from "chalk";
import inquirer from "inquirer";
import gradient from "gradient-string";
import chalkAnimation from "chalk-animation";
import figlet from "figlet";
import { createSpinner } from "nanospinner";

let playerName;
let questionsList = [];
const sleep = (ms = 2000) => new Promise((resolve) => setTimeout(resolve, ms));

async function welcome() {
  const rainbowTitle = chalkAnimation.rainbow(
    "Who Want To Be A JavaScript Millionaire?"
  );

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

  playerName = answer.player_name;
}

/**
 * @purpose - Load questions from the third party API and save them in the questions list.
 * @param {number} count - Question's count (Default = 2)
 */
async function loadQuestions(count = 2) {
  //* API token
  const token = process.env.QUIZ_APP_TOKEN;
  try {
    //? Send GET request to quizapi.io to get a list of questions.
    const response = await axios.get(
      `https://quizapi.io/api/v1/questions?apiKey=${token}&limit=${count}&category=Linux&difficulty=Easy`
    );

    //* Loop over the data coming from the API response.
    response.data.forEach(async (entry) => {
      //* Clean the answers object (remove null values)
      entry.answers = cleanAnswers(entry.answers);

      //? Push the question in the list
      questionsList.push({
        //* The question text
        question: entry.question,
        //* All available answers
        choices: entry.answers,
        //* Correct answer value (ex: answer_a)
        answer: entry.correct_answer,
        //* Complete answer text
        answerText: entry.answers[entry.correct_answer],
      });
    });
  } catch (error) {
    console.log(
      chalk.red(`Sorry ${playerName}, no questions available right now!`)
    );
    console.log(chalk.blueBright("Please come back soon."));

    //! End the response.
    process.exit(1);
  }
}

/**
 * Remove all null and undefined values from the given object
 * @param {Object} answers - All question's answers
 * @returns cleaned Answer's object
 */
function cleanAnswers(answers) {
  //? Remove all null/undefined entries
  let cleanedAnswers = Object.fromEntries(
    Object.entries(answers).filter(([_, v]) => v != null)
  );

  return cleanedAnswers;
}

/**
 * @purpose - Display all questions to the player and handle his answers
 * @returns true if the player won the game, false otherwise.
 */
async function play() {
  //? Ensure that there is available questions
  if (questionsList) {
    for (let counter = 0; counter < questionsList.length; counter++) {
      const entry = questionsList[counter];

      console.log("Answer: ", chalk.green(entry.answerText));

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
      chalk.bgRed(`Sorry ${playerName}, no questions available right now.`)
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
    spinner.success({ text: `Nice work ${playerName}.` });
    //? Indicate that the player answer is correct. 👌🏻
    return true;
  } else {
    spinner.error({ text: `Game Over, you lose ${playerName}!` });
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
    `Congrats, ${playerName} !\n $ 1, 0 0 0 , 0 0 0 for you`.toUpperCase();

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
  const msg = `oops, ${playerName} !\n you are loser`.toUpperCase();

  figlet(msg, (err, data) => {
    if (!err) {
      console.log(gradient.pastel.multiline(data));
    }
  });
}

//* Run the Game
async function runGame() {
  await welcome(); //? Greeting message
  await askName(); //? Ask for the player name
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
