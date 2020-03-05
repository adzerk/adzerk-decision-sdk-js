import unfetch from 'isomorphic-unfetch';
import debug from 'debug';
import FormData from 'form-data';

import {
  FetchAPI,
  DecisionApi,
  Configuration,
  FetchParams,
  Middleware,
  RequestContext,
  ResponseContext,
  GdprConsent,
} from './generated';
import { Request, Response } from './models';
import { removeUndefinedAndBlocklisted } from './utils';
import { UserdbApi } from './generated/apis/UserdbApi';

(global as any).FormData = (global as any).FormData || FormData;

const log = debug('adzerk-decision-sdk:client');

function isDecisionMultiWinner(obj: any): boolean {
  return obj instanceof Array;
}

interface ClientOptions {
  networkId: number;
  fetch?: FetchAPI;
  protocol?: string;
  host?: string;
  path?: string;
  middlewares?: Middleware[];
  apiKey?: string;
}

class DecisionClient {
  private _api: DecisionApi;

  constructor(configuration: Configuration) {
    this._api = new DecisionApi(configuration);
  }

  async get(request: Request): Promise<Response> {
    log('Fetching decisions from Adzerk API');
    log('Processing request: %o', request);
    let processedRequest = removeUndefinedAndBlocklisted(request);

    log('Using the processed request: %o', processedRequest);
    let response = await this._api.getDecisions(processedRequest);

    log('Received response: %o', response);
    let decisions: any = response.decisions || {};

    Object.keys(decisions).forEach((k: string) => {
      if (!isDecisionMultiWinner(decisions[k])) {
        decisions[k] = [decisions[k]];
      }
    });

    return response as Response;
  }

  async getWithExplanation(request: Request, apiKey: string): Promise<Response> {
    log('Fetching decisions with explanations from Adzerk API');
    log('Processing request: %o', request);
    let processedRequest = removeUndefinedAndBlocklisted(request);

    log('Using the processed request: %o', processedRequest);
    let response = await this._api
      .withPreMiddleware(
        async (context: RequestContext): Promise<FetchParams | void> => {
          if (context.init.headers == undefined) {
            context.init.headers = {};
          }
          let headers = context.init.headers as Record<string, string>;
          headers['x-adzerk-explain'] = apiKey;

          return context;
        }
      )
      .getDecisions(processedRequest);

    log('Received response: %o', response);
    let decisions: any = response.decisions || {};

    Object.keys(decisions).forEach((k: string) => {
      if (!isDecisionMultiWinner(decisions[k])) {
        decisions[k] = [decisions[k]];
      }
    });

    return response as Response;
  }
}

class UserDbClient {
  private _api: UserdbApi;

  constructor(configuration: Configuration) {
    this._api = new UserdbApi(configuration);
  }

  async setUserCookie(networkId: number, userKey: string) {
    return await this._api.setUserCookie(networkId, userKey);
  }

  async addCustomProperties(networkId: number, userKey: string, properties: object) {
    return await this._api.addCustomProperties(networkId, userKey, properties);
  }

  async addInterests(networkId: number, userKey: string, interests: string[]) {
    return await this._api.addInterests(networkId, userKey, interests.join(','));
  }

  async addRetargetingSegment(
    networkId: number,
    userKey: string,
    advertiserId: number,
    retargetingSegmentId: number
  ) {
    return await this._api.addRetargetingSegment(
      networkId,
      advertiserId,
      retargetingSegmentId,
      userKey
    );
  }

  async forget(networkId: number, userKey: string) {
    return await this._api.forget(networkId, userKey);
  }

  async gdprConsent(networkId: number, gdprConsent: GdprConsent) {
    return await this._api.gdprConsent(networkId, gdprConsent);
  }

  async ipOverride(networkId: number, userKey: string, ip: string) {
    return await this._api.ipOverride(networkId, userKey, ip);
  }

  async matchUser(networkId: number, userKey: string, partnerId: number, userId: number) {
    return await this._api.matchUser(networkId, userKey, partnerId, userId);
  }

  async optOut(networkId: number, userKey: string) {
    return await this._api.optOut(networkId, userKey);
  }

  async read(networkId: number, userKey: string) {
    return await this._api.read(networkId, userKey);
  }
}

export class Client {
  private _decisionClient: DecisionClient;
  private _userDbClient: UserDbClient;
  private _agent: any;
  private _path?: string;

  constructor(opts: ClientOptions) {
    let fetch: FetchAPI = (opts.fetch || unfetch).bind(global);

    let protocol: string = opts.protocol || 'https';
    let host: string = opts.host || `e-${opts.networkId}.adzerk.net`;
    let basePath: string = `${protocol}://${host}`;

    this._path = opts.path;

    if (typeof process !== 'undefined') {
      let { Agent } = protocol === 'https' ? require('https') : require('http');
      this._agent = new Agent({
        keepAlive: true,
        timeout: 10 * 1000,
      });
    }

    let middleware: Middleware = {
      pre: async (context: RequestContext): Promise<FetchParams | void> => {
        log(`Request Url: ${context.url}`);
        log('Request Headers: %o', context.init.headers);
        log('Request Body: %o', context.init.body);

        if (this._agent != undefined) {
          (context.init as any).agent = this._agent;
        }

        if (this._path != undefined) {
          context.url = `${basePath}${this._path}`;
        }

        return context;
      },
      post: async (context: ResponseContext) => {
        log('Response Code: %s', context.response.status);
        log('Response Status Text: %s', context.response.statusText);
      },
    };

    const configuration = new Configuration({
      basePath,
      fetchApi: fetch,
      apiKey: opts.apiKey,
      middleware: [...(opts.middlewares || []), middleware],
    });

    this._decisionClient = new DecisionClient(configuration);
    this._userDbClient = new UserDbClient(configuration);
  }

  get decisions(): DecisionClient {
    return this._decisionClient;
  }

  get userDb(): UserDbClient {
    return this._userDbClient;
  }
}
