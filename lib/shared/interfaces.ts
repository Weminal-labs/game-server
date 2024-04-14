import exp from "constants";
import { max } from "rxjs";
import {
  Infer,
  array,
  coerce,
  integer,
  object,
  string,
  boolean,
} from "superstruct";
import { number } from "yup";

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
  exp: integer(),
  gold: integer(),
  id: string(),
  level: integer(),
  max_exp: integer(),
  meat: integer(),
  wood: integer(),
});

export type PlayerDataResult = Infer<typeof PlayerDataResult>;

export const PlayerDataResponse = object({
  ...PlayerDataResult.schema,
  txDigest: string(),
});

export type PlayerDataResponse = Infer<typeof PlayerDataResponse>;

//new hero
export const HeroRequest = object({
  type_hero: integer(),
  max_health: integer(),
  damage: integer(),
  speed: integer(),
  exp: integer(),
  max_exp: integer(),
  name: string(),
  description: string(),
  url: string(),
});

export type HeroRequest = Infer<typeof HeroRequest>;

export const HeroResult = object({
  hero_id: string(),
  id: string(),
  owner: string(),
});

export type HeroResult = Infer<typeof HeroResult>;

export const HeroResponse = object({
  ...HeroResult.schema,
  txDigest: string(),
});

export type HeroResponse = Infer<typeof HeroResponse>;

export const RecentTxsResponse = object({
  txDigests: array(string()),
});
export type RecentTxsResponse = Infer<typeof RecentTxsResponse>;

export const ResponseData = object({
  wallet: string(),
  jwt: string(),
});

export type ResponseData = Infer<typeof ResponseData>;
