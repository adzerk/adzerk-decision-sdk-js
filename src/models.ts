import {
  Content,
  Decision,
  DecisionData,
  Event,
  Placement,
  PricingData,
  User,
  Consent,
  DecisionResponse,
} from './generated/models';

interface Decisions {
  [placementName: string]: Array<Decision>;
}

interface TypedResponse extends DecisionResponse {
  decisions?: Decisions;
}

interface DecisionRequest {
  placements: Array<Placement>;
  user?: User;
  keywords?: Array<string> | null;
  url?: string | null;
  referrer?: string | null;
  ip?: string | null;
  blockedCreatives?: string | null;
  includePricingData?: boolean | null;
  notrack?: boolean | null;
  enableBotFiltering?: boolean | null;
  enableUserDBIP?: boolean | null;
  consent?: object | null;
  deviceID?: string | null;
}

export {
  Content,
  Decision,
  Decisions,
  DecisionData,
  Event,
  Placement,
  PricingData,
  DecisionRequest,
  User,
  TypedResponse as DecisionResponse,
  Consent,
};
