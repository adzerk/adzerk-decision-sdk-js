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
  GdprConsent,
  Consent,
} from './generated/models';

interface Decisions {
  [placementName: string]: Array<Decision>;
}

interface TypedResponse extends Response {
  decisions?: Decisions;
}

export {
  Content,
  Decision,
  Decisions,
  DecisionData,
  Event,
  Placement,
  PricingData,
  Request,
  RequestConsent,
  User,
  TypedResponse as Response,
  GdprConsent,
  Consent,
};
