import { MOVE_PACKAGE_ID, MOVE_OBJECT_ID } from "@/lib/api/move";
import { gas, sui } from "@/lib/api/shinami";
import { ClaimRequest, ClaimResponse, ClaimResult } from "@/lib/shared/interfaces";
import { first } from "@/lib/shared/utils";
import { buildGaslessTransactionBytes } from "@shinami/clients";
import {
  GaslessTransactionBytesBuilder,
  InvalidRequest,
  TransactionResponseParser,
  zkLoginSponsoredTxExecHandler,
} from "@shinami/nextjs-zklogin/server/pages";
import { mask, validate } from "superstruct";

/**
 * Builds a gasless transaction block according to the request.
 */
const buildTx: GaslessTransactionBytesBuilder = async (req, { wallet }) => {
  const [error, body] = validate(req.body, ClaimRequest);
  if (error) throw new InvalidRequest(error.message);

  console.log("Preparing add tx for zkLogin wallet", wallet);

  const gaslessTxBytes = await buildGaslessTransactionBytes({
    sui,
    build: async (txb) => {
      txb.moveCall({
        target: `${MOVE_PACKAGE_ID}::wecastle::claim`,
        arguments: [
          txb.pure.u64(body.amount),
          txb.object(MOVE_OBJECT_ID),
        ],
      });
    },
  });

  return { gaslessTxBytes, gasBudget: 5_000_000_0 };
};

/**
 * Parses the transaction response.
 */
const parseTxRes: TransactionResponseParser<ClaimResponse> = async (_, txRes) => {
  // Requires "showEvents: true" in tx response options.
  return { txDigest: txRes.digest };
};

export default zkLoginSponsoredTxExecHandler(sui, gas, buildTx, parseTxRes, {
  showEvents: true,
});
