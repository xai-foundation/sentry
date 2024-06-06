"use client";
import React, { useState } from "react";

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

export function BackArrow({ width = 24, height = 24, fill = "#FF2C3A" }: {
  width?: number,
  height?: number,
  fill?: string
}) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 16 15.556">
      <path id="Path_3805" data-name="Path 3805"
            d="M16.172,11,10.808,5.636l1.414-1.414L20,12l-7.778,7.778-1.414-1.414L16.172,13H4V11Z"
            transform="translate(20 19.778) rotate(180)" fill={fill} />
    </svg>
  )
}

export function Discord({ width = 24, height = 24, fill = "#8d8d8d" }: {
  width?: number,
  height?: number,
  fill?: string
}) {

  return (
    <svg className="fill-white group-hover:fill-red duration-200 ease-in" style={{ width: width, height: height }}
         viewBox="0 0 19.008 14.67" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.59,5.89a15.705,15.705,0,0,0-3.92-1.23,9.058,9.058,0,0,0-.5,1.04,14.351,14.351,0,0,0-4.34,0,11.147,11.147,0,0,0-.51-1.04A15.705,15.705,0,0,0,5.4,5.89,16.415,16.415,0,0,0,2.58,16.87a15.7,15.7,0,0,0,4.81,2.46,12.1,12.1,0,0,0,1.03-1.69,9.342,9.342,0,0,1-1.62-.79c.14-.1.27-.21.4-.31a11.09,11.09,0,0,0,9.61,0c.13.11.26.21.4.31a10.552,10.552,0,0,1-1.62.79,12.1,12.1,0,0,0,1.03,1.69,15.589,15.589,0,0,0,4.81-2.46A16.358,16.358,0,0,0,18.61,5.89ZM8.84,14.67a1.84,1.84,0,0,1-1.71-1.94,1.826,1.826,0,0,1,1.71-1.94,1.82,1.82,0,0,1,1.71,1.94A1.833,1.833,0,0,1,8.84,14.67Zm6.31,0a1.84,1.84,0,0,1-1.71-1.94,1.826,1.826,0,0,1,1.71-1.94,1.82,1.82,0,0,1,1.71,1.94A1.833,1.833,0,0,1,15.15,14.67Z" transform="translate(-2.502 -4.66)" />
    </svg>
  )
}

export function GitBook({ width = 24, height = 24, fill = "white" }: { width?: number, height?: number, fill?: string }) {

  return (
    <svg className="fill-white group-hover:fill-red duration-200 ease-in" style={{ width: width, height: height }} viewBox="0 0 20 14.41" xmlns="http://www.w3.org/2000/svg">
      <path d="M9,15.368a.586.586,0,1,1-.587.585A.586.586,0,0,1,9,15.368m9.187-3.623a.586.586,0,1,1,.586-.585.586.586,0,0,1-.586.585m0-2.4a1.807,1.807,0,0,0-1.716,2.388l-5.984,3.186a1.808,1.808,0,0,0-3.112.233L2,12.319a2.356,2.356,0,0,1-.948-2.085,1.1,1.1,0,0,1,.411-.923.525.525,0,0,1,.517.023l.035.019C3.44,10.1,8.1,12.559,8.3,12.65a.916.916,0,0,0,.988-.048l9.637-5.012a.443.443,0,0,0,.307-.4.462.462,0,0,0-.3-.4c-.548-.263-1.391-.657-2.213-1.042C14.964,4.934,12.974,4,12.1,3.544a1.493,1.493,0,0,0-1.471.005l-.21.1C6.484,5.6,1.217,8.207.917,8.39a2.15,2.15,0,0,0-.912,1.785,3.421,3.421,0,0,0,1.52,3.106L7.21,16.213a1.811,1.811,0,0,0,3.6-.232l6.262-3.394a1.811,1.811,0,1,0,1.114-3.239" transform="translate(0 -3.354)" />
    </svg>
  )
}

export function Telegram({ width = 24, height = 24, fill = "#8d8d8d" }: { width?: number, height?: number, fill?: string }) {

  return (
    <svg className="fill-white group-hover:fill-red duration-200 ease-in" style={{ width: width, height: height }} viewBox="0 0 16 13.418" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.956,5.247,15.542,16.634c-.182.8-.657,1-1.332.625L10.53,14.548,8.755,16.256a.923.923,0,0,1-.74.361L8.28,12.87,15.1,6.709c.3-.264-.065-.411-.461-.146L6.209,11.87,2.58,10.734c-.789-.246-.8-.789.165-1.168L16.938,4.1c.657-.246,1.232.146,1.018,1.15Z" transform="translate(-2.002 -4.026)" />
    </svg>
  )
}

export function X({ width = 24, height = 24, fill = "#8d8d8d" }: { width?: number, height?: number, fill?: string }) {

  return (
    <svg className="fill-white group-hover:fill-red duration-200 ease-in" style={{ width: width, height: height }} viewBox="0 0 15.488 14.08" xmlns="http://www.w3.org/2000/svg">
      <path d="M5.928,2H1L6.816,9.754l-5.5,6.326H3.182l4.5-5.174,3.88,5.174h4.928L10.428,8l5.216-6H13.778L9.564,6.848Zm6.336,12.672L3.816,3.408H5.224l8.448,11.264Z" transform="translate(-1 -2)"/>
    </svg>
  )
}

export function Website({ width = 24, height = 24, fill = "#8d8d8d" }: { width?: number, height?: number, fill?: string }) {

  return (
    <svg className="fill-white group-hover:fill-red duration-200 ease-in" xmlns="http://www.w3.org/2000/svg" style={{ width: width, height: height }} viewBox="0 0 20 20">
      <path id="language_FILL0_wght400_GRAD0_opsz24" d="M90-860a9.677,9.677,0,0,1-3.875-.787,10.143,10.143,0,0,1-3.187-2.15,10.143,10.143,0,0,1-2.15-3.187A9.676,9.676,0,0,1,80-870a9.649,9.649,0,0,1,.787-3.888,10.184,10.184,0,0,1,2.15-3.175,10.144,10.144,0,0,1,3.188-2.15A9.677,9.677,0,0,1,90-880a9.649,9.649,0,0,1,3.887.787,10.184,10.184,0,0,1,3.175,2.15,10.184,10.184,0,0,1,2.15,3.175A9.649,9.649,0,0,1,100-870a9.676,9.676,0,0,1-.787,3.875,10.143,10.143,0,0,1-2.15,3.188,10.183,10.183,0,0,1-3.175,2.15A9.649,9.649,0,0,1,90-860Zm0-2.05a12.7,12.7,0,0,0,1.125-1.875A11.836,11.836,0,0,0,91.9-866H88.1a11.838,11.838,0,0,0,.775,2.075A12.7,12.7,0,0,0,90-862.05Zm-2.6-.4a13.858,13.858,0,0,1-.788-1.712A14.692,14.692,0,0,1,86.05-866H83.1a8.3,8.3,0,0,0,1.813,2.175A7.2,7.2,0,0,0,87.4-862.45Zm5.2,0a7.2,7.2,0,0,0,2.487-1.375A8.3,8.3,0,0,0,96.9-866H93.95a14.69,14.69,0,0,1-.562,1.837A13.859,13.859,0,0,1,92.6-862.45ZM82.25-868h3.4q-.075-.5-.113-.987T85.5-870q0-.525.037-1.012T85.65-872h-3.4a8.558,8.558,0,0,0-.187.988A7.958,7.958,0,0,0,82-870a7.958,7.958,0,0,0,.063,1.013A8.557,8.557,0,0,0,82.25-868Zm5.4,0h4.7q.075-.5.113-.987T92.5-870q0-.525-.037-1.012T92.35-872h-4.7q-.075.5-.113.988T87.5-870q0,.525.037,1.013T87.65-868Zm6.7,0h3.4a8.555,8.555,0,0,0,.187-.987A7.958,7.958,0,0,0,98-870a7.958,7.958,0,0,0-.063-1.012A8.556,8.556,0,0,0,97.75-872h-3.4q.075.5.112.988T94.5-870q0,.525-.037,1.013T94.35-868Zm-.4-6H96.9a8.3,8.3,0,0,0-1.813-2.175A7.2,7.2,0,0,0,92.6-877.55a13.863,13.863,0,0,1,.788,1.712A14.684,14.684,0,0,1,93.95-874Zm-5.85,0h3.8a11.837,11.837,0,0,0-.775-2.075A12.7,12.7,0,0,0,90-877.95a12.7,12.7,0,0,0-1.125,1.875A11.838,11.838,0,0,0,88.1-874Zm-5,0h2.95a14.687,14.687,0,0,1,.563-1.838,13.862,13.862,0,0,1,.788-1.712,7.2,7.2,0,0,0-2.488,1.375A8.3,8.3,0,0,0,83.1-874Z" transform="translate(-80 880)" />
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
            fill="#36B979"
          />
          <path
            id="Path_3208"
            data-name="Path 3208"
            d="M7.57,11.662l5.683-5.683.874.874L7.57,13.41,3.636,9.476,4.51,8.6Z"
            transform="translate(785.014 592.211)"
            fill=""
            stroke=""
            strokeWidth="1"
          />
        </g>
      </g>
    </svg>
  );
}

export function InfoMark({
  width = 24,
  height = 24,
  fill = "#bbb"
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
        fill={fill}
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

export function SearchIcon({
  width = 20,
  height = 20,
}: {
  width?: number;
  height?: number;
  fill?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0,0,256,256"
      width={width}
      height={height}
    >
      <g
        fill="#bbbbbb"
        fillRule="nonzero"
        stroke="none"
        strokeWidth="1"
        strokeLinecap="butt"
        strokeLinejoin="miter"
        strokeMiterlimit="10"
        strokeDasharray=""
        strokeDashoffset="0"
        fontFamily="none"
        fontWeight="none"
        fontSize="none"
        textAnchor="none"
        style={{
          mixBlendMode: "normal",
        }}
      >
        <g transform="scale(5.12,5.12)">
          <path d="M21,3c-9.37891,0 -17,7.62109 -17,17c0,9.37891 7.62109,17 17,17c3.71094,0 7.14063,-1.19531 9.9375,-3.21875l13.15625,13.125l2.8125,-2.8125l-13,-13.03125c2.55469,-2.97656 4.09375,-6.83984 4.09375,-11.0625c0,-9.37891 -7.62109,-17 -17,-17zM21,5c8.29688,0 15,6.70313 15,15c0,8.29688 -6.70312,15 -15,15c-8.29687,0 -15,-6.70312 -15,-15c0,-8.29687 6.70313,-15 15,-15z"></path>
        </g>
      </g>
    </svg>
  );
}

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

export function InfoPointBlue({
  width = 20,
  height = 20,
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
            fill: "#FFC53D",
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

export function PieChart({
  width = 16,
  height = 16,
  fill = "#FFC53D",
  hoverFill = "#FFC53D",
}: {
  width?: number;
  height?: number;
  fill?: string;
  hoverFill?: string;
}
) {
  const [hover, setHover] = useState(false);

  function toggleHover(_hover: boolean): () => void {
    return () => {
      setHover(_hover);
    }
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 16 16"
      onMouseEnter={toggleHover(true)}
      onMouseLeave={toggleHover(false)}
    >
      <path
        id="Path_3616"
        data-name="Path 3616"
        d="M9.218,2.049v8.782H18A8.02,8.02,0,1,1,9.218,2.049Zm1.6,0A8.022,8.022,0,0,1,18,9.228H10.822Z"
        transform="translate(-2 -2.049)"
        fill={hover ? hoverFill : fill}
      />
    </svg>
  );
}

export function Key({
  width = 16,
  height = 16,
  fill = "#FFC53D",
  hoverFill = "#FFC53D",
}: {
  width?: number;
  height?: number;
  fill?: string;
  hoverFill?: string;
}
) {
  const [hover, setHover] = useState(false);

  function toggleHover(_hover: boolean): () => void {
    return () => {
      setHover(_hover);
    }
  }

  return (

    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 18.081 17.374"
      onMouseEnter={toggleHover(true)}
      onMouseLeave={toggleHover(false)}
    >
      <path
        id="Path_3620"
        data-name="Path 3620"
        d="M10.313,11.566l7.94-7.94,2.121,2.121L18.96,7.161l2.121,2.121-3.536,3.536L15.425,10.7l-2.99,2.99a5,5,0,1,1-2.121-2.121Zm-.9,5.849a2,2,0,1,0-2.828,0A2,2,0,0,0,9.414,17.414Z"
        transform="translate(-3 -3.626)"
        fill={hover ? hoverFill : fill}
      />
    </svg>
  );
}

export const CopyIcon = ({ fill = "#D0CFCF" }) => {
  return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="17.778" viewBox="0 0 16 17.778">
    <path id="Path_3606" data-name="Path 3606"
          d="M6.555,5.556V2.889A.889.889,0,0,1,7.444,2H18.111A.889.889,0,0,1,19,2.889V15.333a.889.889,0,0,1-.889.889H15.444v2.666a.892.892,0,0,1-.895.89H3.895A.89.89,0,0,1,3,18.888L3,6.445a.892.892,0,0,1,.895-.89ZM4.78,7.333,4.778,18h8.889V7.333ZM8.333,5.556h7.111v8.889h1.778V3.778H8.333Z"
          transform="translate(-3 -2)" fill={fill} />
  </svg>;
};

export const WarningIcon = ({ width = 27, height = 24, className = "", fill = "#ffc53d" }) => {
  return <svg xmlns="http://www.w3.org/2000/svg" style={{ width, height }} className={className} viewBox="0 0 27.789 24"
  >
    <path id="warning_FILL1_wght400_GRAD0_opsz24_4_" data-name="warning_FILL1_wght400_GRAD0_opsz24 (4)"
          d="M40-856l13.895-24,13.895,24Zm13.895-3.789a1.222,1.222,0,0,0,.9-.363,1.222,1.222,0,0,0,.363-.9,1.222,1.222,0,0,0-.363-.9,1.222,1.222,0,0,0-.9-.363,1.222,1.222,0,0,0-.9.363,1.222,1.222,0,0,0-.363.9,1.222,1.222,0,0,0,.363.9A1.222,1.222,0,0,0,53.895-859.789Zm-1.263-3.789h2.526v-6.316H52.632Z"
          transform="translate(-40 880)" fill={fill} />
  </svg>;
};


export const XaiIcon = ({width = 16, height = 16}) => {
  return (
  <svg className="fill-white group-hover:fill-red duration-200 ease-in"  version="1.0" xmlns="http://www.w3.org/2000/svg"
 width={width} height={height} viewBox="0 0 600.000000 600.000000"
 preserveAspectRatio="xMidYMid meet">
<g transform="translate(0.000000,600.000000) scale(0.100000,-0.100000)"
>
<path d="M2740 4858 c-140 -243 -256 -448 -258 -457 -1 -9 358 -639 798 -1401
l799 -1385 -1076 -3 c-592 -1 -1078 0 -1080 2 -3 2 167 301 376 664 210 363
381 665 381 672 0 7 -115 212 -257 457 -204 354 -259 441 -268 431 -18 -19
-1806 -3120 -1802 -3124 2 -2 1194 -3 2649 -2 l2646 3 -1320 2285 c-725 1257
-1322 2288 -1326 2292 -4 4 -122 -191 -262 -434z"/>
</g>
</svg>
  );
};

export const RedXaiIcon = ({ width = 16, height = 16 }) => {
  return (
    <svg className="fill-red group-hover:fill-red duration-200 ease-in" version="1.0" xmlns="http://www.w3.org/2000/svg"
         width={width} height={height} viewBox="0 0 600.000000 600.000000"
         preserveAspectRatio="xMidYMid meet">
      <g transform="translate(0.000000,600.000000) scale(0.100000,-0.100000)"
      >
        <path d="M2740 4858 c-140 -243 -256 -448 -258 -457 -1 -9 358 -639 798 -1401
l799 -1385 -1076 -3 c-592 -1 -1078 0 -1080 2 -3 2 167 301 376 664 210 363
381 665 381 672 0 7 -115 212 -257 457 -204 354 -259 441 -268 431 -18 -19
-1806 -3120 -1802 -3124 2 -2 1194 -3 2649 -2 l2646 3 -1320 2285 c-725 1257
-1322 2288 -1326 2292 -4 4 -122 -191 -262 -434z" />
      </g>
    </svg>
  );
};

export const ExchangeIcon = () => {
  return <svg xmlns="http://www.w3.org/2000/svg" width="21.314" height="19.414"
              viewBox="0 0 21.314 19.414"
              className="group">
    <path id="Path_3827" data-name="Path 3827"
          className="fill-white stroke-white group-hover:fill-hornetSting group-hover:stroke-hornetSting duration-250 ease-in"
          d="M11.95,7.95,10.536,9.364,8,6.828V20H6V6.828L3.465,9.364,2.05,7.95,7,3Zm10,8.1L17,21l-4.95-4.95,1.414-1.414L16,17.172V4h2V17.172l2.535-2.536Z"
          transform="translate(-1.343 -2.293)" strokeWidth="1" />
  </svg>;
};

export const XaiUpsideDown = ({width = 16, height = 16}) => {
  return (
  <svg className="fill-nulnOil group-hover:fill-red duration-200 ease-in" xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 20.784 18">
  <path id="Path_3682" data-name="Path 3682" d="M10.392,0,8.34,3.557l6.288,10.892H6.156l3.019-5.23L7.123,5.665,0,18H20.785Z" transform="translate(20.785 18.003) rotate(180)"/>
</svg>
  )
}

export const ArrowIcon = ({ width = 16, height = 16, fill = "fill-hornetSting" }) => {
  return (
    <svg className={`${fill} duration-200 ease-in arrow-icon`} xmlns="http://www.w3.org/2000/svg" width={width}
         height={height} viewBox="0 0 16 15.556">
  <path id="Path_3748" data-name="Path 3748" d="M16.172,11,10.808,5.636l1.414-1.414L20,12l-7.778,7.778-1.414-1.414L16.172,13H4V11Z" transform="translate(-4 -4.222)"/>
</svg>
  )
}

export const PaginationArrowLeft = ({ fill = "fill-white" }) => {
  return <svg className={`${fill} cursor-pointer`} xmlns="http://www.w3.org/2000/svg" width="7.778" height="12.728"
              viewBox="0 0 7.778 12.728">
    <path id="Path_3771" data-name="Path 3771" d="M10.828,12l4.95,4.95-1.414,1.414L8,12l6.364-6.364,1.414,1.414Z"
          transform="translate(-8 -5.637)" />
  </svg>;
};
export const PaginationArrowRight = ({ fill = "fill-white" }) => {
  return <svg className={`${fill} cursor-pointer`} xmlns="http://www.w3.org/2000/svg" width="7.778" height="12.728"
              viewBox="0 0 7.778 12.728">
    <path id="Path_3770" data-name="Path 3770" d="M10.828,12l4.95,4.95-1.414,1.414L8,12l6.364-6.364,1.414,1.414Z"
          transform="translate(15.778 18.364) rotate(180)" />
  </svg>;
};

export const PlusIcon = ({
                           width = 16,
                           height = 16,
                           fill = "#fe0130",
                           stroke = "#fe0130",
                           svgClassName = "",
                           pathClassName = ""
                         }) => {
  return(
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} className={svgClassName} viewBox="0 0 15 15">
      <path className={pathClassName} id="Path_3818" data-name="Path 3818" d="M11,11V5h2v6h6v2H13v6H11V13H5V11Z"
            transform="translate(-4.5 -4.5)"
          fill={fill} stroke={stroke} strokeWidth="1" />
</svg>)
}

export const MinusIcon = ({ width = 16, height = 3 }) => {
  return(
  <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 15 3">
  <path id="Path_3819" data-name="Path 3819" d="M5,11v2H19V11Z" transform="translate(-4.5 -10.5)" fill="#fe0130" stroke="#fe0130" strokeWidth="1"/>
</svg>)
}

export const SilverTierRebrand = () => {
  return <svg xmlns="http://www.w3.org/2000/svg" width="77.464" height="75.169" viewBox="0 0 77.464 75.169">
    <g id="Group_8954" data-name="Group 8954" transform="translate(-1356.5 -263.844)">
      <path id="Path_4091" data-name="Path 4091" d="M14,0,0,14v60.17H62.464l14-14V0Z"
            transform="translate(1357 264.344)" fill="rgba(147,139,139,0.15)" stroke="#938b8b" strokeWidth="1" />
      <path id="Path_4092" data-name="Path 4092"
            d="M21.931,0,17.6,7.5,30.87,30.488H12.991l6.372-11.036-4.331-7.5L0,37.988H43.861Z"
            transform="translate(1373.301 280.357)" fill="#bbb" />
    </g>
  </svg>;
};

export const PlatinumTierRebrand = () => {
  return <svg xmlns="http://www.w3.org/2000/svg" width="77.464"
              height="75.169" viewBox="0 0 77.464 75.169">
    <defs>
      <linearGradient id="linear-gradient" x1="0.5" y1="1.127" x2="0.5" gradientUnits="objectBoundingBox">
        <stop offset="0" stopColor="#5d6874" />
        <stop offset="1" stopColor="#e3e3e3" />
      </linearGradient>
    </defs>
    <g id="Group_8956" data-name="Group 8956" transform="translate(-1356.5 -435.844)">
      <path id="Path_4095" data-name="Path 4095" d="M14,0,0,14v60.17H62.464l14-14V0Z"
            transform="translate(1357 436.344)" fill="rgba(148,174,196,0.15)" stroke="#94aec4" strokeWidth="1" />
      <path id="Path_4096" data-name="Path 4096"
            d="M21.931,0,17.6,7.5,30.87,30.488H12.991l6.372-11.036-4.331-7.5L0,37.988H43.861Z"
            transform="translate(1373.301 452.357)" fill="url(#linear-gradient)" />
    </g>
  </svg>;
};

export const GoldTierRebrand = () => {
  return <svg xmlns="http://www.w3.org/2000/svg" width="77.464" height="75.169" viewBox="0 0 77.464 75.169">
    <g id="Group_8955" data-name="Group 8955" transform="translate(-1356.5 -349.844)">
      <path id="Path_4093" data-name="Path 4093" d="M14,0,0,14v60.17H62.464l14-14V0Z"
            transform="translate(1357 350.344)" fill="rgba(255,186,24,0.15)" stroke="#ffba18" strokeWidth="1" />
      <path id="Path_4094" data-name="Path 4094"
            d="M21.931,0,17.6,7.5,30.87,30.488H12.991l6.372-11.036-4.331-7.5L0,37.988H43.861Z"
            transform="translate(1373.301 366.357)" fill="#ffba18" />
    </g>
  </svg>;
};

export const DiamondTierRebrand = () => {
  return <svg xmlns="http://www.w3.org/2000/svg" width="77.464"
              height="75.169" viewBox="0 0 77.464 75.169">
    <defs>
      <linearGradient id="linear-gradient" x1="0.5" y1="1.127" x2="0.5" gradientUnits="objectBoundingBox">
        <stop offset="0" stopColor="#99aaf8" />
        <stop offset="1" stopColor="#8dfdf9" />
      </linearGradient>
    </defs>
    <g id="Group_8957" data-name="Group 8957" transform="translate(-1356.5 -521.844)">
      <path id="Path_4097" data-name="Path 4097" d="M14,0,0,14v60.17H62.464l14-14V0Z"
            transform="translate(1357 522.344)" fill="rgba(148,210,249,0.15)" stroke="#94d2f9" strokeWidth="1" />
      <path id="Path_4098" data-name="Path 4098"
            d="M21.931,0,17.6,7.5,30.87,30.488H12.991l6.372-11.036-4.331-7.5L0,37.988H43.861Z"
            transform="translate(1373.301 538.357)" fill="url(#linear-gradient)" />
    </g>
  </svg>;
};

export const BronzeTierRebrand = () => {
  return <svg xmlns="http://www.w3.org/2000/svg" width="77.464" height="75.169" viewBox="0 0 77.464 75.169">
    <g id="Group_8953" data-name="Group 8953" transform="translate(-1356.5 -177.844)">
      <path id="Path_3693" data-name="Path 3693" d="M14,0,0,14v60.17H62.464l14-14V0Z"
            transform="translate(1357 178.344)" fill="rgba(195,101,34,0.15)" stroke="#c36522" strokeWidth="1" />
      <path id="Path_3806" data-name="Path 3806"
            d="M21.931,0,17.6,7.5,30.87,30.488H12.991l6.372-11.036-4.331-7.5L0,37.988H43.861Z"
            transform="translate(1373.301 194.357)" fill="#c36522" />
    </g>
  </svg>;
};

export const HelpIcon = ({ width = 20, height = 20, fill = "#D0CFCF" }) => {
  return <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height}
              viewBox="0 0 14 14">
    <path id="Path_3878" data-name="Path 3878"
          d="M9,16a7,7,0,1,1,7-7A7,7,0,0,1,9,16Zm-.7-4.9v1.4H9.7V11.1ZM9.7,9.949A2.45,2.45,0,1,0,6.6,7.119l1.373.275A1.05,1.05,0,1,1,9,8.65a.7.7,0,0,0-.7.7V10.4H9.7Z"
          transform="translate(-2 -2)" fill={fill} />
  </svg>;
};

export const SuccessIcon = ({ width = 17, height = 17 }) => {
  return <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 20 20">
    <path id="Path_3847" data-name="Path 3847"
          d="M12,22A10,10,0,1,1,22,12,10,10,0,0,1,12,22Zm-1-6,7.071-7.071L16.66,7.515,11,13.172,8.174,10.343,6.76,11.757Z"
          transform="translate(-2 -2)" fill="#36b979" />
  </svg>;
};

export const WalletIcon = ({ width = 15, height = 12 }) => {
  return <svg className="fill-white group-hover:fill-hornetSting duration-200 ease-in w-full"
              xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 17.5 14">
  <path id="wallet_FILL1_wght400_GRAD0_opsz24" d="M83.5-786a3.37,3.37,0,0,1-2.472-1.028A3.37,3.37,0,0,1,80-789.5v-7a3.37,3.37,0,0,1,1.028-2.472A3.37,3.37,0,0,1,83.5-800H94a3.37,3.37,0,0,1,2.472,1.028A3.37,3.37,0,0,1,97.5-796.5v7a3.37,3.37,0,0,1-1.028,2.472A3.37,3.37,0,0,1,94-786Zm0-10.5H94a3.774,3.774,0,0,1,.919.109,2.963,2.963,0,0,1,.831.35v-.459a1.685,1.685,0,0,0-.514-1.236A1.685,1.685,0,0,0,94-798.25H83.5a1.685,1.685,0,0,0-1.236.514,1.685,1.685,0,0,0-.514,1.236v.459a2.963,2.963,0,0,1,.831-.35A3.774,3.774,0,0,1,83.5-796.5Zm-1.619,2.844,9.734,2.362a.9.9,0,0,0,.394,0,.965.965,0,0,0,.372-.175l3.041-2.538a1.892,1.892,0,0,0-.612-.536A1.631,1.631,0,0,0,94-794.75H83.5a1.706,1.706,0,0,0-1,.3A1.7,1.7,0,0,0,81.881-793.656Z" transform="translate(-80 800)"/>
</svg>
}

export const Burger = () => {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="18.856" viewBox="0 0 24 18.856">
    <g id="Group_8812" data-name="Group 8812" transform="translate(0 0)">
      <path id="Path_3893" data-name="Path 3893" d="M0,0V3.755H21.826L24,0Z" fill="#fff" />
      <path id="Path_3894" data-name="Path 3894" d="M0,20.8v3.756H21.826L24,20.8Z" transform="translate(0 -13.25)"
            fill="#fff" />
      <path id="Path_3895" data-name="Path 3895" d="M0,41.6v3.756H21.826L24,41.6Z" transform="translate(0 -26.5)"
            fill="#fff" />
    </g>
  </svg>;
};