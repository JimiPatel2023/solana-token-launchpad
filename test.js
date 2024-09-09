import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import bs58 from "bs58";

const associatedTokenAccountAddress = getAssociatedTokenAddressSync(
    new PublicKey("rpE6jHM5qau6XYiXRToVfjWQE7UohXaeLuuebSVpump"),
    new PublicKey("8Tj79xzQD8NbH3SWBap2Y7z3mxgHwgenKjzzyoka4BsM"),
);

console.log(bs58.encode(associatedTokenAccountAddress.toBuffer()))
  
  