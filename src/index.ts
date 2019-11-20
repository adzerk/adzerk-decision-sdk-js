import unfetch from 'isomorphic-unfetch';
import debug from 'debug';

import {
  FetchAPI,
  DecisionApi,
  Configuration,
  FetchParams,
  Middleware,
  RequestContext,
  ResponseContext,
} from './generated';
import { Request, Response, decisionsIsMultiWinner } from './models';
import { removeUndefinedAndBlocklisted } from './utils';

const log = debug('adzerk-decision-sdk');

export interface DecisionSdk {
  getDecisions(request: Request): Promise<Response>;
}

interface SdkOptions {
  networkId: number;
  fetch?: FetchAPI;
  basePath?: string;
  middlewares?: Middleware[];
}

export class AdzerkDecisionSdkClient {
  private _api: DecisionApi;

  constructor(opts: SdkOptions) {
    let fetch: FetchAPI = opts.fetch || unfetch;
    let basePath: string =
      opts.basePath || `https://e-${opts.networkId}.adzerk.net`;

    let middleware: Middleware = {
      pre: async (context: RequestContext): Promise<FetchParams | void> => {
        log(`Request Url: ${context.url}`);
        log('Request Headers: %o', context.init.headers);
        log('Request Body: %o', context.init.body);
      },
      post: async (context: ResponseContext) => {
        log('Response Code: %s', context.response.status);
        log('Response Status Text: %s', context.response.statusText);
      },
    };

    const configuration = new Configuration({
      basePath,
      fetchApi: fetch,
      middleware: [...(opts.middlewares || []), middleware],
    });

    this._api = new DecisionApi(configuration);
  }

  async getDecisions(request: Request): Promise<Response> {
    log('Processing request: %o', request);
    let processedRequest = removeUndefinedAndBlocklisted(request);

    log('Using the processed request: %o', processedRequest);
    let response = await this._api.getDecisions(processedRequest);

    log('Received response: %o', response);
    let typed = response as Response;

    log(
      decisionsIsMultiWinner(typed.decisions)
        ? 'Is Multiwinner'
        : 'Not Multiwinner'
    );

    return response as Response;
  }
}
