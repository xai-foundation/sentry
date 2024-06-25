
interface ExternalLinkIconProps {
    extraClasses?: {
        svgClasses?: string;
        pathClasses?: string;
    };
}
export default function ExternalLinkIcon ({extraClasses}: ExternalLinkIconProps) {
    return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" className={extraClasses?.svgClasses}>
        <path id="Path_4170" data-name="Path 4170"
              d="M9.222,5.667V7.444H4.778v9.778h9.778V12.778h1.778v5.333a.889.889,0,0,1-.889.889H3.889A.889.889,0,0,1,3,18.111V6.556a.889.889,0,0,1,.889-.889ZM19,3v7.111H17.222V6.034L10.3,12.962,9.038,11.7l6.926-6.927H11.889V3Z"
              transform="translate(-3 -3)" className={extraClasses?.pathClasses}/>
    </svg>
}