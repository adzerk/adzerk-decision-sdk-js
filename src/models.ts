import {
  Content,
  Decision,
  Event,
  Placement,
  PricingData,
  User,
  DecisionResponse,
  DecisionRequest,
} from '@adzerk/api-decision-js';

interface Decisions {
  [placementName: string]: Array<Decision>;
}

interface TypedResponse extends DecisionResponse {
  decisions?: Decisions;
}

export {
  Content,
  Decision,
  Decisions,
  Event,
  Placement,
  PricingData,
  DecisionRequest,
  User,
  TypedResponse as DecisionResponse,
};
