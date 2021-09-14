import {
  HoppRESTRequest,
  translateToNewRequest,
} from "./types/hopp-rest-request";

export interface Collection<T extends HoppRESTRequest> {
  v: number;
  name: string;
  folders: Collection<T>[];
  requests: T[];

  id?: string; // For Firestore ID
}

export function makeCollection<T extends HoppRESTRequest>(
  x: Omit<Collection<T>, "v">
): Collection<T> {
  return {
    v: 1,
    ...x,
  };
}

export function translateToNewRESTCollection(
  x: any
): Collection<HoppRESTRequest> {
  if (x.v && x.v === 1) return x;

  // Legacy
  const name = x.name ?? "Untitled";
  const folders = (x.folders ?? []).map(translateToNewRESTCollection);
  const requests = (x.requests ?? []).map(translateToNewRequest);

  const obj = makeCollection<HoppRESTRequest>({
    name,
    folders,
    requests,
  });

  if (x.id) obj.id = x.id;

  return obj;
}

function isRESTRequest(x: any): x is HoppRESTRequest {
  if (!x || typeof x !== "object") return false;
  if (!x.v) {
    x = translateToNewRequest(x);
  }
  const entries = [
    "name",
    "method",
    "endpoint",
    "preRequestScript",
    "testScript",
  ];
  for (const y of entries) {
    if (!x[y] || typeof x[y] !== "string") return false;
  }
  const testParamOrHeader = (y: any) => {
    if (!y.key || typeof y.key !== "string") return false;
    if (!y.value || typeof y.value !== "string") return false;
    if (!y.active || typeof y.active !== "boolean") return false;
    return true;
  };
  if (!Array.isArray(x.params)) {
    return false;
  } else {
    const checkParams = (x.params as any[]).every(testParamOrHeader);
    if (!checkParams) return false;
  }
  if (!Array.isArray(x.headers)) {
    return false;
  } else {
    const checkHeaders = (x.headers as any[]).every(testParamOrHeader);
    if (!checkHeaders) return false;
  }
  if (!x.auth || typeof x.auth !== "object") {
    return false;
  } else {
    if (!x.auth.authActive || typeof x.auth.authActive !== "boolean")
      return false;
    if (!x.auth.authType || typeof x.auth.authType !== "string") {
      return false;
    } else {
      switch (x.auth.authType) {
        case "basic": {
          if (!x.auth.username || typeof x.auth.username !== "string")
            return false;
          if (!x.auth.password || typeof x.auth.password !== "string")
            return false;
          break;
        }
        case "bearer": {
          if (!x.auth.token || typeof x.auth.token !== "string") return false;
          break;
        }
        case "oauth-2": {
          const entries = [
            "token",
            "oidcDiscoveryURL",
            "authURL",
            "accessTokenURL",
            "clientID",
            "scope",
          ];
          for (const y of entries) {
            if (!x.auth[y] || typeof x.auth[y] !== "string") return false;
          }
          break;
        }
        case "none": {
          break;
        }
        default: {
          return false;
        }
      }
    }
  }
  if (!x.body || typeof x.body !== "object") {
    return false;
  } else {
    if (typeof x.body.contentType === "undefined") return false;
    if (typeof x.body.body === "undefined") return false;
  }
  return true;
}

export function isRESTCollection(x: any): x is Collection<HoppRESTRequest> {
  if (!x) return false;
  if (!x.v) {
    x = translateToNewRESTCollection(x);
  }

  if (!x.name || typeof x.name !== "string") return false;
  if (!Array.isArray(x.folders)) {
    return false;
  } else {
    const checkFolders = (x.folders as any[]).every(isRESTCollection);
    if (!checkFolders) return false;
  }
  if (!Array.isArray(x.requests)) {
    return false;
  } else {
    const checkRequests = (x.requests as any[]).every(isRESTRequest);
    if (!checkRequests) return false;
  }
  return true;
}
