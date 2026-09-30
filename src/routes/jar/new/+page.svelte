<script lang="ts">
	import { resolve } from '$app/paths';
	import Icon from '$lib/components/Icon.svelte';
	import TaskForm from '$lib/components/TaskForm.svelte';

	let { form } = $props();
</script>

<svelte:head>
	<title>New task · TaskJar</title>
</svelte:head>

<section class="screen">
	<div class="screen-header start">
		<a class="press icon-btn" href={resolve('/jar')} aria-label="Back">
			<Icon name="back" />
		</a>
		<h1 class="disp form-title">New task</h1>
	</div>
	<TaskForm
		title={form?.title}
		minutes={form?.minutes || undefined}
		serverErrors={form?.errors}
		submitLabel="Add to the jar"
	/>
</section>
