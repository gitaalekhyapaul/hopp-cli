import { Collection } from "./collection";
import { HoppRESTRequest } from "./types/hopp-rest-request";

export interface context {
  interactive: boolean;
  config?: string;
  collections?: Array<Collection<HoppRESTRequest>>;
  [x: string]: any;
}
