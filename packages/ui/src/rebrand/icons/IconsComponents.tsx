export const WarningIcon = ({ width = 24, height = 24, className }: { width?: number, height?: number, fill?: string, className?: string }) => {

  return (
  <svg style={{ width: width, height: height }} className={className} xmlns="http://www.w3.org/2000/svg" width="27.789" height="24" viewBox="0 0 27.789 24">
   <path id="warning_FILL1_wght400_GRAD0_opsz24_4_" data-name="warning_FILL1_wght400_GRAD0_opsz24 (4)" d="M40-856l13.895-24,13.895,24Zm13.895-3.789a1.222,1.222,0,0,0,.9-.363,1.222,1.222,0,0,0,.363-.9,1.222,1.222,0,0,0-.363-.9,1.222,1.222,0,0,0-.9-.363,1.222,1.222,0,0,0-.9.363,1.222,1.222,0,0,0-.363.9,1.222,1.222,0,0,0,.363.9A1.222,1.222,0,0,0,53.895-859.789Zm-1.263-3.789h2.526v-6.316H52.632Z" transform="translate(-40 880)" fill="#ffc53d"/>
  </svg>
  )
};

export const XaiLogoFooter = ({ width = 122, height = 97, svgClassName, wrapperClassName = "fill-white", logoClassName }: { width?: number, height?: number, fill?: string, wrapperClassName?: string, logoClassName?: string, svgClassName?: string }) => {

  return (

      <svg
          style={{ width: width, height: height }}
          className={svgClassName}
          width="85.000389"
          height="73.612"
          viewBox="0 0 85.000391 73.611999"
          version="1.1"
          id="svg1"
          xmlns="http://www.w3.org/2000/svg">
          <defs
              id="defs1"/>
          <g
              id="layer1">
              <path
                  className={wrapperClassName}
                  d="M 0.86735408,72.109708 42.501698,0 84.133035,72.109708 Z"
                  id="path1"/>
          </g>
          <path
              className={logoClassName}
              id="Path_3825"
              data-name="Path 3825"
              d="M 42.501372,9.5706484 36.057404,20.735173 55.787202,54.925643 H 29.201416 L 38.680195,38.508472 32.24329,27.353367 9.876572,66.076039 h 65.247246 z"
              fill="#f30919"
              />
      </svg>

  )
};



