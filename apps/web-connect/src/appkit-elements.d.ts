import type { DetailedHTMLProps, HTMLAttributes } from "react";

// @reown/appkit registers <w3m-button> as a custom element and declares it on the
// global JSX namespace. React 19 removed that global namespace in favour of
// React's own, so the declaration has to be re-stated here for TypeScript to
// accept the element in JSX.
declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "w3m-button": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}
