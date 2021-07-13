import { program } from "commander";

import { version } from "../package.json";
import { test } from "./commands";

/**
 * * Program Default Configuration
 */
program
  .name("hopp-cli")
  .version(version, "-v, --ver", "see the current version of the CLI")
  .usage("[flags or options] arguments");

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
  await program.parseAsync(args);
  const options = program.opts();
  if (Object.keys(options).length === 0) {
    program.help();
  }
};
