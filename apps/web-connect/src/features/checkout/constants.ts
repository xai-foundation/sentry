
export const SENTRY_DEV_URL = "https://cryptitaustria.github.io/sentry/"
export const SENTRY_LOCAL_URL = "http://localhost:5173/sentry"
export const SENTRY_PROD_URL = "https://sentry.xai.games/"

export const STAKING_DEV_URL = "https://xai-staking-int.dev.cryptit.at/";
export const STAKING_LOCAL_URL = "http://localhost:3000/";
export const STAKING_PROD_URL = "https://app.xai.games/"


export interface IRedirects {
    [SENTRY_LOCAL_URL]: string;
    [SENTRY_DEV_URL]: string;
    [SENTRY_PROD_URL]: string;
}

export const redirects: IRedirects = {
    [SENTRY_LOCAL_URL]: STAKING_LOCAL_URL,
    [SENTRY_DEV_URL]: STAKING_DEV_URL,
    [SENTRY_PROD_URL]: STAKING_PROD_URL
}