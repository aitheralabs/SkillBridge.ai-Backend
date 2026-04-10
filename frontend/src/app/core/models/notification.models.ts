export interface NotificationResponse {
  id: string;
  type: string;
  title: string;
  message: string;
  payload: Record<string, any>;
  readAt: string | null;
  createdAt: string;
  expiresAt: string | null;
}
