import axios, { AxiosPromise, AxiosRequestConfig, Method } from "axios";
import chalk from "chalk";
import { WritableStream } from "table";

import { Collection, HoppRESTRequest } from "../../schemas";

interface requestStack {
  request: () => AxiosPromise<any>;
  path: string;
}

interface responseTable {
  path: string;
  endpoint: string;
  method: Method;
  statusCode: string;
}

const createRequest = (
  rootPath: string,
  req: HoppRESTRequest
): requestStack => {
  let config: AxiosRequestConfig = {};
  config.url = req.endpoint;
  config.method = req.method as Method;
  for (const x of req.params) {
    if (x.active) {
      if (!config.params) {
        config.params = {};
      }
      if (x.key) config.params[x.key] = x.value;
    }
  }
  for (const x of req.headers) {
    if (x.active) {
      if (!config.headers) {
        config.headers = {};
      }
      if (x.key) config.headers[x.key] = x.value;
    }
  }
  if (req.auth.authActive) {
    switch (req.auth.authType) {
      case "bearer": {
        if (!config.headers) {
          config.headers = {};
        }
        config.headers["Authorization"] = `Bearer ${req.auth.token}`;
        break;
      }
      case "basic": {
        config.auth = {
          username: req.auth.username,
          password: req.auth.password,
        };
        break;
      }
      case "oauth-2": {
        // TODO: OAuth2 Request Parsing
      }
      default: {
        break;
      }
    }
  }
  if (req.body.contentType) {
    if (!config.headers) {
      config.headers = {};
    }
    config.headers["Content-Type"] = req.body.contentType;
    switch (req.body.contentType) {
      case "multipart/form-data": {
        // TODO: Parse Multipart Form Data
        break;
      }
      default: {
        config.data = req.body.body;
        break;
      }
    }
  }
  return {
    path: `${rootPath}/${req.name.length > 0 ? req.name : "Untitled Request"}`,
    request: () => axios(config),
  };
};

const requestRunner = async (x: requestStack): Promise<responseTable> => {
  try {
    const { status, statusText, config } = await x.request();
    return {
      path: x.path,
      method: config.method ? (config.method.toUpperCase() as Method) : "GET",
      endpoint: config.url ? config.url : "",
      statusCode: (() => {
        if (status.toString().startsWith("2")) {
          return chalk.greenBright(`${status} : ${statusText}`);
        } else if (status.toString().startsWith("3")) {
          return chalk.yellowBright(`${status} : ${statusText}`);
        } else {
          return chalk.redBright(`${status} : ${statusText}`);
        }
      })(),
    };
  } catch (err) {
    if (axios.isAxiosError(err)) {
      let res: responseTable = {
        path: x.path,
        method: err.config.method
          ? (err.config.method.toUpperCase() as Method)
          : "GET",
        endpoint: err.config.url ? err.config.url : "",
        statusCode: "",
      };
      if (!err.response) {
        res.statusCode = chalk.bold(chalk.redBright("ERROR : NETWORK TIMEOUT"));
      } else {
        res.statusCode = (() => {
          if (err.response.status.toString().startsWith("2")) {
            return chalk.greenBright(
              `${err.response.status} : ${err.response.statusText}`
            );
          } else if (err.response.status.toString().startsWith("3")) {
            return chalk.yellowBright(
              `${err.response.status} : ${err.response.statusText}`
            );
          } else {
            return chalk.redBright(
              `${err.response.status} : ${err.response.statusText}`
            );
          }
        })();
      }
      return res;
    } else {
      return {
        path: x.path,
        method: "GET",
        endpoint: "",
        statusCode: chalk.bold(
          chalk.redBright("ERROR: COULD NOT PARSE RESPONSE!")
        ),
      };
    }
  }
};

const parseRequests = async (
  x: Collection<HoppRESTRequest>,
  tableStream: WritableStream,
  rootPath: string = "$ROOT"
) => {
  for (const req of x.requests) {
    const parsedReq = createRequest(`${rootPath}/${x.name}`, req);
    const res = await requestRunner(parsedReq);
    tableStream.write([res.path, res.method, res.endpoint, res.statusCode]);
  }
  for (const folder of x.folders) {
    await parseRequests(folder, tableStream, `${rootPath}/${x.name}`);
  }
};

export default parseRequests;
