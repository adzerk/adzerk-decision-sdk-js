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

interface TypedResponse extends Response {
  decisions?: Decisions | MultiWinnerDecisions;
}

export {
  Content,
  Decision,
  DecisionData,
  Event,
  Placement,
  PricingData,
  Request,
  RequestConsent,
  User,
  TypedResponse as Response,
};
