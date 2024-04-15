import {
  ApiError,
  WithKeyPair,
  apiTxExecMutationFn,
} from "@shinami/nextjs-zklogin/client";
import {
  UseMutationResult,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { mask } from "superstruct";
import {
  RecentTxsResponse,
  WeatherRequest,
  WeatherResponse,
  PlayerDataRequest,
  PlayerDataResponse,
  HeroRequest,
  HeroResponse,
  UpdateHeroRequest,
  UpdateHeroResponse,
  UpdateUserLevelRequest,
  UpdateUserLevelResponse,
  UpdateUserResourcesRequest,
  UpdateUserResourcesResponse
} from "../shared/interfaces";

/**
 * An example mutation to execute a Sui transaction.
 *
 * The mutation presents itself as a simple request / response. Under the hood, it's done in 3 steps:
 * - Call /api/add/tx to construct a sponsored transaction block.
 * - Sign the transaction block with the local ephemeral key pair.
 * - Call /api/add/exec to assemble the zkLogin signature and execute the signed transaction block.
 */
export function useWeatherMutation(): UseMutationResult<
  WeatherResponse,
  ApiError,
  WeatherRequest & WithKeyPair
>{
  const qc = useQueryClient();
  return useMutation({
    mutationFn: apiTxExecMutationFn({
      baseUri: () => "/api/weather",
      body: ({ keyPair, ...req }) => req,
      resultSchema: WeatherResponse,
    })
  });
}

export function usePlayerDataMutation(): UseMutationResult<
  PlayerDataResponse,
  ApiError,
  PlayerDataRequest & WithKeyPair
>{
  const qc = useQueryClient();
  return useMutation({
    mutationFn: apiTxExecMutationFn({
      baseUri: () => "/api/get_player_data",
      body: ({ keyPair, ...req }) => req,
      resultSchema: PlayerDataResponse,
    })
  });
}

export function useNewHeroMutation(): UseMutationResult<
  HeroResponse,
  ApiError,
  HeroRequest & WithKeyPair
>{
  const qc = useQueryClient();
  return useMutation({
    mutationFn: apiTxExecMutationFn({
      baseUri: () => "/api/new_hero",
      body: ({ keyPair, ...req }) => req,
      resultSchema: HeroResponse,
    })
  });
}

export function useUpdateHeroMutation(): UseMutationResult<
  UpdateHeroResponse,
  ApiError,
  UpdateHeroRequest & WithKeyPair
>{
  const qc = useQueryClient();
  return useMutation({
    mutationFn: apiTxExecMutationFn({
      baseUri: () => "/api/update_hero",
      body: ({ keyPair, ...req }) => req,
      resultSchema: UpdateHeroResponse,
    })
  });
}

export function useUserResourcesMutation(): UseMutationResult<
  UpdateUserResourcesResponse,
  ApiError,
  UpdateUserResourcesRequest & WithKeyPair
>{
  const qc = useQueryClient();
  return useMutation({
    mutationFn: apiTxExecMutationFn({
      baseUri: () => "/api/update_player_resources",
      body: ({ keyPair, ...req }) => req,
      resultSchema: UpdateUserResourcesResponse,
    })
  });
}

export function useUserLevelMutation(): UseMutationResult<
  UpdateUserLevelResponse,
  ApiError,
  UpdateUserLevelRequest & WithKeyPair
>{
  const qc = useQueryClient();
  return useMutation({
    mutationFn: apiTxExecMutationFn({
      baseUri: () => "/api/update_player_level",
      body: ({ keyPair, ...req }) => req,
      resultSchema: UpdateUserLevelResponse,
    })
  });
}

// export function useAddMutation(): UseMutationResult<
//   AddResponse,
//   ApiError,
//   AddRequest & WithKeyPair
// > {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: apiTxExecMutationFn({
//       baseUri: () => "/api/add",
//       body: ({ keyPair, ...req }) => req,
//       resultSchema: AddResponse,
//     }),
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: ["api", "recent_txs"] });
//     },
//   });
// }

/**
 * An example query to fetch recent transactions from the user's wallet address.
 */
export function useRecentTxsQuery() {
  return useQuery({
    queryKey: ["api", "recent_txs"],
    queryFn: async () => {
      const resp = await fetch("/api/recent_txs");
      if (resp.status !== 200)
        throw new Error(`Failed to fetch recent txs. ${resp.status}`);
      return mask(await resp.json(), RecentTxsResponse);
    },
  });
}
