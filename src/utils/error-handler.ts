import chalk from "chalk";
import errors from "./error-codes";
import { CommanderError } from "commander";

export interface CLIError extends Error {
  code?: string;
}

const errorHandler = (err: CLIError | CommanderError) => {
  if (err instanceof CommanderError) {
    if (err.exitCode === 0) {
      process.exit(0);
    }
    console.log(`${chalk.red(`${chalk.bold(`ERROR:`)} ${err.message}`)}`);
  } else if (err.code && err.code.startsWith("HOPP")) {
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
    console.log(chalk.yellow(err.name));
    console.log(chalk.yellow(err.message));
    console.log(chalk.yellow(err.stack));
  }
};

export default errorHandler;
