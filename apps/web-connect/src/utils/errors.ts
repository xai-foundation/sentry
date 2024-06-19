export type MappedWeb3Error =
    "Staking not enabled" |
    "Redemption is currently inactive" |
    "Insufficient funds" |
    "User rejected the request" |
    "Maximum staking amount exceeded" |
    "Must complete KYC" |
    "Something went wrong";

export const mapWeb3Error = (error: Error): MappedWeb3Error => {
    if (hasErrorCode(1, error)) {
        // feature is disabled on contract-side
        return "Staking not enabled";
    } else if (error?.message.includes("Redemption is currently inactive")) {
        // feature is disabled on contract-side
        return "Redemption is currently inactive";
    } else if (error?.message.includes("The total cost (gas * gas fee + value) of executing this transaction exceeds the balance of the account.")) {
        // user does not have enough coin to pay for transaction
        return "Insufficient funds";
    } else if (error?.message.includes("User rejected the request")) {
        // user clicked 'Reject' in wallet provider
        return "User rejected the request";
    } else if (hasErrorCode(43, error) || hasErrorCode(49, error)) {
        // user clicked 'Confirm' in stake
        return "Maximum staking amount exceeded";
    }
    else if (hasErrorCode(42, error)) {
        // user clicked 'Confirm' in stake
        return "Must complete KYC";
    } else {
        // unknown error
        console.error("Blockchain transaction failed with error", error);
        return "Something went wrong";
    }
};

export const hasErrorCode = (code: number, error: Error): boolean => {
    if (error?.message.includes(`reverted with the following reason:\n${code}\n`)) {
        return true;
    } else {
        return false;
    }
};