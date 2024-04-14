import { MOVE_PACKAGE_ID, MOVE_OBJECT_ID } from "@/lib/api/move";
import { gas, sui } from "@/lib/api/shinami";
import { UpdateUserLevelResponse, UpdateUserLevelRequest, UpdateUserLevelResult } from "@/lib/shared/interfaces";
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
  const [error, body] = validate(req.body, UpdateUserLevelRequest);
  if (error) throw new InvalidRequest(error.message);

  console.log("Preparing add tx for zkLogin wallet", wallet, body);

  const gaslessTxBytes = await buildGaslessTransactionBytes({
    sui,
    build: async (txb) => {
      txb.moveCall({
        target: `${MOVE_PACKAGE_ID}::game::update_player_resources`,
        arguments: [
          txb.pure.u16(body.exp),
          txb.pure.u32(body.level),
          txb.pure.u32(body.max_exp),
          txb.object(MOVE_OBJECT_ID),
        ],
      });
    },
  });

  return { gaslessTxBytes, gasBudget: 1_000_000_00 };
};

/**
 * Parses the transaction response.
 */
const parseTxRes: TransactionResponseParser<UpdateUserLevelResponse> = async (
  _,
  txRes
) => {
  // Requires "showEvents: true" in tx response options.
  return { txDigest: txRes.digest };
};

export default zkLoginSponsoredTxExecHandler(sui, gas, buildTx, parseTxRes);
