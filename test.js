import { Connection, PublicKey } from '@solana/web3.js';
import { getMint, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';

async function handler(publicKey) {

  if (!publicKey) {
    return
  }

  try {
    const connection = new Connection('https://api.devnet.solana.com');
    const userPublicKey = new PublicKey(publicKey);

    const accounts = await connection.getParsedProgramAccounts(TOKEN_2022_PROGRAM_ID, {
      filters: [
        { dataSize: 82 }, // Mint accounts are always 82 bytes
        {
          memcmp: {
            offset: 0, // Mint authority is at offset 0 in the account data
            bytes: userPublicKey.toBase58(),
          },
        },
      ],
    });

    console.log(accounts)

    const mintedTokens = await Promise.all(accounts.map(async (account) => {
      const mintInfo = await getMint(connection, account.pubkey);
      return {
        mint: account.pubkey.toString(),
        mintAuthority: mintInfo.mintAuthority?.toString(),
        freezeAuthority: mintInfo.freezeAuthority?.toString(),
        decimals: mintInfo.decimals,
        supply: mintInfo.supply.toString(),
      };
    }));

    console.log(mintedTokens)
  } catch (error) {
    console.error('Error fetching minted tokens:', error);
  }
}

handler("AJ26J8UT6FdyJDW9WVqZAiE5xZFQJsvMSfYjipaZKRsG")
