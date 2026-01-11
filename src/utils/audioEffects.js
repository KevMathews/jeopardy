// Audio Effects Utility
// Centralized audio functions for UI interactions

// Volume management
const getVolume = () => {
	const savedVolume = localStorage.getItem('jeopardyVolume');
	return savedVolume !== null ? parseFloat(savedVolume) : 0.7; // Default 70%
};

export const setVolume = (volume) => {
	localStorage.setItem('jeopardyVolume', volume.toString());
};

export const playHoverSound = () => {
	const volume = getVolume();
	if (volume === 0) return; // Muted

	const audioContext = new (window.AudioContext || window.webkitAudioContext)();
	const oscillator = audioContext.createOscillator();
	const gainNode = audioContext.createGain();

	oscillator.connect(gainNode);
	gainNode.connect(audioContext.destination);

	// Soft, pleasant chime sound
	oscillator.type = 'sine';
	oscillator.frequency.value = 600; // Pleasant mid-high frequency

	// Very gentle volume and quick fade
	const baseVolume = 0.08 * volume;
	gainNode.gain.setValueAtTime(0, audioContext.currentTime);
	gainNode.gain.linearRampToValueAtTime(baseVolume, audioContext.currentTime + 0.01);
	gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.15);

	oscillator.start(audioContext.currentTime);
	oscillator.stop(audioContext.currentTime + 0.15);
};

export const playClickSound = () => {
	const volume = getVolume();
	if (volume === 0) return; // Muted

	const audioContext = new (window.AudioContext || window.webkitAudioContext)();

	// Create two oscillators for a rich, Apple-like click
	const osc1 = audioContext.createOscillator();
	const osc2 = audioContext.createOscillator();
	const gainNode = audioContext.createGain();
	const filter = audioContext.createBiquadFilter();

	osc1.connect(gainNode);
	osc2.connect(gainNode);
	gainNode.connect(filter);
	filter.connect(audioContext.destination);

	// Premium click sound - two frequencies for richness
	osc1.type = 'sine';
	osc1.frequency.value = 1200; // Higher frequency
	osc2.type = 'sine';
	osc2.frequency.value = 800; // Lower frequency for depth

	// High-pass filter for crispness
	filter.type = 'highpass';
	filter.frequency.value = 400;

	// Quick, satisfying envelope - Apple-style
	const baseVolume = 0.15 * volume;
	gainNode.gain.setValueAtTime(0, audioContext.currentTime);
	gainNode.gain.linearRampToValueAtTime(baseVolume, audioContext.currentTime + 0.005); // Very fast attack
	gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.08); // Quick decay

	osc1.start(audioContext.currentTime);
	osc2.start(audioContext.currentTime);
	osc1.stop(audioContext.currentTime + 0.08);
	osc2.stop(audioContext.currentTime + 0.08);
};
