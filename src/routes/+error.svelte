<script>
	import { t } from '$lib/localisation';
    import { page } from '$app/stores';
	import { RequestErrorType } from '$lib/enums';

	$: status = $page.status;

	let message;
	$: try {
		message = $t(`request_error.${Number(JSON.parse($page.error.message).error)}`);
	} catch (err) {}
</script>

<div class="main">
	<h1>{$t('error.page')}</h1>
	<h2>{$t('error.page2')}</h2>
	<p>
		{#if status === 403}
			{$t(`request_error.${RequestErrorType.Unauthorised}`)}
		{:else if message}
			{message}
		{:else}
			{$t('error.page3', [status, $page.error.message])}
		{/if}
	</p>
</div>

<style lang="scss">
	.main {
		margin: auto;
		display: flex;
		align-items: center;
		flex-direction: column;
		h1 {
			font-size: 3em;
			margin-bottom: 0;
		}
	}
</style>