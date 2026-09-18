import { LiveChatMessage, LiveSession } from '../types';
import { apiRequest } from './client';

export function fetchLiveSessions(): Promise<LiveSession[]> {
  return apiRequest<LiveSession[]>('/live/');
}

export interface NewLiveSessionPayload {
  title: string;
  description: string;
  courseId?: string;
  categoryName: string;
  scheduledAt: string;
  durationMinutes: number;
}

export function createLiveSessionRequest(payload: NewLiveSessionPayload): Promise<LiveSession> {
  return apiRequest<LiveSession>('/live/', { method: 'POST', body: payload });
}

export function fetchLiveChat(liveId: string): Promise<LiveChatMessage[]> {
  return apiRequest<LiveChatMessage[]>(`/live/${liveId}/chat/`);
}

export function postLiveChatMessage(liveId: string, message: string): Promise<LiveChatMessage> {
  return apiRequest<LiveChatMessage>(`/live/${liveId}/chat/`, { method: 'POST', body: { message } });
}

export function fetchLiveSession(liveId: string): Promise<LiveSession> {
  return apiRequest<LiveSession>(`/live/${liveId}/`);
}

export function joinLiveSession(liveId: string): Promise<LiveSession> {
  return apiRequest<LiveSession>(`/live/${liveId}/join/`, { method: 'POST' });
}

export function leaveLiveSession(liveId: string): Promise<LiveSession> {
  return apiRequest<LiveSession>(`/live/${liveId}/leave/`, { method: 'POST' });
}

export function reactToLiveSession(liveId: string): Promise<LiveSession> {
  return apiRequest<LiveSession>(`/live/${liveId}/react/`, { method: 'POST' });
}

export function startLiveSession(liveId: string): Promise<LiveSession> {
  return apiRequest<LiveSession>(`/live/${liveId}/start/`, { method: 'POST' });
}

export function endLiveSession(liveId: string): Promise<LiveSession> {
  return apiRequest<LiveSession>(`/live/${liveId}/end/`, { method: 'POST' });
}
