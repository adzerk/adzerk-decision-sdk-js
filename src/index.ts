import unfetch from 'isomorphic-unfetch';
import { FetchAPI, DecisionApi, Configuration } from './generated';
import { Request, Response } from './models';
import { removeUndefinedAndBlocklisted } from './utils';

export interface DecisionSdk {
  getDecisions(request: Request): Promise<Response>;
}

export default function(
  networkId?: number,
  fetch?: FetchAPI,
  basePath?: string
): DecisionSdk {
  if (fetch == undefined) {
    fetch = unfetch;
  }

  if (basePath == undefined) {
    basePath = `https://e-${networkId}.adzerk.net`;
  }
  const configuration = new Configuration({ basePath, fetchApi: fetch });

  let api = new DecisionApi(configuration);

  return {
    getDecisions: async function(request: Request) {
      let processedRequest = removeUndefinedAndBlocklisted(request);
      let response = await api.getDecisions(processedRequest);

      return response as Response;
    },
  };
}
