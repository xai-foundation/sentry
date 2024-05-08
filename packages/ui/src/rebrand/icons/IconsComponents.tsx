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




export function InfoPointRed({
  width = 16,
  height = 16,
}: {
  width?: number;
  height?: number;
  fill?: string;
}) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 15.340392 15.340383"
      version="1.1"
      id="svg1"
      xmlSpace="preserve"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs id="defs1" />
      <g id="layer1" transform="translate(-90.533445,-118.00782)">
        <circle
          style={{
            fill: "#FF0030",
            fillOpacity: 1,
            strokeWidth: 0.264583,
          }}
          id="path1"
          cx="98.203636"
          cy="125.67802"
          r="7.6701946"
        />
        <path
          style={{
            fontSize: "48px",
            textAlign: "center",
            textAnchor: "middle",
            whiteSpace: "pre",
            fill: "#ffffff",
          }}
          d="m 372.93457,459.95592 h -4.96875 v -4.57031 h 4.96875 z m -0.28125,30.5625 h -4.40625 v -26.17969 h 4.40625 z"
          id="text1"
          transform="matrix(0.33291348,0,0,0.33291348,-25.14639,-31.710311)"
          aria-label="i"
        />
      </g>
    </svg>
  );
}

export function RedSentryIcon({
  width = 16,
  height = 16,
}: {
  width?: number;
  height?: number;
  fill?: string;
}) {
  return (
<svg
   id="Layer_2"
   viewBox="0 0 200.00021 282.724"
   version="1.1"
   width={width}
   height={height}
   xmlns="http://www.w3.org/2000/svg"
  >
  <g
     id="Layer_1-2"
     inkscape:export-filename="Vanguard red sentry.svg"
     inkscape:export-xdpi="96"
     inkscape:export-ydpi="96">
    <path
       style={{fill: "#FF0030", strokeWidth: 0, fillRule: "evenodd"}}
       d="m 88.656698,105.94536 34.762742,60.20991 H 76.58203 L 93.274826,137.2436 81.928388,117.59943 42.549924,185.80424 H 157.45154 L 100.00073,86.295183 88.656698,105.94416 Z M 199.96163,168.83025 V 37.279096 L 186.15412,36.68065 C 163.56218,35.698862 143.9793,27.994772 131.5285,21.706283 117.97815,14.860206 109.61552,8.1186762 109.21175,7.7906125 L 99.939447,0 90.783705,7.7930159 C 90.329463,8.1631391 81.976455,14.881836 68.470564,21.706283 56.019764,27.995974 36.436883,35.698862 13.844948,36.68065 L 0.03743,37.279096 V 168.83025 c -0.15261573,3.82381 -0.42059454,24.58195 10.141135,47.65577 6.74874,14.74123 16.51134,27.5261 29.01862,37.9941 15.292817,12.8029 34.62935,22.04156 57.471238,27.45882 l 3.331109,0.79312 3.332308,-0.79312 c 22.84069,-5.41726 42.17722,-14.65592 57.47124,-27.45882 12.50608,-10.468 22.26988,-23.25287 29.01862,-37.9941 10.56053,-23.07502 10.29375,-43.83196 10.14114,-47.65577 z M 99.999532,267.89589 C 9.5140257,246.42994 14.472234,169.15831 14.472234,169.15831 V 51.102236 C 63.841621,48.9548 99.999532,18.903922 99.999532,18.903922 c 0,0 36.159118,30.049677 85.526098,32.198314 V 169.15711 c 0,0 4.95941,77.27163 -85.526098,98.73878 z"
       id="path1"
       inkscape:export-filename="Vanguard red sentry.svg"
       inkscape:export-xdpi="96"
       inkscape:export-ydpi="96" />
  </g>
</svg>

  );
}


export const PlusIcon = ({width = 16, height = 16}) => {
  return(
  <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 15 15">
  <path id="Path_3818" data-name="Path 3818" d="M11,11V5h2v6h6v2H13v6H11V13H5V11Z" transform="translate(-4.5 -4.5)" fill="#fe0130" stroke="#ff0031" strokeWidth="1"/>
</svg>)
}

export const MinusIcon = ({ width = 16, height = 3 }) => {
  return(
  <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 15 3">
  <path id="Path_3819" data-name="Path 3819" d="M5,11v2H19V11Z" transform="translate(-4.5 -10.5)" fill="#fe0130" stroke="#fe0130" strokeWidth="1"/>
</svg>)
}