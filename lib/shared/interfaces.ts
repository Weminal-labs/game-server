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

//user resources
export const UpdateUserResourcesRequest = object({
  wood: integer(),
  gold: integer(),
  meat: integer(),
});

export type UpdateUserResourcesRequest = Infer<
  typeof UpdateUserResourcesRequest
>;

export const UpdateUserResourcesResult = object({});

export type UpdateUserResourcesResult = Infer<typeof UpdateUserResourcesResult>;

export const UpdateUserResourcesResponse = object({
  ...UpdateUserResourcesResult.schema,
  txDigest: string(),
});

export type UpdateUserResourcesResponse = Infer<
  typeof UpdateUserResourcesResponse
>;

//user level
export const UpdateUserLevelRequest = object({
  level: integer(),
  exp: integer(),
  max_exp: integer(),
});

export type UpdateUserLevelRequest = Infer<typeof UpdateUserLevelRequest>;

export const UpdateUserLevelResult = object({});

export type UpdateUserLevelResult = Infer<typeof UpdateUserLevelResult>;

export const UpdateUserLevelResponse = object({
  ...UpdateUserLevelResult.schema,
  txDigest: string(),
});

export type UpdateUserLevelResponse = Infer<typeof UpdateUserLevelResponse>;

//update hero
export const UpdateHeroRequest = object({
  data: array(
    object({
      id: string(),
      name: string(),
      description: string(),
      location_x: integer() || undefined,
      location_y: integer() || undefined,
      health: integer(),
      max_health: integer(),
      damage: integer(),
      speed: integer(),
      level: integer(),
      exp: integer(),
      max_exp: integer(),
      hero_id: string(),
    })
  ),
});

export type UpdateHeroRequest = Infer<typeof UpdateHeroRequest>;

export const UpdateHeroResult = object({});

export type UpdateHeroResult = Infer<typeof UpdateHeroResult>;

export const UpdateHeroResponse = object({
  ...UpdateHeroResult.schema,
  txDigest: string(),
});

export type UpdateHeroResponse = Infer<typeof UpdateHeroResponse>;

export const RecentTxsResponse = object({
  txDigests: array(string()),
});
export type RecentTxsResponse = Infer<typeof RecentTxsResponse>;

export const ResponseData = object({
  wallet: string(),
  jwt: string(),
});

export type ResponseData = Infer<typeof ResponseData>;
