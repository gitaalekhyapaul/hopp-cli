import { program } from "commander";

import { version } from "../package.json";
import { test } from "./commands";
import { errorHandler } from "./utils";

/**
 * * Program Default Configuration
 */
program
  .name("hopp-cli")
  .version(version, "-v, --ver", "see the current version of the CLI")
  .usage("[flags or options] arguments");

program.exitOverride();

/**
 * * CLI Flags
 */
program
  .option(
    "-c, --config <file>",
    "path to a Hoppscotch collection.json file for CI testing"
  )
  .setOptionValue("interactive", false)
  .action(test);

program
  .command("test")
  .description("interactive Hoppscotch testing through CLI")
  .setOptionValue("interactive", true)
  .action(test);

export const run = async (args: string[]) => {
  try {
    await program.parseAsync(args);
  } catch (err) {
    errorHandler(err);
  }
  const options = program.opts();
  if (Object.keys(options).length === 0) {
    program.help();
  }
};
