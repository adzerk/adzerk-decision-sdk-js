import {
  Content,
  Decision,
  Event,
  Placement,
  PricingData,
  User,
  DecisionResponse,
  DecisionRequest,
} from './generated/models';

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
