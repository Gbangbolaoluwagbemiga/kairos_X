import { ethers } from "ethers";

export type HashkeyChainConfig = {
    rpcUrl: string;
    chainId?: number;
    treasuryPrivateKey: string;
};

export type HashkeySpendPolicyConfig = {
    spendingPolicyAddress?: string; // optional
};

const SPENDING_POLICY_ABI = [
    "function canSpend(bytes32 agentKey,uint256 amountWei) view returns (bool)",
    "function remaining(bytes32 agentKey) view returns (uint256)",
    "function recordSpend(bytes32 agentKey,uint256 amountWei)",
];

function mustGetEnv(name: string): string {
    const v = (process.env[name] || "").trim();
    if (!v) throw new Error(`${name} is not set`);
    return v;
}

export function loadHashkeyConfigFromEnv(): HashkeyChainConfig {
    return {
        rpcUrl: mustGetEnv("HASHKEY_RPC_URL"),
        chainId: process.env.HASHKEY_CHAIN_ID ? Number(process.env.HASHKEY_CHAIN_ID) : undefined,
        treasuryPrivateKey: mustGetEnv("HASHKEY_TREASURY_PRIVATE_KEY"),
    };
}

export function hashkeyProvider(cfg: HashkeyChainConfig): ethers.JsonRpcProvider {
    return new ethers.JsonRpcProvider(cfg.rpcUrl, cfg.chainId);
}

/**
 * Sends a native HSK transfer (treasury -> agent) and returns the tx hash.
 * Uses serialized callers upstream to avoid nonce races.
 */
export async function sendTreasuryPayment(args: {
    cfg: HashkeyChainConfig;
    to: string;
    amountWei: bigint;
    agentKey: string;
    label: string;
    spendingPolicy?: HashkeySpendPolicyConfig;
}): Promise<string> {
    const provider = hashkeyProvider(args.cfg);
    const wallet = new ethers.Wallet(args.cfg.treasuryPrivateKey, provider);

    // Optional: enforce spending policy (trusted backend records spends)
    if (args.spendingPolicy?.spendingPolicyAddress) {
        const policy = new ethers.Contract(args.spendingPolicy.spendingPolicyAddress, SPENDING_POLICY_ABI, wallet);
        const key = ethers.keccak256(ethers.toUtf8Bytes(args.agentKey));
        const ok: boolean = await policy.canSpend(key, args.amountWei);
        if (!ok) {
            const rem: bigint = await policy.remaining(key);
            throw new Error(
                `Spending policy blocked ${args.agentKey}: remaining=${ethers.formatEther(rem)} HSK, requested=${ethers.formatEther(args.amountWei)} HSK`
            );
        }
    }

    // Put label into tx metadata only via logs off-chain; native transfers can't carry memo.
    const tx = await wallet.sendTransaction({
        to: args.to,
        value: args.amountWei,
    });

    // Record spend after broadcast (best-effort; do not fail the payment if this fails)
    if (args.spendingPolicy?.spendingPolicyAddress) {
        try {
            const policy = new ethers.Contract(args.spendingPolicy.spendingPolicyAddress, SPENDING_POLICY_ABI, wallet);
            const key = ethers.keccak256(ethers.toUtf8Bytes(args.agentKey));
            const rec = await policy.recordSpend(key, args.amountWei);
            void rec.wait().catch(() => {});
        } catch (e) {
            // non-fatal
            console.warn(`[HashKey] recordSpend failed for ${args.agentKey} (${args.label}):`, (e as Error)?.message);
        }
    }

    return tx.hash;
}

/**
 * Optional "true A2A" transfer: agent wallet pays another agent wallet.
 * If you don't provide the agent private key, caller should skip A2A.
 */
export async function sendAgentToAgentPayment(args: {
    rpcUrl: string;
    chainId?: number;
    fromPrivateKey: string;
    to: string;
    amountWei: bigint;
}): Promise<string> {
    const provider = new ethers.JsonRpcProvider(args.rpcUrl, args.chainId);
    const wallet = new ethers.Wallet(args.fromPrivateKey, provider);
    const tx = await wallet.sendTransaction({ to: args.to, value: args.amountWei });
    return tx.hash;
}

