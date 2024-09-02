import { checkRefereeBulkSubmissionCompatible } from "@sentry/core";
import { useEffect, useState } from "react";

export function useGetIsBeforeBulkUpgrade() {
    const [isBulkCompatible, setIsBulkCompatible] = useState<boolean>(false);

    useEffect(() => {
        checkRefereeBulkSubmissionCompatible()
            .then((isBulkCompatible) => {
                setIsBulkCompatible(isBulkCompatible);
            })
    }, [])

    return { isBulkCompatible };
}
