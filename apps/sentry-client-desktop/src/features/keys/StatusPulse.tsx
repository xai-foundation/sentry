import log from "electron-log";

interface PulseStyle {
	size?: "sm" | "md" | "lg"
}

export function GreenPulse({size="sm"}: PulseStyle) {
	let pulseW;
	let pulseH;

	switch (size) {
		case "sm":
			pulseW = "0.5rem";
			pulseH = "0.5rem";
			break;
		case "md":
			pulseW = "1rem";
			pulseH = "1rem";
			break;
		case "lg":
			pulseW = "1.25rem";
			pulseH = "1.25rem";
			break;
		default:
			log.info("Invalid size"); // Handle the case where size is none of the specified values
	}

	const greenPulseStyle = {
		background: 'rgba(51, 217, 178, 1)',
		borderRadius: '50%',
		height: pulseH,
		width: pulseW,
		boxShadow: '0 0 0 0 rgba(51, 217, 178, 1)',
		transform: 'scale(1)',
		animation: 'pulse-green 2s infinite',
	};

	return (
		<div className="animate-pulse" style={greenPulseStyle}/>
	)
}

export function YellowPulse({size="sm"}: PulseStyle) {
	let pulseW;
	let pulseH;

	switch (size) {
		case "sm":
			pulseW = "0.5rem";
			pulseH = "0.5rem";
			break;
		case "md":
			pulseW = "1rem";
			pulseH = "1rem";
			break;
		case "lg":
			pulseW = "1.25rem";
			pulseH = "1.25rem";
			break;
		default:
			log.info("Invalid size"); // Handle the case where size is none of the specified values
	}

	const yellowPulseStyle = {
		background: 'rgba(255, 177, 66, 1)',
		borderRadius: '50%',
		height: pulseH,
		width: pulseW,
		boxShadow: '0 0 0 0 rgba(255, 177, 66, 1)',
		transform: 'scale(1)',
		animation: 'pulse-yellow 2s infinite',
	};

	return (
		<div className="animate-pulse" style={yellowPulseStyle}/>
	)
}

export function GreyPulse({size="sm"}: PulseStyle) {
	let pulseW;
	let pulseH;

	switch (size) {
		case "sm":
			pulseW = "0.5rem";
			pulseH = "0.5rem";
			break;
		case "md":
			pulseW = "1rem";
			pulseH = "1rem";
			break;
		case "lg":
			pulseW = "1.25rem";
			pulseH = "1.25rem";
			break;
		default:
			log.info("Invalid size"); // Handle the case where size is none of the specified values
	}

	const greyPulseStyle = {
		background: 'rgba(67, 63, 63, 1)',
		borderRadius: '50%',
		height: pulseH,
		width: pulseW,
		boxShadow: '0 0 0 0 rgba(67, 63, 63, 1)',
		transform: 'scale(1)',
	};

	return (
		<div style={greyPulseStyle}/>
	)
}