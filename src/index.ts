import unfetch from "isomorphic-unfetch";
import {
  FetchAPI,
  Request,
  Response,
  DecisionApi,
  Configuration
} from "./generated";

export interface DecisionSdk {
  getDecisions(request: Request): Promise<Response>;
}

export default function(networkId: number, fetch: FetchAPI): DecisionSdk {
  if (fetch == undefined) {
    fetch = unfetch;
  }

  const basePath = `https://e-${networkId}.adzerk.net`;
  const configuration = new Configuration({ basePath });

  let api = new DecisionApi(configuration);

  return {
    getDecisions: async function(request: Request) {
      throw "Not Implemented";
    }
  };
}
