import isEqual from "lodash.isequal";
import {
    type FiatEmbeddedCheckoutProps,
    crossmintIFrameService,
    embeddedCheckoutPropsToUpdatableParamsPayload,
} from "@crossmint/client-sdk-base";

import CrossmintEmbeddedCheckoutIFrame from "./EmbeddedCheckoutIFrame";
import { type DependencyList, type EffectCallback, useEffect, useRef } from "react";

function useDeepEffect(callback: EffectCallback, dependencies: DependencyList): void {
    const dependenciesRef = useRef(dependencies);

    useEffect(() => {
        const hasChanged = dependencies.some((dep, i) => !isEqual(dep, dependenciesRef.current[i]));

        if (hasChanged) {
            dependenciesRef.current = dependencies;
            return callback();
        }
    }, [dependencies]);
}

export default function FiatEmbeddedCheckoutIFrame(props: FiatEmbeddedCheckoutProps) {
    const { emitInternalEvent } = crossmintIFrameService(props);

    useDeepEffect(() => {
        emitInternalEvent({
            type: "params-update",
            payload: embeddedCheckoutPropsToUpdatableParamsPayload(props),
        });
    }, [props.recipient, props.mintConfig, props.locale, props.currency, props.whPassThroughArgs]);

    return <CrossmintEmbeddedCheckoutIFrame {...props} />;
}
