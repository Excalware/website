<script lang="ts">
	import type { Provider } from '@supabase/supabase-js';

	import { t } from '$lib/localisation';
	import { goto } from '$app/navigation';
	import { getUser } from '$lib/api';
	import type { PageData } from './$types';

	import GitHub from '$lib/icons/GitHub.svelte';
	import Discord from '$lib/icons/Discord.svelte';
	export let data: PageData;
	const redirect = async (provider: Provider) => {
		await data.supabase.auth.signInWithOAuth({
			options: { redirectTo: `${data.url}/login` },
			provider
		});
	};

	$: if (data.session)
		getUser(data.session.user.id).then(user => {
			if (user)
				location.reload();
			else
				goto('/login/profile');
		});
</script>

<div class="main">
	<h1>{$t('signup')}</h1>
	{#if !data.session}
		<div class="btn-container">
			<button class="login-btn" on:click={() => redirect('github')}>
				<GitHub size={20}/>{$t('login.github')}
			</button>
			<button class="login-btn" on:click={() => redirect('discord')}>
				<Discord size={20}/>{$t('login.discord')}
			</button>
		</div>
	{/if}
</div>

<style lang="scss">
	.main {
		margin: 4rem auto;
		h1 {
			font-size: 2.5em;
		}
		.btn-container {
			gap: 16px;
			width: max-content;
			margin: 0 auto;
			display: flex;
			margin-top: 32px;
			flex-direction: column;
			.login-btn {
				gap: 12px;
				color: var(--button-color);
				border: none;
				cursor: pointer;
				display: flex;
				padding: 12px 24px;
				font-size: 1em;
				text-align: center;
				transition: background .25s;
				box-shadow: var(--button-shadow);
				background: var(--button-background);
				font-weight: 500;
				user-select: none;
				font-family: var(--font-tertiary);
				border-radius: 4px;
				text-decoration: none;
				justify-content: center;
				&:hover {
					background: var(--button-background-hover);
				}
			}
		}
	}
</style>