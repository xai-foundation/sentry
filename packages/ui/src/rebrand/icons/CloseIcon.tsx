export function CloseIcon({
                              width = 20,
                              height = 20,
                              className = "",
                              fill = "#0f5096"
                          }: {
    width?: number;
    height?: number;
    fill?: string;
    className?: string;
}) {
    return (
        <svg
            width={width}
            height={height}
            className={className}
            viewBox="0 0 12.136524 12.136524"
            version="1.1"
            id="svg1"
            xmlSpace="preserve"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs id="defs1" />
            <g id="layer1" transform="translate(-92.135368,-119.60976)">
                <rect
                    style={{
                        fill: fill,
                        fillOpacity: 1,
                        strokeWidth: 0.264583,
                    }}
                    id="rect2"
                    width="15.088907"
                    height="2.0747249"
                    x="-26.971783"
                    y="157.27087"
                    transform="rotate(-45)"
                    className={`close-stick`}
                />
                <rect
                    style={{
                        fill: fill,
                        fillOpacity: 1,
                        strokeWidth: 0.264583,
                    }}
                    id="rect2-3"
                    width="15.088907"
                    height="2.0747249"
                    x="150.76378"
                    y="18.389967"
                    transform="rotate(45)"
                    className={`close-stick`}
                />
            </g>
        </svg>
    );
}