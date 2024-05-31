import { MOVE_PACKAGE_ID, MOVE_OBJECT_ID } from "@/lib/api/move";
import { gas, sui } from "@/lib/api/shinami";
import {
  PurchaseRequest,
  PurchaseResponse,
  PurchaseResult,
} from "@/lib/shared/interfaces";
import { first } from "@/lib/shared/utils";
import { buildGaslessTransactionBytes } from "@shinami/clients";
import {
  GaslessTransactionBytesBuilder,
  InvalidRequest,
  TransactionResponseParser,
  zkLoginSponsoredTxExecHandler,
  zkLoginTxExecHandler,
} from "@shinami/nextjs-zklogin/server/pages";
import { mask, validate } from "superstruct";

/**
 * Builds a gasless transaction block according to the request.
 */
const buildTx: GaslessTransactionBytesBuilder = async (req, { wallet }) => {
  const [error, body] = validate(req.body, PurchaseRequest);
  if (error) throw new InvalidRequest(error.message);
  console.log("body", body);

  console.log("Preparing add tx for zkLogin wallet", wallet);

  const gaslessTxBytes = await buildGaslessTransactionBytes({
    sui,
    build: async (txb) => {
      txb.moveCall({
        target: `${MOVE_PACKAGE_ID}::wecastle::purchase`,
        arguments: [
          txb.pure.u16(body.id_hero),
          txb.pure.string(body.name),
          txb.pure.string(body.description),
          txb.pure.string(body.img),
          txb.pure.u64(body.price),
          txb.makeMoveVec({ objects: body.money.map((m) => txb.object(m)) }),
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
const parseTxRes: TransactionResponseParser<PurchaseResponse> = async (
  _,
  txRes
) => {
  // Requires "showEvents: true" in tx response options.
  const event = first(txRes.events);
  if (!event) throw new Error("Event missing from tx response");

  const result = mask(event.parsedJson, PurchaseResult);
  return { ...result, txDigest: txRes.digest };
};

export default zkLoginSponsoredTxExecHandler(sui, gas, buildTx, parseTxRes, {
  showEvents: true,
});
