<script lang="ts">
	import Reveal from './Reveal.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.task ? 'Your task' : 'Nothing fits'} · TaskJar</title>
</svelte:head>

<!-- A skip lands on a new draw id: remount so the shuffle plays again. -->
{#key data.drawId}
	<Reveal
		minutes={data.minutes}
		task={data.task}
		afterSkip={data.afterSkip}
		sample={data.sample}
		gone={data.gone}
	/>
{/key}
