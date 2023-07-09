<script lang="ts">
	import { Button, Select, TextInput, DropdownMenu } from '@voxelified/voxeliface';

	import { t } from '$lib/localisation';
	import { deserialize } from '$app/forms';
	import type { PageData } from '../../routes/mellow/server/[id]/settings/roblox/binds/$types';
	import type { RequestError, RobloxGroupRole } from '$lib/types';
	import { MellowBindType, RequestErrorType, MellowBindRequirementType, MellowBindRequirementsType } from '$lib/enums';

	import Modal from '$lib/components/Modal.svelte';
	import GroupSelect from '$lib/components/GroupSelect.svelte';
	import RequestErrorUI from '$lib/components/RequestError.svelte';

	import X from '$lib/icons/X.svelte';
	import Plus from '$lib/icons/Plus.svelte';
	import Check from '$lib/icons/Check.svelte';
	export let data: PageData;
	export let target: PageData['binds'][number] | null = null;
	export let onSave: () => void;
	export let trigger: () => void;

	let roleTrigger: () => void;
	let requirementTrigger: () => void;

	let name = '';
	let type = MellowBindType.DiscordRoles;
	let targets: string[] = [];
	let requirements: [MellowBindRequirementType, string[]][] = [];
	let requirementsType = MellowBindRequirementsType.MeetAll;

	let saving = false;
	let editing = false;
	let saveError: RequestError | null = null;

	let groupRoles: Record<string, RobloxGroupRole[]> = {};
	let roleSearchId: string | null = null;
	$: if (roleSearchId && !groupRoles[roleSearchId]) {
		const id = roleSearchId.toString();
		fetch(`/api/roblox/group-roles?id=${id}`)
			.then(response => response.json())
			.then(data => groupRoles[id] = data);
	}

	$: hasVerifiedType = requirements.some(i => i[0] === MellowBindRequirementType.HasVerifiedUserLink) ? MellowBindRequirementType.HasRobloxGroupRole : MellowBindRequirementType.HasVerifiedUserLink;

	$: if (target && !editing) {
		name = target.name, type = target.type, targets = target.target_ids;
		requirements = target.requirements.map(item => [item.type, item.data]), requirementsType = target.requirements_type;
		editing = true;
		trigger();
	}

	const save = async () => {
		saving = !(saveError = null);
		if (target) {
			const response = await fetch('?/update', {
				body: JSON.stringify({
					type,
					name: name || 'Unnamed Link',
					data: targets,
					target: target.id,
					requirements: requirements.map(item => ({
						type: item[0],
						data: item[1]
					})),
					requirementsType
				}),
				method: 'POST'
			});
			const result = deserialize(await response.text());
			if (result.type === 'success') {
				data.binds = data.binds.map(item => item.id === target!.id ? result.data as any : item);
				saving = false;
				trigger();
				resetAdd();
			} else if (result.type === 'failure')
				saving = !(saveError = result.data as any);
			else if (result.type === 'error')
				saving = !(saveError = { error: RequestErrorType.Offline });
		} else {
			const response = await fetch('?/create', {
				body: JSON.stringify({
					type,
					name: name || 'Unnamed Link',
					data: targets,
					requirements: requirements.map(item => ({
						type: item[0],
						data: item[1]
					})),
					requirementsType
				}),
				method: 'POST'
			});
			const result = deserialize(await response.text());
			if (result.type === 'success') {
				data.binds = [...data.binds, result.data as any];
				saving = false;
				trigger();
				resetAdd();
				setTimeout(onSave, 100);
			} else if (result.type === 'failure')
				saving = !(saveError = result.data as any);
			else if (result.type === 'error')
				saving = !(saveError = { error: RequestErrorType.Offline });
		}
		target = null;
		editing = false;
	};
	const addRequirement = (type: any) => requirements = [...requirements, [type, []]];
	const resetAdd = () => {
		targets = [], name = '', requirements = [];
		type = MellowBindType.DiscordRoles;
		target = null;
		editing = false;
	};
</script>

<Modal bind:trigger>
	<h1>{$t(`mellow_link_editor.header.${!!target}`)}</h1>

	<div class="fields">
		<div class="field">
			<p class="modal-label">{$t('mellow_link_editor.name')}</p>
			<TextInput bind:value={name} placeholder="Unnamed Link"/>
		</div>

		<div class="field">
			<p class="modal-label">{$t('mellow_link_editor.type')}</p>
			<Select.Root bind:value={type}>
				<p>{$t('mellow_link_editor.type.category')}</p>
				{#each Object.values(MellowBindType) as item}
					{#if typeof item === 'number'}
						<Select.Item value={item}>
							{$t(`mellow_bind.type.${item}`)}
						</Select.Item>
					{/if}
				{/each}
			</Select.Root>
		</div>
	</div>

	{#if type === MellowBindType.DiscordRoles}
		<p class="modal-label">{$t('mellow_link_editor.discord_roles')}</p>
		<div class="roles">
			{#each targets as item}
				<button class="item focusable" type="button" title={$t('action.remove')} on:click={() => targets = targets.filter(i => i !== item)}>
					{data.roles.find(role => role.id === item)?.name}
				</button>
			{/each}
			<DropdownMenu bind:trigger={roleTrigger}>
				<button class="item" slot="trigger" on:click={roleTrigger}>
					<Plus/>
				</button>
				<p>{$t('mellow_link_editor.discord_roles.category')}</p>
				{#each data.roles.filter(role => !targets.includes(role.id)) as item}
					<button type="button" on:click={() => targets = [...targets, item.id]}>
						{item.name}
					</button>
				{/each}
				<p>{$t('mellow_link_editor.discord_roles.options')}</p>
				<button type="button" on:click={() => targets = data.roles.map(role => role.id)}>
					{$t('mellow_link_editor.discord_roles.add_all')}
				</button>
			</DropdownMenu>
		</div>
	{/if}

	<p class="modal-label">{$t('mellow_link_editor.requirements')}</p>
	<div class="requirements">
		<Select.Root bind:value={requirementsType}>
			{#each Object.values(MellowBindRequirementsType) as item}
				{#if typeof item === 'number'}
					<Select.Item value={item}>
						{$t(`mellow_bind.requirements_type.${item}`)}
					</Select.Item>
				{/if}
			{/each}
		</Select.Root>
		{#each requirements as item}
			<div class="item">
				<div class="rfields">
					<p class="title">{$t(`mellow_bind.requirement.${item[0]}`)}</p>
					{#if item[0] === MellowBindRequirementType.HasRobloxGroupRole}
						<div class="fields">
							<div class="field">
								<p class="label">{$t('mellow_link_editor.requirement.group')}</p>
								<GroupSelect bind:value={item[1][0]} onChange={value => roleSearchId = value}/>
							</div>
							{#if groupRoles[item[1][0]]}
								<div class="field">
									<p class="label">{$t('mellow_link_editor.requirement.group_role')}</p>
									<Select.Root bind:value={item[1][1]} placeholder={$t('mellow_link_editor.requirement.group_role.placeholder')}>
										{#each groupRoles[item[1][0]] as role}
											<Select.Item value={role.id.toString()}>
												{role.name}
											</Select.Item>
										{/each}
									</Select.Root>
								</div>
							{/if}
						</div>
					{/if}
					{#if item[0] === MellowBindRequirementType.HasRobloxGroupRankInRange}
						<div class="fields">
							<div class="field">
								<p class="label">{$t('mellow_link_editor.requirement.group')}</p>
								<GroupSelect bind:value={item[1][0]}/>
							</div>
							<div class="field">
								<p class="label">{$t('mellow_link_editor.requirement.rank_from')}</p>
								<TextInput bind:value={item[1][1]} placeholder="Rank"/>
							</div>
							<div class="field">
								<p class="label">{$t('mellow_link_editor.requirement.rank_to')}</p>
								<TextInput bind:value={item[1][2]} placeholder="Rank"/>
							</div>
						</div>
					{/if}
					{#if item[0] === MellowBindRequirementType.InRobloxGroup}
						<div class="field">
							<p class="label">{$t('mellow_link_editor.requirement.group')}</p>
							<GroupSelect bind:value={item[1][0]}/>
						</div>
					{/if}
				</div>
				<button type="button" on:click={() => requirements = requirements.filter(i => i !== item)}>
					<X/>
				</button>
			</div>
		{/each}
	</div>
	<DropdownMenu bind:trigger={requirementTrigger}>
		<Button slot="trigger" on:click={requirementTrigger}>
			<Plus/>{$t('mellow_link_editor.requirements.add')}
		</Button>
		<p>{$t('mellow_link_editor.requirements')}</p>
		{#each Object.values(MellowBindRequirementType) as type}
			{#if typeof type === 'number' && (type || !hasVerifiedType)}
				<button type="button" on:click={() => addRequirement(type)}>
					{$t(`mellow_bind.requirement.${type}`)}
				</button>
			{/if}
		{/each}
	</DropdownMenu>

	<RequestErrorUI data={saveError}/>
	<p class="explanation">{$t(`mellow_bind.explanation.${type}`, [targets])} {$t(`mellow_bind.explanation.end.${requirementsType}`, [requirements.length])}</p>
	<div class="modal-buttons">
		<Button on:click={save} disabled={saving}>
			<Check/>{$t('mellow_link_editor.finish')}
		</Button>
		<form method="dialog">
			<Button on:click={resetAdd} disabled={saving}>
				<X/>{$t('action.cancel')}
			</Button>
		</form>
	</div>
</Modal>

<style lang="scss">
	.requirements {
		gap: 8px;
		flex: 0 1 auto;
		display: flex;
		margin-bottom: 8px;
		flex-direction: column;
		.item {
			gap: 24px;
			display: flex;
			padding: 12px 16px;
			background: var(--background-primary);
			border-radius: 8px;
			.title {
				margin: auto 0;
				font-size: .9em;
			}
			.rfields {
				gap: 16px;
				display: flex;
				flex-direction: column;
				.field .label {
					color: var(--color-secondary);
					margin: 0 0 6px;
					font-size: .9em;
				}
			}
			& > button {
				color: var(--color-primary);
				border: none;
				cursor: pointer;
				margin: 0 0 0 auto;
				height: fit-content;
				padding: 0;
				display: flex;
				background: none;
			}
		}
	}

	.fields {
		gap: 16px;
		display: flex;
		.field p {
			margin-top: 0;
		}
	}

	.roles {
		gap: 4px;
		flex: 0 1 auto;
		display: flex;
		flex-wrap: wrap;
		max-width: 512px;
		.item {
			color: var(--color-tertiary);
			height: 28px;
			border: none;
			cursor: pointer;
			display: flex;
			padding: 0 12px;
			font-size: .8em;
			background: var(--background-primary);
			align-items: center;
			font-family: var(--font-primary);
			border-radius: 16px;
			&:hover {
				box-shadow: inset 0 0 0 1px var(--border-secondary);
			}
		}
		:global(.content) {
			overflow: auto;
			max-height: 192px;
		}
	}

	.modal-label {
		color: var(--color-secondary);
		margin: 0 0 6px;
		font-size: .9em;
		&:not(:first-child):not(:nth-child(2)) {
			margin-top: 24px;
		}
	}
	.explanation {
		color: var(--color-secondary);
		margin: 32px 0 8px;
		font-size: .9em;
	}
	.modal-buttons {
		gap: 16px;
		display: flex;
	}
</style>