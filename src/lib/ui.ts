/** Presentation helpers shared by the screens. */

/** The duration colour band a task falls into (DESIGN §1). Green is never a duration colour. */
export function durationBand(minutes: number): 'short' | 'mid' | 'long' {
	if (minutes <= 5) return 'short';
	if (minutes <= 15) return 'mid';
	return 'long';
}

/** CSS colour for a duration, as a token reference. */
export function durationColor(minutes: number): string {
	return `var(--dur-${durationBand(minutes)})`;
}
