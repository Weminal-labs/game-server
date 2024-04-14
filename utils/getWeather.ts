import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { fromHEX } from "@mysten/sui.js/utils";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { getFullnodeUrl, SuiClient } from "@mysten/sui.js/client";

export default async function getWeatherCity() {

  const txb = new TransactionBlock();
  txb.moveCall({
    target: `0xcec636594c25ea30ff0cadcabf8d92e3e37aad966722e68fbaa63adc00b32a9b::game::get_city_weather`,
    arguments: [
      txb.pure.u32(getRandomIntInclusive(1112, 1119)),
      txb.object(
        "0xd88aa2be6c001299004b1c22bb85cd45b0606e174e9a21ebdc5f36fbde7c3f6c"
      ),
    ],
  });
  //test
  const rpcUrl = getFullnodeUrl("testnet");
  const client = new SuiClient({ url: rpcUrl });
  const private_key =
    "e9dba25e2c1999461f8cf27cf137d4218c9bc1fb425ea7c36a19b92cec0efe3b";
  let keypair = new Ed25519Keypair();
  keypair = Ed25519Keypair.fromSecretKey(fromHEX(private_key));
  let result = await client.signAndExecuteTransactionBlock({
    signer: keypair,
    transactionBlock: txb,
    options: { showEvents: true },
  });

  if (!result.events) {
    throw new Error("No events found");
  }

  console.log(result.events[0].parsedJson);

  return result.events[0].parsedJson;
}

function getRandomIntInclusive(min : number, max : number) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); // The maximum is inclusive and the minimum is inclusive
}

