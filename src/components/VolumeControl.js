import React, { useState } from 'react';
import { setVolume } from '../utils/audioEffects';

export default function VolumeControl() {
	const [volume, setVolumeState] = useState(() => {
		const savedVolume = localStorage.getItem('jeopardyVolume');
		return savedVolume !== null ? parseFloat(savedVolume) : 0.7;
	});

	const handleVolumeChange = (e) => {
		const newVolume = parseFloat(e.target.value);
		setVolumeState(newVolume);
		setVolume(newVolume);
	};

	const getVolumeIcon = () => {
		if (volume === 0) return '🔇';
		if (volume < 0.5) return '🔉';
		return '🔊';
	};

	return (
		<div className="volumeControl">
			<input
				type="range"
				min="0"
				max="1"
				step="0.01"
				value={volume}
				onChange={handleVolumeChange}
				className="volumeSlider"
			/>
			<span className={`volumeIcon ${volume === 0 ? 'muted' : ''}`}>
				{getVolumeIcon()}
			</span>
		</div>
	);
}
