import {
  Content,
  Decision,
  DecisionData,
  Event,
  Placement,
  PricingData,
  Request,
  RequestConsent,
  Response,
  User,
} from './generated/models';

interface Decisions {
  [placementName: string]: Decision;
}

interface MultiWinnerDecisions {
  [placementName: string]: Array<Decision>;
}

export function isDecisionMultiWinner(obj: any): obj is MultiWinnerDecisions {
  if (obj == undefined) {
    return false;
  }

  let keys = Object.keys(obj);
  if (keys.length === 0) {
    return false;
  }
  let firstChild = obj[keys[0]];
  return firstChild instanceof Array;
}

interface TypedResponse extends Response {
  decisions?: Decisions | MultiWinnerDecisions;
}

export {
  Content,
  Decision,
  Decisions,
  MultiWinnerDecisions,
  DecisionData,
  Event,
  Placement,
  PricingData,
  Request,
  RequestConsent,
  User,
  TypedResponse as Response,
};
