import unfetch from 'isomorphic-unfetch';
import debug from 'debug';
import FormData from 'form-data';

import {
  FetchAPI,
  DecisionApi as BaseDecisionApi,
  Configuration,
  FetchParams,
  Middleware,
  RequestContext,
  ResponseContext,
  GdprConsent,
  Placement,
  Decision,
  RequestOpts,
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
  siteId?: number;
  fetch?: FetchAPI;
  protocol?: string;
  host?: string;
  path?: string;
  middlewares?: Middleware[];
  apiKey?: string;
}

class DecisionApi extends BaseDecisionApi {
  async triggerClick(
    decision: Decision,
    revenueOverride?: number,
    additionalRevenue?: number
  ): Promise<boolean> {
    let response = await this.request(
      this.buildEventRequest(decision.clickUrl, revenueOverride, additionalRevenue)
    );

    return response.status === 200;
  }

  async triggerImpression(
    decision: Decision,
    revenueOverride?: number,
    additionalRevenue?: number
  ): Promise<boolean> {
    let response = await this.request(
      this.buildEventRequest(decision.impressionUrl, revenueOverride, additionalRevenue)
    );

    return response.status === 200;
  }

  async triggerEvent(
    decision: Decision,
    eventId: number,
    revenueOverride?: number,
    additionalRevenue?: number
  ): Promise<boolean> {
    let event = decision.events?.filter(e => e.id === eventId);
    if (!event) {
      return false;
    }

    let response = await this.request(
      this.buildEventRequest(event[0].url, revenueOverride, additionalRevenue)
    );
    return response.status === 200;
  }

  private buildEventRequest(
    url?: string,
    revenueOverride?: number,
    additionalRevenue?: number
  ): RequestOpts {
    let parsed = new URL(url || '');
    if (revenueOverride) {
      parsed.searchParams.append('override', revenueOverride.toString());
    }
    if (additionalRevenue) {
      parsed.searchParams.append('additional', additionalRevenue.toString());
    }

    return {
      path: `${parsed.pathname}${parsed.search}`,
      method: 'GET',
      headers: {},
    };
  }
}

class DecisionClient {
  private _api: DecisionApi;
  private _networkId: number;
  private _siteId?: number;

  constructor(configuration: Configuration, networkId: number, siteId?: number) {
    this._api = new DecisionApi(configuration);
    this._networkId = networkId;
    this._siteId = siteId;
  }

  async get(request: Request): Promise<Response> {
    log('Fetching decisions from Adzerk API');
    log('Processing request: %o', request);
    let processedRequest: Request = removeUndefinedAndBlocklisted(request);

    processedRequest.placements.forEach((p: Placement, idx: number) => {
      p.networkId = p.networkId || this._networkId;
      p.siteId = p.siteId || this._siteId;
      p.divName = p.divName || `div${idx}`;
    });

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
  private _networkId: number;

  constructor(configuration: Configuration, networkId: number) {
    this._api = new UserdbApi(configuration);
    this._networkId = networkId;
  }

  async setUserCookie(userKey: string, networkId?: number) {
    return await this._api.setUserCookie(networkId || this._networkId, userKey);
  }

  async setCustomProperties(userKey: string, properties: object, networkId?: number) {
    return await this._api.addCustomProperties(
      networkId || this._networkId,
      userKey,
      properties
    );
  }

  async addInterest(userKey: string, interest: string, networkId?: number) {
    return await this._api.addInterests(networkId || this._networkId, userKey, interest);
  }

  async addRetargetingSegment(
    userKey: string,
    advertiserId: number,
    retargetingSegmentId: number,
    networkId?: number
  ) {
    return await this._api.addRetargetingSegment(
      networkId || this._networkId,
      advertiserId,
      retargetingSegmentId,
      userKey
    );
  }

  async forget(userKey: string, networkId?: number) {
    return await this._api.forget(networkId || this._networkId, userKey);
  }

  async gdprConsent(gdprConsent: GdprConsent, networkId?: number) {
    return await this._api.gdprConsent(networkId || this._networkId, gdprConsent);
  }

  async ipOverride(userKey: string, ip: string, networkId?: number) {
    return await this._api.ipOverride(networkId || this._networkId, userKey, ip);
  }

  async matchUser(
    userKey: string,
    partnerId: number,
    userId: number,
    networkId?: number
  ) {
    return await this._api.matchUser(
      networkId || this._networkId,
      userKey,
      partnerId,
      userId
    );
  }

  async optOut(userKey: string, networkId?: number) {
    return await this._api.optOut(networkId || this._networkId, userKey);
  }

  async read(userKey: string, networkId?: number) {
    return await this._api.read(networkId || this._networkId, userKey);
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

    this._decisionClient = new DecisionClient(configuration, opts.networkId, opts.siteId);
    this._userDbClient = new UserDbClient(configuration, opts.networkId);
  }

  get decisions(): DecisionClient {
    return this._decisionClient;
  }

  get userDb(): UserDbClient {
    return this._userDbClient;
  }
}
