import chalk from "chalk";

export interface CLIError extends Error {
  code?: string;
}

const errorHandler = (err: CLIError) => {
  if (err.code) {
    console.log(
      `${chalk.red(`${chalk.bold(`ERROR [${err.code}]:`)} ${err.message}`)}`
    );
  } else {
  }
};

export default errorHandler;
