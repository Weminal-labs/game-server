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
      body.data.forEach((hero) => {
        txb.moveCall({
          target: `${MOVE_PACKAGE_ID}::game::update_hero`,
          arguments: [
            txb.pure.u16(hero.location_x || 0),
            txb.pure.u16(hero.location_y || 0),
            txb.pure.u16(hero.health),
            txb.pure.u16(hero.max_health),
            txb.pure.u16(hero.damage),
            txb.pure.u16(hero.speed),
            txb.pure.u16(hero.level),
            txb.pure.u16(hero.exp),
            txb.pure.u16(hero.max_exp),
            txb.object(hero.hero_id),
            txb.object(MOVE_OBJECT_ID),
          ],
        });
      });
    },
  });

  return { gaslessTxBytes, gasBudget: 1_000_000_00 };
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
