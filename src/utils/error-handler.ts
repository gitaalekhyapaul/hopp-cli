import chalk from "chalk";
import errors from "./error-codes";
import { CommanderError } from "commander";

export interface CLIError extends Error {
  code?: string;
}

const errorHandler = (err: CLIError | CommanderError) => {
  if (err instanceof CommanderError) {
    console.log(`${chalk.red(`${chalk.bold(`ERROR:`)} ${err.message}`)}`);
  } else if (err.code) {
    console.log(
      `${chalk.red(`${chalk.bold(`ERROR [${err.code}]:`)} ${err.message}`)}`
    );
  } else {
    console.log(
      `${chalk.red(
        `${chalk.bold(`ERROR [${errors.HOPP000.code}]:`)} ${
          errors.HOPP000.message
        }`
      )}`
    );
    console.dir(chalk.yellow(err.name));
    console.dir(chalk.yellow(err.message));
    console.dir(chalk.yellow(err.name));
  }
};

export default errorHandler;
