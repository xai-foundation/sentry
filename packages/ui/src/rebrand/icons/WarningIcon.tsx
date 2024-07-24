export const WarningIcon = ({ width = 24, height = 24, className, fill = "#ffc53d" }: { width?: number, height?: number, fill?: string, className?: string }) => {

  return (
    <svg style={{ width: width, height: height }} className={className} xmlns="http://www.w3.org/2000/svg" width="27.789" height="24" viewBox="0 0 27.789 24">
      <path id="warning_FILL1_wght400_GRAD0_opsz24_4_" data-name="warning_FILL1_wght400_GRAD0_opsz24 (4)" d="M40-856l13.895-24,13.895,24Zm13.895-3.789a1.222,1.222,0,0,0,.9-.363,1.222,1.222,0,0,0,.363-.9,1.222,1.222,0,0,0-.363-.9,1.222,1.222,0,0,0-.9-.363,1.222,1.222,0,0,0-.9.363,1.222,1.222,0,0,0-.363.9,1.222,1.222,0,0,0,.363.9A1.222,1.222,0,0,0,53.895-859.789Zm-1.263-3.789h2.526v-6.316H52.632Z" transform="translate(-40 880)" fill={fill}/>
    </svg>
  )
};