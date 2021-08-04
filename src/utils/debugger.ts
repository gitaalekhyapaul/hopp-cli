import { createConnection, Socket } from "net";
import { Console } from "console";
import { InspectOptions } from "util";
import chalk from "chalk";

import errors from "./error-codes";
import errorHandler from "./error-handler";

class debugging {
  private constructor() {}
  private static createInstance(): {
    sockClient: Socket;
    virtualConsole: Console;
  } {
    const sockClient = createConnection({ port: 9999, allowHalfOpen: true });
    const virtualConsole = new Console({
      stdout: sockClient,
      stderr: sockClient,
      colorMode: true,
    });
    sockClient.on("error", () => {
      errorHandler({ name: "Debugger Error!", ...errors.HOPP002 });
    });
    return {
      sockClient,
      virtualConsole,
    };
  }
  public static log(message?: any, ...optionalParams: any[]) {
    const { sockClient, virtualConsole } = debugging.createInstance();
    virtualConsole.log(chalk.greenBright(message, ...optionalParams));
    setTimeout(() => sockClient.destroy(), 50);
  }
  public static info(message?: any, ...optionalParams: any[]) {
    const { sockClient, virtualConsole } = debugging.createInstance();
    virtualConsole.info(chalk.cyanBright(message, ...optionalParams));
    setTimeout(() => sockClient.destroy(), 50);
  }
  public static error(message?: any, ...optionalParams: any[]) {
    const { sockClient, virtualConsole } = debugging.createInstance();
    virtualConsole.error(chalk.redBright(message, ...optionalParams));
    setTimeout(() => sockClient.destroy(), 50);
  }
  public static dir(item: any, option?: InspectOptions) {
    const { sockClient, virtualConsole } = debugging.createInstance();
    virtualConsole.dir(item, option);
    setTimeout(() => sockClient.destroy(), 50);
  }
}

export default debugging;
