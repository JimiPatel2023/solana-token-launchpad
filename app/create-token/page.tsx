"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Image from "next/image";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Connection, Keypair, SystemProgram, Transaction, clusterApiUrl, sendAndConfirmTransaction } from "@solana/web3.js";
import { ExtensionType, TOKEN_2022_PROGRAM_ID, createInitializeMintInstruction, getMintLen, createInitializeMetadataPointerInstruction, getMint, getMetadataPointerState, getTokenMetadata, TYPE_SIZE, LENGTH_SIZE } from "@solana/spl-token";
import { createInitializeInstruction, createUpdateFieldInstruction, createRemoveKeyInstruction, pack, TokenMetadata } from "@solana/spl-token-metadata";
import { div } from "framer-motion/client";

export default function CreateToken() {
	const wallet = useWallet();
	const { connection } = useConnection();

	const [tokenName, setTokenName] = useState("");
	const [tokenSymbol, setTokenSymbol] = useState("");
	const [imageLink, setImageLink] = useState("");
	const [previewImage, setPreviewImage] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	async function createToken(e: React.FormEvent) {
		e.preventDefault();
		setIsLoading(true);
		try {
			if (!wallet.publicKey) return new Error("Wallet not connected");
			const mint = Keypair.generate();
			const decimals = 6;
			const jsonFilePath = await fetch("https://www.npoint.io/documents", {
                "headers": {
                  "accept": "application/json, text/plain, */*",
                  "accept-language": "en-US,en;q=0.9,gu;q=0.8,en-GB;q=0.7,ja;q=0.6",
                  "cache-control": "no-cache",
                  "content-type": "application/json;charset=UTF-8",
                  "pragma": "no-cache",
                  "priority": "u=1, i",
                  "sec-ch-ua": "\"Chromium\";v=\"128\", \"Not;A=Brand\";v=\"24\", \"Google Chrome\";v=\"128\"",
                  "sec-ch-ua-mobile": "?0",
                  "sec-ch-ua-platform": "\"Windows\"",
                  "sec-fetch-dest": "empty",
                  "sec-fetch-mode": "cors",
                  "sec-fetch-site": "same-origin",
                  "x-csrf-token": "H/z3goS6f/1Ch3D0ynhpY0iMTey7NWN9Ub1HaZ5hU9GOwuVNg+kUVg0htP2XR332gp6f3C9aBVWfWWoAoCrg2w==",
                  "cookie": "_ga=GA1.2.2027467758.1725887230; _gid=GA1.2.1437861927.1725887230; crisp-client%2Fsession%2F6a4a83f5-2991-4055-9980-307cf3d01be0=session_0a4932a0-b4aa-4a7d-96eb-3a8f47ee851a; _ga_ELZDC02KWL=GS1.2.1725887231.1.1.1725887880.0.0.0; _npoint_session=UUFQYVVhTlN0TGg4RG0va1Ivc2twU0VRVjNpREQzRFdLZGZuNnlGeTNsVG4vMzMramN5NUpJa3NkSERNa01EdFlUa3BLSVduQmNRdGtwUHUvN01HdlI0SnZSZkpybzBoVGlkeWpMMTAwd2lndVF5UXJpbkhKQVo1YmdydkpkRkRzUGlSSXdYUU5ISy94R0gweEZYeFZBPT0tLVNVeDJZa3pWVjBjTWtydWNNRC9QR3c9PQ%3D%3D--2b1cbb419543b3ccd766901babf5246b493eab18",
                  "Referer": "https://www.npoint.io/",
                  "Referrer-Policy": "strict-origin-when-cross-origin"
                },
                "body": "{\"contents\":\"{\\n  \\\"name\\\": \\\"Pepe the frog\\\",\\n  \\\"symbol\\\": \\\"pepe\\\",\\n  \\\"description\\\": \\\"Only Possible On Solana\\\",\\n  \\\"image\\\": \\\"https://upload.wikimedia.org/wikipedia/en/thumb/6/63/Feels_good_man.jpg/200px-Feels_good_man.jpg\\\"\\n}\"}",
                "method": "POST"
              });
			const data = await jsonFilePath.json();
			if (!data.api_url) return new Error("Failed to generate JSON file");
			const metadata = {
				mint: mint.publicKey,
				name: tokenName,
				symbol: tokenSymbol,
				uri: data.api_url,
				additionalMetadata: [],
			};
			const metadataExtension = TYPE_SIZE + LENGTH_SIZE;
			const metadataLen = pack(metadata).length;
			const mintLen = getMintLen([ExtensionType.MetadataPointer]);
			const lamports = await connection.getMinimumBalanceForRentExemption(mintLen + metadataExtension + metadataLen);
			const createAccountInstruction = SystemProgram.createAccount({
				fromPubkey: wallet.publicKey, // Account that will transfer lamports to created account
				newAccountPubkey: mint.publicKey, // Address of the account to create
				space: mintLen, // Amount of bytes to allocate to the created account
				lamports, // Amount of lamports transferred to created account
				programId: TOKEN_2022_PROGRAM_ID, // Program assigned as owner of created account
			});
			const initializeMetadataPointerInstruction = createInitializeMetadataPointerInstruction(
				mint.publicKey, // Mint Account address
				wallet.publicKey, // Authority that can set the metadata address
				mint.publicKey, // Account address that holds the metadata
				TOKEN_2022_PROGRAM_ID
			);
			const initializeMintInstruction = createInitializeMintInstruction(
				mint.publicKey, // Mint Account Address
				decimals, // Decimals of Mint
				wallet.publicKey, // Designated Mint Authority
				null, // Optional Freeze Authority
				TOKEN_2022_PROGRAM_ID // Token Extension Program ID
			);
			const initializeMetadataInstruction = createInitializeInstruction({
				programId: TOKEN_2022_PROGRAM_ID, // Token Extension Program as Metadata Program
				metadata: mint.publicKey, // Account address that holds the metadata
				updateAuthority: wallet.publicKey, // Authority that can update the metadata
				mint: mint.publicKey, // Mint Account address
				mintAuthority: wallet.publicKey, // Designated Mint Authority
				name: tokenName,
				symbol: tokenSymbol,
				uri: data.api_url,
			});

			const transaction = new Transaction().add(createAccountInstruction, initializeMetadataPointerInstruction, initializeMintInstruction, initializeMetadataInstruction);

			transaction.feePayer = wallet.publicKey;
			transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

			transaction.partialSign(mint);

			await wallet.sendTransaction(transaction, connection);

			console.log("Token created successfully");
			console.log(mint.publicKey.toBase58());
		} catch (error) {
			console.log(error);
		}
		setIsLoading(false);
	}

	return (
		<div className="container mx-auto px-4 py-16">
			<motion.h1 className="text-5xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
				Create Your Solana Token
			</motion.h1>
			<motion.div className="max-w-md mx-auto bg-[#1E293B]/50 backdrop-blur-xl rounded-xl overflow-hidden border border-[#3730A3]/20 shadow-xl p-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
				{wallet.connected ? (
					<form onSubmit={createToken}>
						<div className="mb-6">
							<label htmlFor="tokenName" className="block text-sm font-medium text-gray-300 mb-2">
								Token Name
							</label>
							<input type="text" id="tokenName" value={tokenName} onChange={(e) => setTokenName(e.target.value)} className="w-full px-3 py-2 bg-[#0F172A] border border-[#3730A3]/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-600" required />
						</div>
						<div className="mb-6">
							<label htmlFor="tokenSymbol" className="block text-sm font-medium text-gray-300 mb-2">
								Token Symbol
							</label>
							<input type="text" id="tokenSymbol" value={tokenSymbol} onChange={(e) => setTokenSymbol(e.target.value)} className="w-full px-3 py-2 bg-[#0F172A] border border-[#3730A3]/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-600" required />
						</div>
						<div className="mb-6">
							<label htmlFor="imageLink" className="block text-sm font-medium text-gray-300 mb-2">
								Image URL
							</label>
							<input type="url" id="imageLink" value={imageLink} onChange={(e) => setImageLink(e.target.value)} className="w-full px-3 py-2 bg-[#0F172A] border border-[#3730A3]/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-600" required />
						</div>
						<motion.button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 ease-out" whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(147, 51, 234, 0.5)" }} whileTap={{ scale: 0.95 }} disabled={isLoading}>
							{isLoading ? (
								<div className="flex items-center gap-2 justify-center">
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>Sending the transaction...
								</div>
							) : (
								"Create Token"
							)}
						</motion.button>
					</form>
				) : (
					<div className="text-center">
						<p className="text-lg text-gray-300 mb-6">Connect your wallet to create a token</p>
						<WalletMultiButton className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300" />
					</div>
				)}
			</motion.div>
		</div>
	);
}
