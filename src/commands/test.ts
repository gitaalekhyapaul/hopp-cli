import { context } from "../schemas";

const run = async (context: context) => {
  console.log("values", context);
};

export default run;
