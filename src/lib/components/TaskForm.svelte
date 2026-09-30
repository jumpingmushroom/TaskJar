<script lang="ts">
	import { enhance } from '$app/forms';
	import type { Snippet } from 'svelte';
	import { durationColor, QUICK_MINUTES, stepDown, stepUp } from '$lib/ui';
	import { isTooBig, TASK_ERROR_MESSAGES, validateTask, type TaskErrors } from '$lib/task';
	import Icon from './Icon.svelte';

	/**
	 * Add / edit task form. Validation runs here with the same `validateTask`
	 * the server uses; the server remains the authority.
	 */
	let {
		title: initialTitle = '',
		minutes: initialMinutes = 10,
		serverErrors,
		submitLabel,
		action = '',
		extra
	}: {
		title?: string;
		minutes?: number | string;
		serverErrors?: TaskErrors;
		submitLabel: string;
		action?: string;
		/** Extra content under the save button (the delete action on Edit). */
		extra?: Snippet;
	} = $props();

	// Seeded once from the props: the form owns these values while it is on screen.
	let title = $state((() => initialTitle)());
	let minutesValue = $state<number | null>((() => Number(initialMinutes))());
	let triedSave = $state(false);
	// Server errors only matter until the user changes something.
	let showServerErrors = $state(true);
	let saving = $state(false);

	const minutes = $derived(minutesValue ?? NaN);
	const tooBig = $derived(Number.isFinite(minutes) && isTooBig(minutes));
	const validation = $derived(validateTask({ title, minutes }));
	const errors = $derived<TaskErrors>(
		triedSave && !validation.ok ? validation.errors : showServerErrors ? (serverErrors ?? {}) : {}
	);
	const nameError = $derived(errors.title ? TASK_ERROR_MESSAGES[errors.title] : null);
	const minutesError = $derived(
		errors.minutes === 'minutes_invalid' ? TASK_ERROR_MESSAGES.minutes_invalid : null
	);
	const canSave = $derived(validation.ok);

	function setMinutes(next: number) {
		minutesValue = next;
		edited();
	}

	function edited() {
		triedSave = false;
		showServerErrors = false;
	}

	function current() {
		return Number.isInteger(minutes) && minutes >= 1 ? minutes : 1;
	}
</script>

<form
	method="POST"
	{action}
	class="task-form"
	novalidate
	use:enhance={({ cancel, submitter }) => {
		// Buttons marked formnovalidate (delete) skip the task validation.
		if (!submitter?.hasAttribute('formnovalidate')) {
			triedSave = true;
			if (!validation.ok) return cancel();
		}
		saving = true;
		return async ({ update }) => {
			await update({ reset: false });
			saving = false;
		};
	}}
>
	<label for="task-title" class="field-label">What needs doing?</label>
	<input
		id="task-title"
		name="title"
		type="text"
		autocomplete="off"
		placeholder="e.g. Water the plants"
		maxlength="120"
		required
		aria-invalid={nameError ? 'true' : undefined}
		aria-describedby={nameError ? 'title-error' : undefined}
		bind:value={title}
		oninput={edited}
	/>
	{#if nameError}
		<p id="title-error" class="field-error">{nameError}</p>
	{/if}

	<p id="minutes-label" class="field-label spaced">How long will it take?</p>
	<div class="stepper" class:over={tooBig}>
		<button
			type="button"
			class="press step"
			aria-label="Less time"
			onclick={() => setMinutes(stepDown(current()))}
		>
			<Icon name="minus" stroke={3.2} />
		</button>
		<span class="amount">
			<input
				name="minutes"
				type="number"
				inputmode="numeric"
				min="1"
				step="1"
				aria-labelledby="minutes-label"
				aria-invalid={tooBig || minutesError ? 'true' : undefined}
				aria-describedby={tooBig ? 'too-big' : minutesError ? 'minutes-error' : undefined}
				class="disp"
				style:width="{Math.max(1, String(minutesValue ?? '').length)}ch"
				bind:value={minutesValue}
				oninput={edited}
			/>
			<span class="disp unit">min</span>
		</span>
		<button
			type="button"
			class="press step"
			aria-label="More time"
			onclick={() => setMinutes(stepUp(current()))}
		>
			<Icon name="plus" stroke={3.2} />
		</button>
	</div>

	<div class="chips">
		{#each QUICK_MINUTES as n (n)}
			<button
				type="button"
				class="press chip"
				aria-label="{n} minutes"
				aria-pressed={minutes === n}
				style:background={minutes === n ? durationColor(n) : undefined}
				onclick={() => setMinutes(n)}
			>
				{n}
			</button>
		{/each}
	</div>

	{#if tooBig}
		<div id="too-big" class="too-big pop-in" role="alert">
			<Icon name="split" size={28} stroke={2.6} color="var(--on-fill)" />
			<div>
				<p class="disp too-big-title">Too big! Split it into smaller tasks.</p>
				<p class="too-big-body">
					Tasks max out at 30 minutes. Break it into a few parts and add each one.
				</p>
			</div>
		</div>
	{:else if minutesError}
		<p id="minutes-error" class="field-error">{minutesError}</p>
	{/if}

	<div class="spacer"></div>

	<button
		type="submit"
		class="press btn btn-primary save"
		class:looks-disabled={!canSave}
		disabled={tooBig || saving}
	>
		{submitLabel}
	</button>
	{@render extra?.()}
</form>

<style>
	.task-form {
		display: flex;
		flex-direction: column;
		flex-grow: 1;
		margin-top: 28px;
	}

	.field-label {
		font-size: 16px;
		font-weight: 800;
	}

	.spaced {
		margin-top: 26px;
	}

	#task-title {
		height: 60px;
		margin-top: 10px;
		padding: 0 18px;
		border: var(--line) solid var(--edge);
		border-radius: 18px;
		background: var(--surface);
		font-size: 20px;
		font-weight: 600;
	}

	#task-title::placeholder {
		color: var(--muted);
		font-weight: 500;
	}

	.field-error {
		margin-top: 8px;
		color: var(--error);
		font-size: 15px;
		font-weight: 700;
	}

	.stepper {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: 10px;
		padding: 12px;
		border: var(--line) solid var(--edge);
		border-radius: 24px;
		background: var(--surface);
	}

	.stepper.over {
		border-color: var(--error);
	}

	.step {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 56px;
		height: 56px;
		padding: 0;
		border-radius: 18px;
		background: var(--soft);
	}

	.amount {
		display: flex;
		align-items: baseline;
		gap: 6px;
	}

	.amount input {
		min-width: 1ch;
		padding: 0;
		border: 0;
		border-radius: 8px;
		background: transparent;
		font-size: 72px;
		line-height: 1;
		letter-spacing: -3px;
		text-align: center;
		appearance: textfield;
		-moz-appearance: textfield;
	}

	.amount input::-webkit-outer-spin-button,
	.amount input::-webkit-inner-spin-button {
		margin: 0;
		-webkit-appearance: none;
	}

	.unit {
		font-size: 22px;
	}

	.over .amount input,
	.over .unit {
		color: var(--error);
	}

	.chips {
		display: flex;
		gap: 8px;
		margin-top: 14px;
	}

	.chip {
		flex: 1;
		height: 48px;
		padding: 0;
		border-radius: 14px;
		background: var(--surface);
		box-shadow: 0 3px 0 var(--edge);
		font-size: 18px;
		font-weight: 800;
	}

	.chip[aria-pressed='true'] {
		color: var(--on-fill);
	}

	.too-big {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		margin-top: 18px;
		padding: 16px;
		border: var(--line) solid var(--edge);
		border-radius: 20px;
		background: var(--error-bg);
		color: var(--on-fill);
	}

	.too-big :global(svg) {
		flex-shrink: 0;
	}

	.too-big-title {
		font-size: 20px;
	}

	.too-big-body {
		margin-top: 4px;
		font-size: 15px;
		line-height: 1.4;
		font-weight: 500;
	}

	.spacer {
		flex-grow: 1;
		min-height: 24px;
	}

	.save {
		min-height: 66px;
		font-size: 22px;
	}

	.save.looks-disabled {
		background: var(--disabled-bg);
		color: var(--disabled-fg);
		box-shadow: none;
	}
</style>
