import { MOVE_PACKAGE_ID, MOVE_OBJECT_ID } from "@/lib/api/move";
import { gas, sui } from "@/lib/api/shinami";
import { UpdateHeroRequest, UpdateHeroResponse } from "@/lib/shared/interfaces";
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
  const [error, body] = validate(req.body, UpdateHeroRequest);
  if (error) throw new InvalidRequest(error.message);

  console.log("Preparing add tx for zkLogin wallet", wallet, body);

  const gaslessTxBytes = await buildGaslessTransactionBytes({
    sui,
    build: async (txb) => {
      txb.moveCall({
        target: `${MOVE_PACKAGE_ID}::game::update_hero`,
        arguments: [
          txb.pure.u16(body.data[4].location_x < 0 ? 0 : body.data[4].location_x),
          txb.pure.u16(body.data[4].location_y < 0 ? 0 : body.data[4].location_y),
          txb.pure.u16(body.data[4].health),
          txb.pure.u16(body.data[4].max_health),
          txb.pure.u16(body.data[4].damage),
          txb.pure.u16(body.data[4].speed),
          txb.pure.u16(body.data[4].level),
          txb.pure.u16(body.data[4].exp),
          txb.pure.u16(body.data[4].max_exp),
          txb.object(body.data[4].id),
        ],
      });
    },
  });

  return { gaslessTxBytes, gasBudget: 5_000_000_0 };
};

/**
 * Parses the transaction response.
 */
const parseTxRes: TransactionResponseParser<UpdateHeroResponse> = async (
  _,
  txRes
) => {
  return { txDigest: txRes.digest };
};

export default zkLoginSponsoredTxExecHandler(sui, gas, buildTx, parseTxRes, {
  showEvents: true,
});
