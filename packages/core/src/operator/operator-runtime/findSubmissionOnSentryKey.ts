import { SentryKey, Submission } from "@sentry/sentry-subgraph-client";

/**
 * Helper function to find a submission for a specific challenge in the list of submissions in a sentryKey
 */
export const findSubmissionOnSentryKey = (sentryKey: SentryKey, challengeNumber: bigint): { submission: Submission, index: number } | null => {
    for (let i = 0; i < sentryKey.submissions.length; i++) {
        if (sentryKey.submissions[i].challengeNumber.toString() === challengeNumber.toString()) {
            return { submission: sentryKey.submissions[i], index: i }
        }
    }
    return null;
}
