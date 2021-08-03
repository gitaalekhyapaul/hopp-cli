import { createConnection, Socket } from "net";
import { Console } from "console";
import chalk from "chalk";

import errors from "./error-codes";
import errorHandler from "./error-handler";

class debugging {
  private static client: Socket | null = null;
  private static logger: Console | null = null;
  private constructor() {}
  private static createInstance() {
    const sockClient = createConnection({ port: 9999 }, () => {
      console.log("inside createConnection");
      debugging.client = sockClient;
      debugging.logger = new Console({
        stdout: debugging.client,
        stderr: debugging.client,
      });
    });
    sockClient.on("error", () => {
      errorHandler({ name: "Debugger Error!", ...errors.HOPP002 });
      debugging.client = null;
      debugging.logger = null;
    });
    sockClient.on("connect", () => {
      console.log("inside connect handler");
      debugging.client = sockClient;
      debugging.logger = new Console({
        stdout: debugging.client,
        stderr: debugging.client,
      });
    });
  }
  public static log(...data: any[]) {
    if (!debugging.client) {
      console.log("instance not there");
      console.dir(debugging.logger);
      debugging.createInstance();
    }
    debugging.logger?.log(chalk.cyanBright(data));
  }
  public static error(...data: any[]) {
    if (!debugging.client) {
      debugging.createInstance();
    }
    debugging.logger?.error(chalk.redBright(data));
  }
  public static dir(
    item: any,
    option?: any,
    level: "log" | "error" | undefined = "log"
  ) {
    if (!debugging.client) {
      debugging.createInstance();
    }
    level === "error"
      ? debugging.logger?.dir(chalk.redBright(item, option))
      : debugging.logger?.dir(chalk.cyanBright(item, option));
  }
}

export default debugging;
