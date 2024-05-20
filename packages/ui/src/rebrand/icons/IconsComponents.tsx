export const WarningIcon = ({ width = 24, height = 24, className, fill = "#ffc53d" }: { width?: number, height?: number, fill?: string, className?: string }) => {

  return (
    <svg style={{ width: width, height: height }} className={className} xmlns="http://www.w3.org/2000/svg" width="27.789" height="24" viewBox="0 0 27.789 24">
      <path id="warning_FILL1_wght400_GRAD0_opsz24_4_" data-name="warning_FILL1_wght400_GRAD0_opsz24 (4)" d="M40-856l13.895-24,13.895,24Zm13.895-3.789a1.222,1.222,0,0,0,.9-.363,1.222,1.222,0,0,0,.363-.9,1.222,1.222,0,0,0-.363-.9,1.222,1.222,0,0,0-.9-.363,1.222,1.222,0,0,0-.9.363,1.222,1.222,0,0,0-.363.9,1.222,1.222,0,0,0,.363.9A1.222,1.222,0,0,0,53.895-859.789Zm-1.263-3.789h2.526v-6.316H52.632Z" transform="translate(-40 880)" fill={fill}/>
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

export const XaiLogo = ({className = ""}) => {
    return <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 43.861 37.985">
        <path id="Path_3682" data-name="Path 3682"
              d="M21.931,0,17.6,7.5,30.87,30.488H12.991l6.372-11.036-4.331-7.5L0,37.988H43.861Z"
              transform="translate(0 -0.003)"/>
    </svg>
}

export const DiscordIcon = ({width = 26, height = 20, className = ""}) => {
    return <svg xmlns="http://www.w3.org/2000/svg" className={className} style={{ width, height }} viewBox="0 0 19.435 15">
        <path id="discord-svgrepo-com_2_" data-name="discord-svgrepo-com (2)"
              d="M18.952,5.918A16.059,16.059,0,0,0,14.944,4.66a9.262,9.262,0,0,0-.511,1.063,14.674,14.674,0,0,0-4.438,0A11.4,11.4,0,0,0,9.473,4.66,16.059,16.059,0,0,0,5.465,5.918,16.784,16.784,0,0,0,2.582,17.145,16.052,16.052,0,0,0,7.5,19.66a12.373,12.373,0,0,0,1.053-1.728A9.552,9.552,0,0,1,6.9,17.124c.143-.1.276-.215.409-.317a11.339,11.339,0,0,0,9.826,0c.133.112.266.215.409.317a10.789,10.789,0,0,1-1.656.808,12.373,12.373,0,0,0,1.053,1.728,15.939,15.939,0,0,0,4.918-2.515A16.726,16.726,0,0,0,18.972,5.918ZM8.983,14.9a1.881,1.881,0,0,1-1.748-1.984,1.868,1.868,0,0,1,1.748-1.984,1.861,1.861,0,0,1,1.748,1.984A1.874,1.874,0,0,1,8.983,14.9Zm6.452,0a1.881,1.881,0,0,1-1.748-1.984,1.868,1.868,0,0,1,1.748-1.984,1.861,1.861,0,0,1,1.748,1.984A1.874,1.874,0,0,1,15.434,14.9Z"
              transform="translate(-2.502 -4.66)" />
    </svg>
}
export const TelegramIcon = ({width = 26, height = 20, className = ""}) => {
    return <svg xmlns="http://www.w3.org/2000/svg" className={className} style={{ width, height }} viewBox="0 0 17.886 15">
        <path id="telegram-plane"
              d="M19.837,5.391l-2.7,12.729c-.2.9-.735,1.122-1.489.7l-4.113-3.031L9.551,17.7a1.032,1.032,0,0,1-.827.4l.3-4.188,7.622-6.888c.332-.3-.072-.459-.515-.164L6.7,12.8l-4.057-1.27c-.882-.275-.9-.882.184-1.306L18.7,4.106c.735-.275,1.377.164,1.138,1.286Z"
              transform="translate(-2.002 -4.026)" />
    </svg>
}

export const XIcon = ({width = 26, height = 20, className = ""}) => {
    return <svg xmlns="http://www.w3.org/2000/svg" className={className} style={{ width, height }} viewBox="0 0 16.5 15">
        <path id="Path_3803" data-name="Path 3803"
              d="M6.25,2H1l6.2,8.261L1.337,17H3.325l4.791-5.512L12.25,17H17.5L11.044,8.392,16.6,2H14.613L10.123,7.164ZM13,15.5,4,3.5H5.5l9,12Z"
              transform="translate(-1 -2)" />
    </svg>
}

export const WalletIcon = ({width = 17.5, height = 14}) => {
    return <svg className="fill-white group-hover:fill-hornetSting duration-200 ease-in" xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 17.5 14">
  <path id="wallet_FILL1_wght400_GRAD0_opsz24" d="M83.5-786a3.37,3.37,0,0,1-2.472-1.028A3.37,3.37,0,0,1,80-789.5v-7a3.37,3.37,0,0,1,1.028-2.472A3.37,3.37,0,0,1,83.5-800H94a3.37,3.37,0,0,1,2.472,1.028A3.37,3.37,0,0,1,97.5-796.5v7a3.37,3.37,0,0,1-1.028,2.472A3.37,3.37,0,0,1,94-786Zm0-10.5H94a3.774,3.774,0,0,1,.919.109,2.963,2.963,0,0,1,.831.35v-.459a1.685,1.685,0,0,0-.514-1.236A1.685,1.685,0,0,0,94-798.25H83.5a1.685,1.685,0,0,0-1.236.514,1.685,1.685,0,0,0-.514,1.236v.459a2.963,2.963,0,0,1,.831-.35A3.774,3.774,0,0,1,83.5-796.5Zm-1.619,2.844,9.734,2.362a.9.9,0,0,0,.394,0,.965.965,0,0,0,.372-.175l3.041-2.538a1.892,1.892,0,0,0-.612-.536A1.631,1.631,0,0,0,94-794.75H83.5a1.706,1.706,0,0,0-1,.3A1.7,1.7,0,0,0,81.881-793.656Z" transform="translate(-80 800)"/>
</svg>
}
export const Lock = ({width = 22, height = 23, className = ""}) => {
    return <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height={height} width={width} className={className}
                xmlns="http://www.w3.org/2000/svg" color="#3DD68C" >
        <path
            d="M376 192h-24v-46.7c0-52.7-42-96.5-94.7-97.3-53.4-.7-97.3 42.8-97.3 96v48h-24c-22 0-40 18-40 40v192c0 22 18 40 40 40h240c22 0 40-18 40-40V232c0-22-18-40-40-40zM270 316.8v68.8c0 7.5-5.8 14-13.3 14.4-8 .4-14.7-6-14.7-14v-69.2c-11.5-5.6-19.1-17.8-17.9-31.7 1.4-15.5 14.1-27.9 29.6-29 18.7-1.3 34.3 13.5 34.3 31.9 0 12.7-7.3 23.6-18 28.8zM324 192H188v-48c0-18.1 7.1-35.1 20-48s29.9-20 48-20 35.1 7.1 48 20 20 29.9 20 48v48z"></path>
    </svg>
}