export function SwitchArrows({ width = 24, height = 24, className, fill = "#181818" }: { width?: number, height?: number, fill?: string, className?: string }) {

	return (
		<svg style={{ width: width, height: height }} className={className} viewBox="0 0 19.9 18" xmlns="http://www.w3.org/2000/svg">
			<path d="M11.95,7.95,10.536,9.364,8,6.828V20H6V6.828L3.465,9.364,2.05,7.95,7,3Zm10,8.1L17,21l-4.95-4.95,1.414-1.414L16,17.172V4h2V17.172l2.535-2.536Z" transform="translate(-2.05 -3)" fill={fill} />
		</svg>
	)
}

export function DownArrow({ width = 24, height = 24, fill = "#181818" }: { width?: number, height?: number, fill?: string }) {

	return (
		<svg style={{ width: width, height: height }} viewBox="0 0 8.485 5.657" xmlns="http://www.w3.org/2000/svg">
			<path d="M12,15,7.757,10.758,9.172,9.344,12,12.172l2.828-2.828,1.414,1.414Z" transform="translate(-7.757 -9.344)" fill={fill} />
		</svg>
	)
}

export function BackArrow({ width = 24, height = 24, fill = "#181818" }: { width?: number, height?: number, fill?: string }) {

	return (
		<svg style={{ width: width, height: height }} viewBox="0 0 19.9 18" xmlns="http://www.w3.org/2000/svg">
			<path d="M 8.8889385,0.11106127 11.428122,2.6502449 6.8741124,7.2042555 H 19.9 V 10.795745 H 6.8741124 L 11.428122,15.347956 8.8889385,17.888939 -2.1853027e-7,8.9999974 Z" fill={fill} />
		</svg>
	)
}

export function Discord({ width = 24, height = 24, fill = "#8d8d8d" }: { width?: number, height?: number, fill?: string }) {

	return (
		<svg style={{ width: width, height: height }} viewBox="0 0 19.008 14.67" xmlns="http://www.w3.org/2000/svg">
			<path d="M18.59,5.89a15.705,15.705,0,0,0-3.92-1.23,9.058,9.058,0,0,0-.5,1.04,14.351,14.351,0,0,0-4.34,0,11.147,11.147,0,0,0-.51-1.04A15.705,15.705,0,0,0,5.4,5.89,16.415,16.415,0,0,0,2.58,16.87a15.7,15.7,0,0,0,4.81,2.46,12.1,12.1,0,0,0,1.03-1.69,9.342,9.342,0,0,1-1.62-.79c.14-.1.27-.21.4-.31a11.09,11.09,0,0,0,9.61,0c.13.11.26.21.4.31a10.552,10.552,0,0,1-1.62.79,12.1,12.1,0,0,0,1.03,1.69,15.589,15.589,0,0,0,4.81-2.46A16.358,16.358,0,0,0,18.61,5.89ZM8.84,14.67a1.84,1.84,0,0,1-1.71-1.94,1.826,1.826,0,0,1,1.71-1.94,1.82,1.82,0,0,1,1.71,1.94A1.833,1.833,0,0,1,8.84,14.67Zm6.31,0a1.84,1.84,0,0,1-1.71-1.94,1.826,1.826,0,0,1,1.71-1.94,1.82,1.82,0,0,1,1.71,1.94A1.833,1.833,0,0,1,15.15,14.67Z" transform="translate(-2.502 -4.66)" fill={fill} />
		</svg>
	)
}

export function GitBook({ width = 24, height = 24, fill = "#8d8d8d" }: { width?: number, height?: number, fill?: string }) {

	return (
		<svg style={{ width: width, height: height }} viewBox="0 0 20 14.41" xmlns="http://www.w3.org/2000/svg">
			<path d="M9,15.368a.586.586,0,1,1-.587.585A.586.586,0,0,1,9,15.368m9.187-3.623a.586.586,0,1,1,.586-.585.586.586,0,0,1-.586.585m0-2.4a1.807,1.807,0,0,0-1.716,2.388l-5.984,3.186a1.808,1.808,0,0,0-3.112.233L2,12.319a2.356,2.356,0,0,1-.948-2.085,1.1,1.1,0,0,1,.411-.923.525.525,0,0,1,.517.023l.035.019C3.44,10.1,8.1,12.559,8.3,12.65a.916.916,0,0,0,.988-.048l9.637-5.012a.443.443,0,0,0,.307-.4.462.462,0,0,0-.3-.4c-.548-.263-1.391-.657-2.213-1.042C14.964,4.934,12.974,4,12.1,3.544a1.493,1.493,0,0,0-1.471.005l-.21.1C6.484,5.6,1.217,8.207.917,8.39a2.15,2.15,0,0,0-.912,1.785,3.421,3.421,0,0,0,1.52,3.106L7.21,16.213a1.811,1.811,0,0,0,3.6-.232l6.262-3.394a1.811,1.811,0,1,0,1.114-3.239" transform="translate(0 -3.354)" fill={fill} />
		</svg>
	)
}

export function Telegram({ width = 24, height = 24, fill = "#8d8d8d" }: { width?: number, height?: number, fill?: string }) {

	return (
		<svg style={{ width: width, height: height }} viewBox="0 0 16 13.418" xmlns="http://www.w3.org/2000/svg">
			<path d="M17.956,5.247,15.542,16.634c-.182.8-.657,1-1.332.625L10.53,14.548,8.755,16.256a.923.923,0,0,1-.74.361L8.28,12.87,15.1,6.709c.3-.264-.065-.411-.461-.146L6.209,11.87,2.58,10.734c-.789-.246-.8-.789.165-1.168L16.938,4.1c.657-.246,1.232.146,1.018,1.15Z" transform="translate(-2.002 -4.026)" fill={fill} />
		</svg>
	)
}

export function X({ width = 24, height = 24, fill = "#8d8d8d" }: { width?: number, height?: number, fill?: string }) {

	return (
		<svg style={{ width: width, height: height }} viewBox="0 0 15.488 14.08" xmlns="http://www.w3.org/2000/svg">
			<path d="M5.928,2H1L6.816,9.754l-5.5,6.326H3.182l4.5-5.174,3.88,5.174h4.928L10.428,8l5.216-6H13.778L9.564,6.848Zm6.336,12.672L3.816,3.408H5.224l8.448,11.264Z" transform="translate(-1 -2)" fill={fill} />
		</svg>
	)
}

export function Xai({ width = 24, height = 24, fill = "#f30019" }: { width?: number, height?: number, fill?: string }) {

	return (
		<svg style={{ width: width, height: height }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 13.518">
			<path id="Path_3462" data-name="Path 3462" d="M192.719,5.162l3.657,6.18h-7.314l3.657-6.18m0-4.742-8,13.518h16l-8-13.518h0Z" transform="translate(-184.72 -0.42)" fill={fill} />
		</svg>

	)
}

export function RedXai({ width = 24, height = 24, fill = "#f30019" }: { width?: number, height?: number, fill?: string }) {
	return (
		<svg style={{ width: width, height: height }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64.000000 64.000000" preserveAspectRatio="xMidYMid meet">
			<g transform="translate(0.000000,64.000000) scale(0.100000,-0.100000)" fill={fill} stroke="none">
				<path d="M223 622 c-109 -39 -178 -112 -210 -221 -29 -102 4 -228 82 -306 122 -121 328 -121 450 0 91 92 118 241 64 356 -69 146 -241 223 -386 171z m197 -253 c52 -89 97 -165 98 -170 2 -5 -86 -9 -198 -9 -116 0 -200 4 -198 9 7 20 193 331 198 331 3 0 48 -73 100 -161z" />
				<path d="M274 337 l-42 -72 44 -3 c24 -2 64 -2 88 0 l44 3 -42 72 c-22 40 -43 72 -46 72 -3 0 -24 -32 -46 -72z" />
			</g>
		</svg>
	)
}

export function ErrorCircle({ width = 24, height = 24, fill = "#ED5F00" }: { width?: number, height?: number, fill?: string }) {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 300 300">
			<circle cx="150" cy="150" r="150" fill={fill} />
			<text
				x="50%"
				y="55%"
				textAnchor="middle"
				dominantBaseline="central"
				style={{
					fontFamily: 'Bahnschrift',
					fontSize: '300px',
					fill: '#ffffff',
					stroke: 'none',
				}}
			>
				!
			</text>
		</svg>
	);
}

export function CheckMark({
  width = 24,
  height = 24,
}: {
  width?: number;
  height?: number;
  fill?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      width={width}
      height={height}
    >
      <g
        id="Group_8063"
        data-name="Group 8063"
        transform="translate(-1463 -930.999)"
      >
        <g
          id="Group_8062"
          data-name="Group 8062"
          transform="translate(679 339.461)"
        >
          <circle
            id="Ellipse_41"
            data-name="Ellipse 41"
            cx="10"
            cy="10"
            r="10"
            transform="translate(784 591.538)"
            fill="#fff0f1"
          />
          <path
            id="Path_3208"
            data-name="Path 3208"
            d="M7.57,11.662l5.683-5.683.874.874L7.57,13.41,3.636,9.476,4.51,8.6Z"
            transform="translate(785.014 592.211)"
            fill="#f30919"
            stroke="#f30919"
            stroke-width="1"
          />
        </g>
      </g>
    </svg>
  );
}

export function InfoMark({
  width = 24,
  height = 24,
}: {
  width?: number;
  height?: number;
  fill?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 20 20"
    >
      <path
        id="Path_3484"
        data-name="Path 3484"
        d="M12,22A10,10,0,1,1,22,12,10,10,0,0,1,12,22Zm0-2a8,8,0,1,0-8-8A8,8,0,0,0,12,20ZM11,7h2V9H11Zm0,4h2v6H11Z"
        transform="translate(-2 -2)"
        fill="#bbb"
      />
    </svg>
  );
}

export function BronzeTriangle({
  width = 16,
  height = 13.5,
}: {
  width?: number;
  height?: number;
  fill?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 16 13.518"
    >
      <path
        id="Path_3505"
        data-name="Path 3505"
        d="M192.719,5.162l3.657,6.18h-7.314l3.657-6.18m0-4.742-8,13.518h16l-8-13.518h0Z"
        transform="translate(-184.72 -0.42)"
        fill="#c36522"
      />
    </svg>
  );
}

export function SilverTriangle({
  width = 16,
  height = 13.5,
}: {
  width?: number;
  height?: number;
  fill?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 16 13.518"
    >
      <path
        id="Path_3508"
        data-name="Path 3508"
        d="M192.719,5.162l3.657,6.18h-7.314l3.657-6.18m0-4.742-8,13.518h16l-8-13.518h0Z"
        transform="translate(-184.72 -0.42)"
        fill="#bbb"
      />
    </svg>
  );
}

export function GoldTriangle({
  width = 16,
  height = 13.5,
}: {
  width?: number;
  height?: number;
  fill?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 16 13.518"
    >
      <path
        id="Path_3509"
        data-name="Path 3509"
        d="M192.719,5.162l3.657,6.18h-7.314l3.657-6.18m0-4.742-8,13.518h16l-8-13.518h0Z"
        transform="translate(-184.72 -0.42)"
        fill="#ffba18"
      />
    </svg>
  );
}

export function PlatinumTriangle({
  width = 16,
  height = 13.5,
}: {
  width?: number;
  height?: number;
  fill?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      width={width}
      height={height}
      viewBox="0 0 16 13.518"
    >
      <defs>
        <linearGradient
          id="linear-gradient1"
          x1="0.5"
          y1="1.127"
          x2="0.5"
          gradientUnits="objectBoundingBox"
        >
          <stop offset="0" stopColor="#5d6874" />
          <stop offset="1" stopColor="#e3e3e3" />
        </linearGradient>
      </defs>
      <path
        id="Path_3510"
        data-name="Path 3510"
        d="M192.719,5.162l3.657,6.18h-7.314l3.657-6.18m0-4.742-8,13.518h16l-8-13.518h0Z"
        transform="translate(-184.72 -0.42)"
        fill="url(#linear-gradient1)"
      />
    </svg>
  );
}

export function DiamondTriangle({
  width = 16,
  height = 13.5,
}: {
  width?: number;
  height?: number;
  fill?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      width={width}
      height={height}
      viewBox="0 0 16 13.518"
    >
      <defs>
        <linearGradient
          id="linear-gradient2"
          x1="0.5"
          y1="1.127"
          x2="0.5"
          gradientUnits="objectBoundingBox"
        >
          <stop offset="0" stopColor="#99aaf8" />
          <stop offset="1" stopColor="#8dfdf9" />
        </linearGradient>
      </defs>
      <path
        id="Path_3511"
        data-name="Path 3511"
        d="M192.719,5.162l3.657,6.18h-7.314l3.657-6.18m0-4.742-8,13.518h16l-8-13.518h0Z"
        transform="translate(-184.72 -0.42)"
        fill="url(#linear-gradient2)"
      />
    </svg>
  );
}
