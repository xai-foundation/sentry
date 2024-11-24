export const SEPOLIA_DEPLOY_OPTIONS = {
    operators: [
        {
            publicKey: "",
            privateKey: process.env["OPERATOR_PK_1"],
            V1StakeAmount: 0n,
            V2StakeAmount: BigInt(2_000_000n * 10n ** 18n),
            poolData: {
                address: "",
                metaData: ["Cool Pool", "This pool was created automatically upon deployment for testing purposes", "https://images.unsplash.com/photo-1475598322381-f1b499717dda?q=80&w=2076&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"],
                socials: ["https://xai.games/", "https://discord.com/invite/xaigames", "https://t.me/XaiSentryNodes", "https://twitter.com/XAI_GAMES"],
                trackerDetails: [
                    ["Cool Pool Keys", "CPK"],
                    ["Cool Pool EsXAI", "CPEXai"],
                ],
                rewardSplit: [100_000n, 700_000n, 200_000n]
            }
        },
        {
            publicKey: "",
            privateKey: process.env["OPERATOR_PK_2"],
            V1StakeAmount: BigInt(10_000n * 10n ** 18n),
            V2StakeAmount: BigInt(50_000n * 10n ** 18n),
            poolData: {
                address: "",
                metaData: ["Community Pool", "This pool was created automatically upon deployment for testing purposes", "https://plus.unsplash.com/premium_photo-1681505195930-388c317b7a76?q=80&w=1984&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"],
                socials: ["https://xai.games/", "https://discord.com/invite/xaigames", "https://t.me/XaiSentryNodes", "https://twitter.com/XAI_GAMES"],
                trackerDetails: [
                    ["Community Pool Keys", "CMK"],
                    ["Community Pool EsXAI", "CMEXai"],
                ],
                rewardSplit: [50_000n, 850_000n, 100_000n]
            }
        },
        {
            publicKey: "",
            privateKey: process.env["OPERATOR_PK_3"],
            V1StakeAmount: BigInt(10_000n * 10n ** 18n),
            V2StakeAmount: BigInt(100_000n * 10n ** 18n),
            poolData: {
                address: "",
                metaData: ["Operator Pool", "This pool was created automatically upon deployment for testing purposes", "https://images.unsplash.com/photo-1607764787121-5fb28a979ffe?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"],
                socials: ["https://xai.games/", "https://discord.com/invite/xaigames", "https://t.me/XaiSentryNodes", "https://twitter.com/XAI_GAMES"],
                trackerDetails: [
                    ["Operator Pool Keys", "OPK"],
                    ["Operator Pool EsXAI", "OPEXai"],
                ],
                rewardSplit: [0n, 550_000n, 450_000n]
            }
        },
        {
            publicKey: "",
            privateKey: process.env["OPERATOR_PK_4"],
            V1StakeAmount: BigInt(100_000n * 10n ** 18n),
            V2StakeAmount: BigInt(1_000_000n * 10n ** 18n),
            poolData: {
                address: "",
                metaData: ["Fun Pool", "This pool was created automatically upon deployment for testing purposes", "https://images.unsplash.com/photo-1489367874814-f5d040621dd8?q=80&w=2046&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"],
                socials: ["https://xai.games/", "https://discord.com/invite/xaigames", "https://t.me/XaiSentryNodes", "https://twitter.com/XAI_GAMES"],
                trackerDetails: [
                    ["Fun Pool Keys", "FPK"],
                    ["Fun Pool EsXAI", "FPEXai"],
                ],
                rewardSplit: [10_000n, 600_000n, 390_000n]
            }
        },
        {
            publicKey: "",
            privateKey: process.env["OPERATOR_PK_5"],
            V1StakeAmount: BigInt(1_000_000n * 10n ** 18n),
        }
    ],
    challenger: {
        publicKey: "",
        privateKey: process.env["CHALLENGER_PRIVATEKEY"]
    },
    defaultAdmin: {
        publicKey: "",
        privateKey: process.env["DEFAULT_ADMIN_PK"]
    },
    delegatedOperator: {
        publicKey: "",
        privateKey: process.env["DELEGATED_OPERATOR_PK"]
    },
}

export const CHALLENGER_BLS_PRIVATEKEY = process.env["CHALLENGER_BLS_PRIVATEKEY"];