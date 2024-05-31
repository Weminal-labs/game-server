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
  PlayerDataRequest,
  PlayerDataResponse,
  UpdateScoreRequest,
  UpdateScoreResponse,
  ClaimRequest,
  ClaimResponse,
  ClaimRewardRequest,
  ClaimRewardResponse,
  UpdateProcessResponse,
  UpdateProcessRequest,
  PurchaseResponse,
  PurchaseRequest
} from "../shared/interfaces";

/**
 * An example mutation to execute a Sui transaction.
 *
 * The mutation presents itself as a simple request / response. Under the hood, it's done in 3 steps:
 * - Call /api/add/tx to construct a sponsored transaction block.
 * - Sign the transaction block with the local ephemeral key pair.
 * - Call /api/add/exec to assemble the zkLogin signature and execute the signed transaction block.
 */

export function usePlayerDataMutation(): UseMutationResult<
  PlayerDataResponse,
  ApiError,
  PlayerDataRequest & WithKeyPair
> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: apiTxExecMutationFn({
      baseUri: () => "/api/get_player_data",
      body: ({ keyPair, ...req }) => req,
      resultSchema: PlayerDataResponse,
    }),
  });
}

export function useUpdateScoreMutation(): UseMutationResult<
  UpdateScoreResponse,
  ApiError,
  UpdateScoreRequest & WithKeyPair
> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: apiTxExecMutationFn({
      baseUri: () => "/api/update_score",
      body: ({ keyPair, ...req }) => req,
      resultSchema: UpdateScoreResponse,
    }),
  });
}

export function useClaimMutation(): UseMutationResult<
  ClaimResponse,
  ApiError,
  ClaimRequest & WithKeyPair
> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: apiTxExecMutationFn({
      baseUri: () => "/api/claim",
      body: ({ keyPair, ...req }) => req,
      resultSchema: ClaimResponse,
    }),
  });
}

export function useClaimRewardMutation(): UseMutationResult<
  ClaimRewardResponse,
  ApiError,
  ClaimRewardRequest & WithKeyPair
> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: apiTxExecMutationFn({
      baseUri: () => "/api/claim_reward",
      body: ({ keyPair, ...req }) => req,
      resultSchema: ClaimRewardResponse,
    }),
  });
}

export function useUpdateProcessMutation(): UseMutationResult<
  UpdateProcessResponse,
  ApiError,
  UpdateProcessRequest & WithKeyPair
> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: apiTxExecMutationFn({
      baseUri: () => "/api/update_process",
      body: ({ keyPair, ...req }) => req,
      resultSchema: UpdateProcessResponse,
    }),
  });
}

export function usePurchaseMutation(): UseMutationResult<
  PurchaseResponse,
  ApiError,
  PurchaseRequest & WithKeyPair
> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: apiTxExecMutationFn({
      baseUri: () => "/api/purchase",
      body: ({ keyPair, ...req }) => req,
      resultSchema: PurchaseResponse,
    }),
  });
}

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
