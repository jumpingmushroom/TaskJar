import type { ParamMatcher } from '@sveltejs/kit';

export const match: ParamMatcher = (param) => /^[1-9]\d{0,9}$/.test(param);
