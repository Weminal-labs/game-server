import type { NextApiRequest, NextApiResponse } from "next";
import { sui } from "@/lib/api/shinami";
import { RecentTxsResponse, ResponseData } from "@/lib/shared/interfaces";
import { withZkLoginUserRequired } from "@shinami/nextjs-zklogin/server/pages";
import { jwtDecode } from "jwt-decode";
import { getFullnodeUrl, SuiClient, SuiEvent } from "@mysten/sui.js/client";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { fromHEX } from "@mysten/sui.js/utils";
import { TransactionBlock } from "@mysten/sui.js/transactions";

export default withZkLoginUserRequired<ResponseData>(
  sui,
  async (_, res, user) => {
    // This Sui query can easily be performed on the client side as well.
    const txs = await sui.queryTransactionBlocks({
      filter: { FromAddress: user.wallet },
      order: "descending",
      limit: 5,
    });

    const client = new SuiClient({
      url: getFullnodeUrl("testnet"),
    });

    // const queryObject = {
    //   query: {
    //     MoveEventType:
    //       "0x91d538aae13a16034109524a474ac5624bdb4d93b4d0304b08437d080f0bc7c6::game::get_city_weather",
    //   },
    // };

      const private_key =
        "200568408c4b2787d8350a7240b2bddd599802367e0cfc95dc390f0feed3dade";
      let keypair = new Ed25519Keypair();
      keypair = Ed25519Keypair.fromSecretKey(fromHEX(private_key));

      const transaction_block = new TransactionBlock()
      transaction_block.moveCall({
        target: `0x0cdf1fcc17d8421230850d8fa89b4eaf1f534133861b2a3b089482d56cdceb5e::game::get_city_weather`,
        arguments: [
          transaction_block.pure.u32(1112),
          transaction_block.object("0xdfe11dab1a5d7296dceacf1dcc44e2fe9d277b6a2a40af1dc26221a0975ffe51"),

        ]
    })
      transaction_block.setGasBudget(100000000)
      let status =await client.signAndExecuteTransactionBlock(
          {
              signer: keypair,
              transactionBlock: transaction_block
          });

      console.log(status)

    const events = await client.queryEvents({
      query: { Sender: "0x3ac247cb867e4ddde0e77081222ae0655029fa2f114068441a006e001d604599" },
      limit: 2,
    });

    console.log("event", events.data[0].parsedJson)

    // res.json({ wallet: user.wallet, jwt: "" } as ResponseData);
  }
);
