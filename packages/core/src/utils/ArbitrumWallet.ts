import { ethers } from 'ethers';

/**
 * Priority fee (tip) attached to every transaction, in wei. Default 0.
 *
 * Since 2026-09-23 ~17:20 UTC the Arbitrum One sequencer charges the EIP-1559
 * priority fee instead of ignoring it. ethers v6 defaults the tip to 1 gwei,
 * which is ~50x the Arbitrum base fee (0.02 gwei) and was dominating our fees.
 * The sequencer still orders by arrival, so a 0 tip does not delay inclusion.
 */
// Guarded like config.ts: `process` is not defined in the Electron renderer.
const MAX_PRIORITY_FEE_WEI = BigInt(
    (typeof process !== 'undefined' && process.env && process.env.SENTRY_MAX_PRIORITY_FEE_WEI) || "0"
);

/** maxFeePerGas = max(baseFee * MULTIPLIER, FLOOR). Only the base fee is actually paid. */
const MAX_FEE_BASE_MULTIPLIER = 3n;
const MAX_FEE_FLOOR_WEI = 100_000_000n; // 0.1 gwei, 5x the 0.02 gwei Arbitrum floor

/**
 * ethers.Wallet that pins EIP-1559 fees for Arbitrum One instead of using the
 * ethers v6 defaults (tip = 1 gwei, maxFee = 2*baseFee + tip).
 * Explicit fee fields passed by a caller are left untouched.
 */
export class ArbitrumWallet extends ethers.Wallet {
    /** ethers.Wallet.connect returns a plain Wallet; keep the fee logic when re-connecting. */
    connect(provider: null | ethers.Provider): ArbitrumWallet {
        return new ArbitrumWallet(this.signingKey, provider);
    }

    async populateTransaction(tx: ethers.TransactionRequest): Promise<ethers.TransactionLike<string>> {
        const feesAlreadySet = tx.gasPrice != null || tx.maxFeePerGas != null || tx.maxPriorityFeePerGas != null;
        if (!feesAlreadySet && this.provider) {
            const block = await this.provider.getBlock("latest");
            const baseFee = block?.baseFeePerGas ?? 0n;
            const scaled = baseFee * MAX_FEE_BASE_MULTIPLIER;
            const maxFeePerGas = (scaled > MAX_FEE_FLOOR_WEI ? scaled : MAX_FEE_FLOOR_WEI) + MAX_PRIORITY_FEE_WEI;
            tx = { ...tx, type: 2, maxPriorityFeePerGas: MAX_PRIORITY_FEE_WEI, maxFeePerGas };
        }
        return super.populateTransaction(tx);
    }
}
