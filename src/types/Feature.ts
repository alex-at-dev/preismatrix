import { TierValue } from './TierValue';

export interface Feature {
  name: string;
  description?: string;
  tiers: TierValue[];
}
