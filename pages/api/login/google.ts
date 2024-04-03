import type { NextApiRequest, NextApiResponse } from "next";
import { sui } from "@/lib/api/shinami";
import { RecentTxsResponse, ResponseData } from "@/lib/shared/interfaces";
import { withZkLoginUserRequired } from "@shinami/nextjs-zklogin/server/pages";
import { jwtDecode } from "jwt-decode";

export default withZkLoginUserRequired<ResponseData>(
  sui,
  async (_, res, user) => {
    // This Sui query can easily be performed on the client side as well.
    const txs = await sui.queryTransactionBlocks({
      filter: { FromAddress: user.wallet },
      order: "descending",
      limit: 5,
    });

    console.log("check", user);

    
    res.json({ wallet: user.wallet, jwt: "" } as ResponseData);
  }
);
