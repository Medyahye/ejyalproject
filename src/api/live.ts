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
