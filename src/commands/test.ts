import fs from "fs/promises";
import { join, extname } from "path";
import inquirer from "inquirer";
import chalk from "chalk";
import fuzzyPath from "inquirer-fuzzy-path";
inquirer.registerPrompt("fuzzypath", fuzzyPath);

import { context } from "../schemas";
import { errors } from "../utils";
import debugging from "../utils/debugger";

const run = async (context: context) => {
  if (context.interactive) {
    await parseOptions(context);
  } else {
    context.config = await checkFileURL(context.config!);
  }
  debugging.dir(context);
};

const checkFileURL = async (url: string) => {
  try {
    const fileUrl = join(process.cwd(), url);
    await fs.access(fileUrl);
    if (extname(fileUrl) !== ".json") {
      console.log(
        `${chalk.red(
          ">>"
        )} Selected file is not a collection JSON. Please try again.`
      );
      throw "FileNotJSON";
    }
    return fileUrl;
  } catch (err) {
    if (err.code === "ENOENT") {
      throw errors.HOPP001;
    }
    throw err;
  }
};
const parseOptions = async (context: context): Promise<any> => {
  try {
    const { fileUrl }: { fileUrl: string } = await inquirer.prompt([
      {
        type: "fuzzypath",
        name: "fileUrl",
        message: "Enter your Hoppscotch collection.json path:",
        excludePath: (nodePath: string) => {
          return nodePath.includes("node_modules");
        },
        excludeFilter: (nodePath: string) =>
          nodePath == "." || nodePath.startsWith("."),
        itemType: "file",
        suggestOnly: false,
        rootPath: ".",
        depthLimit: 5,
        emptyText: "No results...try searching for some other file!",
      },
    ]);

    context.config = await checkFileURL(fileUrl);
  } catch (err) {
    return parseOptions(context);
  }
};

export default run;
