import {
  Infer,
  array,
  coerce,
  integer,
  object,
  string,
  boolean,
} from "superstruct";

//weather
export const WeatherRequest = object({
  city: integer(),
});

export type WeatherRequest = Infer<typeof WeatherRequest>;

export const WeatherResult = object({
  city_name: string(),
  clouds: integer(),
  country: string(),
  id: integer(),
  temp: integer(),
  visibility: integer(),
  wind_speed: integer(),
  wind_deg: string(),
  is_rain: boolean(),
  rain_fall: string(),
});

export type WeatherResult = Infer<typeof WeatherResult>;

export const WeatherResponse = object({
  ...WeatherResult.schema,
  txDigest: string(),
});

export type WeatherResponse = Infer<typeof WeatherResponse>;

//player data
export const PlayerDataRequest = object({});

export type PlayerDataRequest = Infer<typeof PlayerDataRequest>;

export const PlayerDataResult = object({
  id: string(),
  score: string(),
});

export type PlayerDataResult = Infer<typeof PlayerDataResult>;

export const PlayerDataResponse = object({
  ...PlayerDataResult.schema,
  txDigest: string(),
});

export type PlayerDataResponse = Infer<typeof PlayerDataResponse>;

//update_score
export const UpdateScoreRequest = object({
  score: integer(),
});

export type UpdateScoreRequest = Infer<typeof UpdateScoreRequest>;

export const UpdateScoreResult = object({});

export type UpdateScoreResult = Infer<typeof UpdateScoreResult>;

export const UpdateScoreResponse = object({
  ...UpdateScoreResult.schema,
  txDigest: string(),
});

export type UpdateScoreResponse = Infer<typeof UpdateScoreResponse>;

//claim
export const ClaimRequest = object({
  amount: integer(),
});

export type ClaimRequest = Infer<typeof ClaimRequest>;

export const ClaimResult = object({});

export type ClaimResult = Infer<typeof ClaimResult>;

export const ClaimResponse = object({
  ...ClaimResult.schema,
  txDigest: string(),
});

export type ClaimResponse = Infer<typeof ClaimResponse>;

//claim-reward
export const ClaimRewardRequest = object({
  id: integer(),
});

export type ClaimRewardRequest = Infer<typeof ClaimRewardRequest>;

export const ClaimRewardResult = object({});

export type ClaimRewardResult = Infer<typeof ClaimRewardResult>;

export const ClaimRewardResponse = object({
  ...ClaimResult.schema,
  txDigest: string(),
});

export type ClaimRewardResponse = Infer<typeof ClaimResponse>;

//update process
export const UpdateProcessRequest = object({
  mission_id: integer(),
  process: integer(),
});

export type UpdateProcessRequest = Infer<typeof UpdateProcessRequest>;

export const UpdateProcessResult = object({});

export type UpdateProcessResult = Infer<typeof UpdateProcessResult>;

export const UpdateProcessResponse = object({
  ...ClaimResult.schema,
  txDigest: string(),
});

export type UpdateProcessResponse = Infer<typeof ClaimResponse>;

//purchase
export const PurchaseRequest = object({
  id_hero: integer(),
  name: string(),
  description: string(),
  img: string(),
  price: integer(),
  money: array(string()),
});

export type PurchaseRequest = Infer<typeof PurchaseRequest>;

export const PurchaseResult = object({
  id: string(),
  hero_id: string(),
});

export type PurchaseResult = Infer<typeof PurchaseResult>;

export const PurchaseResponse = object({
  ...ClaimResult.schema,
  txDigest: string(),
});

export type PurchaseResponse = Infer<typeof ClaimResponse>;

export const RecentTxsResponse = object({
  txDigests: array(string()),
});
export type RecentTxsResponse = Infer<typeof RecentTxsResponse>;

export const ResponseData = object({
  wallet: string(),
  jwt: string(),
});

export type ResponseData = Infer<typeof ResponseData>;
