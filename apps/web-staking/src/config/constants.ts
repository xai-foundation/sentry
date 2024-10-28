import { arbitrum, arbitrumSepolia } from '@reown/appkit/networks'

export const projectId: string = process.env.NEXT_PUBLIC_APP_ENV === "development"
    ? "79e38b4593d43c78d7e9ee38f0cdf4ee"
    : "aa9e5ff297549e8d0cc518d085c28699";

if (!projectId) throw new Error('Project ID is not defined');

export const networks = process.env.NEXT_PUBLIC_APP_ENV === "development"
    ? [arbitrum, arbitrumSepolia]
    : [arbitrum];