import fs from "fs/promises";
import { join } from "path";
import inquirer from "inquirer";
import { FuzzyPathQuestionOptions } from "inquirer-fuzzy-path";
inquirer.registerPrompt("fuzzypath", require("inquirer-fuzzy-path"));

import { context } from "../schemas";
import { errors } from "../utils";

const run = async (context: context) => {
  if (context.interactive) {
    await parseOptions(context);
    console.dir(context);
  } else {
    context.config = await checkFileURL(context.config!);
  }
};

const checkFileURL = async (url: string) => {
  try {
    console.log(url);
    const fileUrl = join(process.cwd(), url);
    await fs.access(fileUrl);
    return fileUrl;
  } catch (err) {
    if (err.code === "ENOENT") {
      throw errors.HOPP001;
    }
    throw err;
  }
};
const parseOptions = async (context: context) => {
  const ans = await inquirer.prompt<FuzzyPathQuestionOptions>({
    //@ts-ignore
    type: "fuzzypath",
    name: "fileUrl",
    message: "Enter your Hoppscotch collection.json path:",
    excludePath: (nodePath: any) => nodePath.startsWith("node_modules"),
    itemType: "file",
    suggestOnly: false,
    depthLimit: 5,
    validate: async (input) => {
      try {
        await checkFileURL(input);
        return true;
      } catch (err) {
        return errors.HOPP001.message;
      }
    },
  });
};

export default run;
