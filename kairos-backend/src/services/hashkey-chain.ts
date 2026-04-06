import { ethers } from "ethers";
import { loadHashkeyConfigFromEnv, hashkeyProvider } from "./hashkey.js";

export async function getHskBalance(address: string): Promise<string> {
    const cfg = loadHashkeyConfigFromEnv();
    const provider = hashkeyProvider(cfg);
    const bal = await provider.getBalance(address);
    return ethers.formatEther(bal);
}

