export default function BackArrow({ width = 24, height = 24, className = "" }: {
    width?: number,
    height?: number,
    fill?: string,
    className?: string
}) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 16 15.556">
            <path id="Path_3805" data-name="Path 3805"
                  d="M16.172,11,10.808,5.636l1.414-1.414L20,12l-7.778,7.778-1.414-1.414L16.172,13H4V11Z"
                  transform="translate(20 19.778) rotate(180)" />
        </svg>
    )
}