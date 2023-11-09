export function GreenPulse() {
	const greenPulseStyle = {
		background: 'rgba(51, 217, 178, 1)',
		borderRadius: '50%',
		height: '8px',
		width: '8px',
		boxShadow: '0 0 0 0 rgba(51, 217, 178, 1)',
		transform: 'scale(1)',
		animation: 'pulse-green 2s infinite',
	};

	return (
		<div className="animate-pulse" style={greenPulseStyle}/>
	)
}

export function YellowPulse() {
	const yellowPulseStyle = {
		background: 'rgba(255, 177, 66, 1)',
		borderRadius: '50%',
		height: '8px',
		width: '8px',
		boxShadow: '0 0 0 0 rgba(255, 177, 66, 1)',
		transform: 'scale(1)',
		animation: 'pulse-yellow 2s infinite',
	};

	return (
		<div className="animate-pulse" style={yellowPulseStyle}/>
	)
}

