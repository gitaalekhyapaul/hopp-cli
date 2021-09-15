import axios, { AxiosPromise, AxiosRequestConfig, Method } from "axios";
import chalk from "chalk";
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
  console.dir(req, { depth: 10 });
  let config: AxiosRequestConfig = {};
  config.url = req.endpoint;
  config.method = req.method as Method;
  for (const x of req.params) {
    if (x.active) {
      if (!config.params) {
        config.params = {};
      }
      config.params[x.key] = x.value;
    }
  }
  for (const x of req.headers) {
    if (x.active) {
      if (!config.headers) {
        config.headers = {};
      }
      config.headers[x.key] = x.value;
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
      method: config.method ? config.method : "GET",
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
        method: err.config.method ? err.config.method : "GET",
        endpoint: err.config.url ? err.config.url : "",
        statusCode: "",
      };
      if (!err.response) {
        res.statusCode = chalk.redBright("ERROR : NETWORK TIMEOUT");
      } else {
        res.statusCode = chalk.redBright(
          `${err.response.status} : ${err.response.statusText}`
        );
      }
      return res;
    } else {
      return {
        path: x.path,
        method: "GET",
        endpoint: "",
        statusCode: chalk.redBright("ERROR: COULD NOT PARSE RESPONSE!"),
      };
    }
  }
};

const parseRequests = async (
  x: Collection<HoppRESTRequest>,
  rootPath: string = "$ROOT"
) => {
  if (rootPath === "$ROOT") {
    console.clear();
    console.log(
      chalk.yellowBright("Collection JSON parsed! Executing requests...")
    );
  }
  for (const req of x.requests) {
    const parsedReq = createRequest(`${rootPath}/${x.name}`, req);
    const res = await requestRunner(parsedReq);
    console.dir(res);
  }
  for (const folder of x.folders) {
    await parseRequests(folder, `${rootPath}/${x.name}`);
  }
};

export default parseRequests;
