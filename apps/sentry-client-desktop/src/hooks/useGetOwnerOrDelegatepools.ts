import {getOwnerOrDelegatePools} from "@sentry/core";
import { useEffect, useState } from "react";

export function useGetOwnerOrDelegatePools(address: string | undefined) {
    const [pools, setPools] = useState<string[]>([])

    useEffect(() => {
        if (address) {
            getOwnerOrDelegatePools(address).then((pools) => {
                setPools(pools)
            })
        }
    }, [address])

    return {pools};
}
