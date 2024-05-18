export interface HashDistributionResult {
  algorithm: string;

  twenty: number;
  fourty: number;
  sixty: number;
  eighty: number;
  hundred: number;

  time: number;
}

export interface RawHashDistributionResult {
  algorithm: string;
  value: number;
  time: number;
}
