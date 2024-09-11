"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Image from "next/image";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Connection, Keypair, SystemProgram, Transaction, clusterApiUrl, sendAndConfirmTransaction, PublicKey } from "@solana/web3.js";
import { ExtensionType, TOKEN_2022_PROGRAM_ID, createInitializeMintInstruction, getMintLen, createInitializeMetadataPointerInstruction, getMint, getMetadataPointerState, getTokenMetadata, TYPE_SIZE, LENGTH_SIZE, createMintToInstruction, createAssociatedTokenAccountInstruction, getAssociatedTokenAddress } from "@solana/spl-token";
import { createInitializeInstruction, createUpdateFieldInstruction, createRemoveKeyInstruction, pack, TokenMetadata } from "@solana/spl-token-metadata";
import { div } from "framer-motion/client";
import { createJsonFile } from "../actions/createJsonFile";
import { UploadClient, uploadFile } from "@uploadcare/upload-client";
import { showToast } from "../../components/CustomToast";

export default function CreateToken() {
	const wallet = useWallet();
	const { connection } = useConnection();

	const [tokenName, setTokenName] = useState("");
	const [tokenSymbol, setTokenSymbol] = useState("");
	const [imageLink, setImageLink] = useState("");
	const [previewImage, setPreviewImage] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [mintAmount, setMintAmount] = useState("");

	const client = new UploadClient({ publicKey: "cc87fc23a7530ef37796" });

	const createAndUploadMetadata = async (name: string, symbol: string, description: string, imageUrl: string) => {
		const metadata = JSON.stringify({
			name,
			symbol,
			description,
			image: imageUrl,
		});

		const metadataFile = new File([metadata], "metadata.json", { type: "application/json" });

		try {
			const result = await client.uploadFile(metadataFile);
			console.log("Upload successful:", result);
			return result.cdnUrl;
		} catch (error) {
			console.error("Upload failed:", error);
			throw error;
		}
	};

	async function createToken(e: React.FormEvent) {
		e.preventDefault();
		setIsLoading(true);
		try {
			if (!wallet.publicKey) throw new Error("Wallet not connected");
			const mint = Keypair.generate();
			const decimals = 6;
			const metadataUrl = await createAndUploadMetadata(tokenName, tokenSymbol, "This is for developmental purpose.", imageLink);
			if (!metadataUrl) throw new Error("Failed to generate metadata URL");
			console.log(metadataUrl);
			const metadata = {
				mint: mint.publicKey,
				name: tokenName,
				symbol: tokenSymbol,
				uri: metadataUrl,
				additionalMetadata: [],
			};
			const metadataExtension = TYPE_SIZE + LENGTH_SIZE;
			const metadataLen = pack(metadata).length;
			const mintLen = getMintLen([ExtensionType.MetadataPointer]);
			const lamports = await connection.getMinimumBalanceForRentExemption(mintLen + metadataExtension + metadataLen);
			const createAccountInstruction = SystemProgram.createAccount({
				fromPubkey: wallet.publicKey,
				newAccountPubkey: mint.publicKey,
				space: mintLen,
				lamports,
				programId: TOKEN_2022_PROGRAM_ID,
			});
			const initializeMetadataPointerInstruction = createInitializeMetadataPointerInstruction(mint.publicKey, wallet.publicKey, mint.publicKey, TOKEN_2022_PROGRAM_ID);
			const initializeMintInstruction = createInitializeMintInstruction(mint.publicKey, decimals, wallet.publicKey, null, TOKEN_2022_PROGRAM_ID);
			const initializeMetadataInstruction = createInitializeInstruction({
				programId: TOKEN_2022_PROGRAM_ID,
				metadata: mint.publicKey,
				updateAuthority: wallet.publicKey,
				mint: mint.publicKey,
				mintAuthority: wallet.publicKey,
				name: tokenName,
				symbol: tokenSymbol,
				uri: metadataUrl,
			});

			const transaction = new Transaction().add(createAccountInstruction, initializeMetadataPointerInstruction, initializeMintInstruction, initializeMetadataInstruction);

			// Create associated token account for the user
			const associatedTokenAddress = await getAssociatedTokenAddress(mint.publicKey, wallet.publicKey, false, TOKEN_2022_PROGRAM_ID);

			const createAssociatedTokenAccountIx = createAssociatedTokenAccountInstruction(wallet.publicKey, associatedTokenAddress, wallet.publicKey, mint.publicKey, TOKEN_2022_PROGRAM_ID);

			transaction.add(createAssociatedTokenAccountIx);

			// Mint tokens to the user's associated token account
			const mintAmountBigInt = BigInt(parseFloat(mintAmount) * Math.pow(10, decimals));
			const mintToIx = createMintToInstruction(mint.publicKey, associatedTokenAddress, wallet.publicKey, mintAmountBigInt, [], TOKEN_2022_PROGRAM_ID);

			transaction.add(mintToIx);

			transaction.feePayer = wallet.publicKey;
			transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

			transaction.partialSign(mint);

			await wallet.sendTransaction(transaction, connection);

			console.log("Token created and minted successfully");
			console.log(mint.publicKey.toBase58());
			showToast("Token created and minted successfully!", "success");
		} catch (error) {
			console.log(error);
			showToast("Failed to create and mint token. Please try again.", "error");
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
						<div className="mb-6">
							<label htmlFor="mintAmount" className="block text-sm font-medium text-gray-300 mb-2">
								Mint Amount
							</label>
							<input type="number" id="mintAmount" value={mintAmount} onChange={(e) => setMintAmount(e.target.value)} min="0" step="0.000001" className="w-full px-3 py-2 bg-[#0F172A] border border-[#3730A3]/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-600" required />
						</div>
						<motion.button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 ease-out" whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(147, 51, 234, 0.5)" }} whileTap={{ scale: 0.95 }} disabled={isLoading}>
							{isLoading ? (
								<div className="flex items-center gap-2 justify-center">
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>Sending the transaction...
								</div>
							) : (
								"Create and Mint Token"
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
