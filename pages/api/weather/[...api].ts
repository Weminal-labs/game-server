import { MOVE_PACKAGE_ID, MOVE_OBJECT_ID } from "@/lib/api/move";
import { gas, sui } from "@/lib/api/shinami";
import { WeatherRequest, WeatherResponse, WeatherResult } from "@/lib/shared/interfaces";
import { first } from "@/lib/shared/utils";
import { buildGaslessTransactionBytes } from "@shinami/clients";
import {
  GaslessTransactionBytesBuilder,
  InvalidRequest,
  TransactionResponseParser,
  zkLoginSponsoredTxExecHandler,
  zkLoginTxExecHandler
} from "@shinami/nextjs-zklogin/server/pages";
import { mask, validate } from "superstruct";

/**
 * Builds a gasless transaction block according to the request.
 */
const buildTx: GaslessTransactionBytesBuilder = async (req, { wallet }) => {
  const [error, body] = validate(req.body, WeatherRequest);
  if (error) throw new InvalidRequest(error.message);

  console.log("Preparing add tx for zkLogin wallet", wallet, body.city);

  const gaslessTxBytes = await buildGaslessTransactionBytes({
    sui,
    build: async (txb) => {
      txb.moveCall({
        target: `${MOVE_PACKAGE_ID}::game::get_city_weather`,
        arguments: [
          txb.pure.u32(body.city),
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
const parseTxRes: TransactionResponseParser<WeatherResponse> = async (_, txRes) => {
  // Requires "showEvents: true" in tx response options.
  const event = first(txRes.events);
  if (!event) throw new Error("Event missing from tx response");

  const result = mask(event.parsedJson, WeatherResult);
  return { ...result, txDigest: txRes.digest };
};

/**
 * An example API route handler providing seamless support for transaction building, sponsorship,
 * and execution.
 *
 * You can also use "zkLoginTxExecHandler" to implement non-sponsored transactions, which would
 * require the user's zkLogin wallet to have enough gas.
 *
 * Both "zkLoginSponsoredTxExecHandler" and "zkLoginTxExecHandler" are auth-protected, requiring the
 * user to have a live session.
 */
export default zkLoginSponsoredTxExecHandler(sui, gas, buildTx, parseTxRes, {
  showEvents: true,
});
