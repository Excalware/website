import { RequestErrorType } from './enums';
import type { User, RobloxUser, ApiResponse, PartialRobloxUser, RobloxGroupRolesResponse, RobloxThumbnailsResponse, RobloxLookupGroupsResponse } from './types';
export const API_BASE = 'https://api.voxelified.com/v1';

export function getUser(userId: string) {
	return request<User>(`user/${userId}`).then(response => response.success ? response.data : null);
}

export function getRobloxUser(userId: string | number) {
	return request<RobloxUser>(`https://users.roblox.com/v1/users/${userId}`)
		.then(response => response.success ? response.data : null);
}

export function getRobloxUsers(userIds: (string | number)[]) {
	if (!userIds.length)
		return Promise.resolve([]);
	return request<{ data: PartialRobloxUser[] }>(`https://users.roblox.com/v1/users`, 'POST', {
		userIds,
		excludeBannedUsers: false
	}).then(response => response.success ? response.data.data : []);
}

export function getRobloxAvatars(userIds: (string | number)[], size: '48x48' | '150x150' = '48x48') {
	if (!userIds.length)
		return Promise.resolve([]);
	return request<{ data: { state: string, targetId: number, imageUrl: string }[] }>(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userIds.join(',')}&format=Png&size=${size}`)
		.then(response => response.success ? response.data.data : [])
}

export function lookupRobloxGroups(query: string) {
	return request<RobloxLookupGroupsResponse>(`https://groups.roblox.com/v1/groups/search/lookup?groupName=${query}`)
		.then(response => response.success ? response.data.data : []);
}

export function getRobloxGroupRoles(groupId: string | number) {
	return request<RobloxGroupRolesResponse>(`https://groups.roblox.com/v1/groups/${groupId}/roles`)
		.then(response => response.success ? response.data.roles : [])
}

export function getRobloxGroupAvatars(groupIds: (string | number)[], size: '150x150' | '420x420' = '150x150') {
	if (!groupIds.length)
		return Promise.resolve([]);
	return request<RobloxThumbnailsResponse>(`https://thumbnails.roblox.com/v1/groups/icons?groupIds=${groupIds.join(',')}&format=Png&size=${size}`)
		.then(response => response.success ? response.data.data : [])
}

export function createProfile(token: string, username: string) {
	return request<User>(`user`, 'POST', { username }, {
		authorization: `Bearer ${token}`
	});
}

export function uploadAvatar(token: string, userId: string, newAvatar: ArrayBuffer) {
	return request(`user/${userId}/icon`, 'PATCH', newAvatar, {
		authorization: `Bearer ${token}`
	});
}

export function markNotificationAsRead(token: string, userId: string, notificationId: string) {
	return request(`user/${userId}/notification/${notificationId}/read`, 'POST', null, {
		authorization: `Bearer ${token}`
	});
}

export function request<T = any>(path: string, method: 'GET' | 'PUT' | 'POST' | 'PATCH' | 'DELETE' = 'GET', body?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
	return fetch(path.startsWith('http') ? path : `${API_BASE}/${path}`, {
		body: body ? body instanceof URLSearchParams ? body.toString() : body instanceof ArrayBuffer ? body : JSON.stringify(body) : undefined,
		method,
		headers
	}).then(response => response.json().then(data => {
		if (data.error)
			return { ...data, success: false };
		else if (response.status < 200 || response.status > 399)
			return { error: RequestErrorType.Unknown, success: false };
		return { data, success: true };
	}).catch(() => {
		if (response.status < 200 || response.status > 399)
			return { error: RequestErrorType.Unknown, success: false };
		return { success: true };
	})).catch(() => ({ error: RequestErrorType.Unknown, success: false }));
}