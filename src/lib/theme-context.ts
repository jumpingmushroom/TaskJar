import { getContext, setContext } from 'svelte';
import type { Theme } from './theme';

/** This device's theme choice, shared by the root layout and the toggle. */
export interface ThemeState {
	forced: Theme | null;
}

const KEY = Symbol('theme');

export const setThemeContext = (state: ThemeState) => setContext(KEY, state);
export const getThemeContext = () => getContext<ThemeState>(KEY);
