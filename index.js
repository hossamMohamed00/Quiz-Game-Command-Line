#!/user/bin/env node
/*
?Shebang or Hashbang (#!) is the first line of the file
 which tells the OS which interpreter to use.
*/
import chalk from "chalk";
import inquirer from "inquirer";
import gradient from "gradient-string";
import chalkAnimation from "chalk-animation";
import figlet from "figlet";
import { createSpinner } from "nanospinner";

let playerName;

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

async function question1() {
  const answer = await inquirer.prompt({
    name: "question_1",
    type: "list",
    message: "JavaScript was created in 10 days then released on ?",
    choices: [
      "May 23rd, 1995",
      "Nov 24th, 1995",
      "Dec 4th, 1995",
      "Dec 17, 1996",
    ],
  });

  return handleAnswer(answer.question_1 === "Dec 4th, 1995");
}

async function handleAnswer(isCorrect) {
  const spinner = createSpinner("Checking answer...").start();
  await sleep();

  if (isCorrect) {
    spinner.success({ text: `Nice work ${playerName}.` });
  } else {
    spinner.error({ text: `💀 💀 💀 Game Over, you lose ${playerName}!` });
    process.exit(1);
  }
}

function winner() {
  console.clear();
  const msg = `Congrats, ${playerName.toUpperCase()} !\n $ 1, 0 0 0 , 0 0 0`;

  figlet(msg, (err, data) => {
    console.log(gradient.pastel.multiline(data));
  });

  console.log(
    chalk.blueBright(
      "Programming isn't about what you know; it's about making the command line look cool"
    )
  );
}

async function runGame() {
  await welcome();
  await askName();
  await question1();
  winner();
}

runGame();
