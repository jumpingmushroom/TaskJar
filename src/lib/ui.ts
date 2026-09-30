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

/** Stepper "+": by 1 below 5, then by 5. Goes past 30 on purpose so the "Too big!" hint can show. */
export function stepUp(minutes: number): number {
	return Math.min(60, minutes < 5 ? minutes + 1 : minutes + 5);
}

/** Stepper "−": by 5 down to 5, then by 1, never below 1. */
export function stepDown(minutes: number): number {
	return minutes > 5 ? minutes - 5 : Math.max(1, minutes - 1);
}

export const QUICK_MINUTES = [5, 10, 15, 20, 30] as const;
