import unfetch from 'isomorphic-unfetch';
import debug from 'debug';
import FormData from 'form-data';
import { Agent as HttpAgent } from 'http';
import { Agent as HttpsAgent } from 'https';

import {
  FetchAPI,
  DecisionApi,
  Configuration,
  FetchParams,
  Middleware,
  RequestContext,
  ResponseContext,
  Placement,
} from './generated';
import { DecisionRequest, DecisionResponse } from './models';
import { removeUndefinedAndBlocklisted } from './utils';
import { UserdbApi } from './generated/apis/UserdbApi';
import { RequiredError } from './generated/runtime';
import { LoggerFunc } from '.';

(global as any).FormData = (global as any).FormData || FormData;

const log = debug('adzerk-decision-sdk:client');
const versionString = 'adzerk-decision-sdk-js:{NPM_PACKAGE_VERSION}';
const isNode = typeof process !== 'undefined' && process.title !== 'browser';
const deprecatedPlacementFields: Array<Array<string>> = [
  ['ecpmPartition', 'ecpmPartitions'],
];

function isDecisionMultiWinner(obj: any): boolean {
  return obj instanceof Array;
}

const defaultLogger: LoggerFunc = (lvl, msg, meta) =>
  process.stdout.write(`[${lvl}] ${msg} [${JSON.stringify(meta)}]\n`);

interface ClientOptions {
  networkId: number;
  siteId?: number;
  fetch?: FetchAPI;
  protocol?: string;
  host?: string;
  path?: string;
  middlewares?: Middleware[];
  apiKey?: string;
  agent?: HttpAgent | HttpsAgent;
  logger: LoggerFunc;
}

interface PixelFireOptions {
  url: string;
  revenueOverride?: number;
  additionalRevenue?: number;
  eventMultiplier?: number;
}

interface AdditionalOptions {
  userAgent?: string;
  includeExplanation?: boolean;
  apiKey?: string;
}

interface PixelFireResponse {
  status: number;
  location?: string;
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

  async get(
    request: DecisionRequest,
    logger: LoggerFunc,
    additionalOpts?: AdditionalOptions
  ): Promise<DecisionResponse> {
    logger('info', 'Fetching decisions from Adzerk API');
    logger('info', 'Processing request: %o', request);
    // log('Fetching decisions from Adzerk API');
    // log('Processing request: %o', request);
    let processedRequest: DecisionRequest = removeUndefinedAndBlocklisted(request, [
      'isMobile',
    ]);

    if (processedRequest.enableBotFiltering === undefined) {
      processedRequest.enableBotFiltering = !isNode;
    }

    if (
      processedRequest.placements === undefined ||
      !processedRequest.placements.length
    ) {
      throw new RequiredError(
        'decisionRequest',
        'Each request requires at least one placement'
      );
    }

    processedRequest.placements.forEach((p: Placement, idx: number) => {
      if (p.adTypes === undefined || !p.adTypes.length) {
        throw new RequiredError(
          'placements',
          'Each placement requires at least one ad type'
        );
      }

      for (let pair of deprecatedPlacementFields) {
        let [deprecatedField, replacement] = pair;
        if (((p as any)[deprecatedField] || undefined) != undefined) {
          logger(
            'warn',
            `DEPRECATION WARNING: ${deprecatedField} has been deprecated. Please use ${replacement} instead.`
          );
          // log(
          //   `DEPRECATION WARNING: ${deprecatedField} has been deprecated. Please use ${replacement} instead.`
          // );
        }
      }

      p.networkId = p.networkId || this._networkId;
      p.siteId = p.siteId || this._siteId;
      p.divName = p.divName || `div${idx}`;
    });

    let api: DecisionApi = this._api;
    if (!!additionalOpts?.includeExplanation || !!additionalOpts?.userAgent) {
      api = api.withPreMiddleware(
        async (context: RequestContext): Promise<FetchParams | void> => {
          if (!context.init.headers) {
            context.init.headers = {};
          }
          let headers = context.init.headers as Record<string, string>;
          if (!!additionalOpts.includeExplanation) {
            logger(
              'warn',
              'You have opted to include explainer details with this request! This will cause performance degradation and should not be done in production environments.'
            );
            // log('--------------------------------------------------------------');
            // log('              !!! WARNING - WARNING - WARNING !!!             ');
            // log('');
            // log('You have opted to include explainer details with this request!');
            // log('This will cause performance degradation and should not be done');
            // log('in production environments.');
            // log('--------------------------------------------------------------');
            headers['x-adzerk-explain'] = additionalOpts.apiKey || '';
          }
          if (!!additionalOpts.userAgent) {
            headers['User-Agent'] = additionalOpts.userAgent || '';
          }
        }
      );
    }

    // log('Using the processed request: %o', processedRequest);
    logger('info', 'Using the processed request: %o', processedRequest);
    let response = await api.getDecisions(processedRequest as any);

    logger('info', 'Received response: %o', response);
    //log('Received response: %o', response);
    let decisions: any = response.decisions || {};

    Object.keys(decisions).forEach((k: string) => {
      if (!isDecisionMultiWinner(decisions[k])) {
        decisions[k] = [decisions[k]];
      }
    });

    return response as DecisionResponse;
  }
}

class UserDbClient {
  private _api: UserdbApi;
  private _networkId: number;

  constructor(configuration: Configuration, networkId: number) {
    this._api = new UserdbApi(configuration);
    this._networkId = networkId;
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

  async gdprConsent(gdprConsent: object, networkId?: number) {
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
    let record: any = await this._api.read(networkId || this._networkId, userKey);

    let {
      cookieMonster = undefined,
      dirtyCookies = undefined,
      isNew = undefined,
      adViewTimes = undefined,
      advertiserViewTimes = undefined,
      flightViewTimes = undefined,
      siteViewTimes = undefined,
      campaignViewTimes = undefined,
      pendingConversions = undefined,
      campaignConversions = undefined,
      ...rest
    } = record;

    return rest;
  }
}

class PixelClient {
  private _fetch: FetchAPI;
  private _agent: any;

  constructor(fetch: FetchAPI, agent: any) {
    this._fetch = fetch;
    this._agent = agent;
  }

  private buildFireUrl(params: PixelFireOptions): string {
    let parsed = new URL(params.url);
    if (params.revenueOverride) {
      parsed.searchParams.append('override', params.revenueOverride.toString());
    }
    if (params.additionalRevenue) {
      parsed.searchParams.append('additional', params.additionalRevenue.toString());
    }
    if (params.eventMultiplier) {
      parsed.searchParams.append('eventMultiplier', params.eventMultiplier.toString());
    }

    return parsed.href;
  }

  async fire(
    params: PixelFireOptions,
    additionalOpts?: AdditionalOptions
  ): Promise<PixelFireResponse> {
    let opts: any = {
      method: 'GET',
      headers: {
        'X-Adzerk-Sdk-Version': versionString,
        'User-Agent': additionalOpts?.userAgent || 'OpenAPI-Generator/1.0/js',
      },
      redirect: 'manual',
    };

    let url: string = this.buildFireUrl(params);

    if (!!this._agent) {
      opts.agent = this._agent;
    }

    let result = await this._fetch(url, opts);

    return {
      status: result.status,
      location: result.headers.has('location')
        ? (result.headers.get('location') as string)
        : undefined,
    };
  }
}

export class Client {
  private _decisionClient: DecisionClient;
  private _userDbClient: UserDbClient;
  private _pixelClient: PixelClient;
  private _agent: any;
  private _path?: string;

  constructor(opts: ClientOptions) {
    let fetch: FetchAPI = (opts.fetch || unfetch).bind(global);

    let logger = opts.logger || defaultLogger;
    let protocol: string = opts.protocol || 'https';
    let host: string = opts.host || `e-${opts.networkId}.adzerk.net`;
    let basePath: string = `${protocol}://${host}`;

    this._path = opts.path;

    if (isNode) {
      let { Agent } = protocol === 'https' ? require('https') : require('http');
      this._agent =
        opts.agent ||
        new Agent({
          keepAlive: true,
          timeout: 10 * 1000,
        });
    }

    let middleware: Middleware = {
      pre: async (context: RequestContext): Promise<FetchParams | void> => {
        logger('info', `Request Url: ${context.url}`);
        logger('info', `Request Headers: %o ${context.init.headers}`);
        logger('info', `Request Body: %o ${context.init.body}`);

        // log(`Request Url: ${context.url}`);
        // log('Request Headers: %o', context.init.headers);
        // log('Request Body: %o', context.init.body);

        if (this._agent != undefined) {
          (context.init as any).agent = this._agent;
        }

        if (this._path != undefined) {
          context.url = `${basePath}${this._path}`;
        }

        if (!context.init.headers) {
          context.init.headers = {};
        }

        let headers = context.init.headers as Record<string, string>;
        headers['X-Adzerk-Sdk-Version'] = versionString;

        return context;
      },
      post: async (context: ResponseContext) => {
        logger('info', `Response Code: %s ${context.response.status}`);
        logger('info', `Response Status Text: %s ${context.response.statusText}`);
        // log('Response Code: %s', context.response.status);
        // log('Response Status Text: %s', context.response.statusText);
        return context.response;
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
    this._pixelClient = new PixelClient(fetch, this._agent);
  }

  get decisions(): DecisionClient {
    return this._decisionClient;
  }

  get userDb(): UserDbClient {
    return this._userDbClient;
  }

  get pixels(): PixelClient {
    return this._pixelClient;
  }
}
