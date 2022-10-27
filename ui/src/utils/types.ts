/** App-specific types */

import { AlertColor } from "@mui/material";
import { ApiResponse, LtiAppInfo } from "./common/types";

export interface AppInfo extends LtiAppInfo {
  // someOtherFieldFromTheLaunch: string;
}

export interface TemplateAlert {
  id: string;
  message: string;
  type: AlertColor;
}

export interface TemplateComment {
  id: string;
  createdAt: string;
  learnerName: string;
  text: string;
  type: AlertColor;
}

export interface AwardsConfiguration {
  configuration_id?: string;
  comments_required: boolean;
  moderation_enabled: boolean;
  anonymous_enabled: boolean;
  recipient_view_enabled: boolean;
  notifications_enabled: boolean;
  leaderboard_enabled: boolean;
  awarded_value: number;
  awarded_limit: number;
  awarded_cooldown: number;
  received_value: number;
  received_limit: number;
  received_cooldown: number;
}

export interface LearnerAward {
  id: string;
  comment: string;
  createdAt: string;
  description: string;
  imageUrl: string;
  label: string;
  senderName?: string;
}

export interface SentAward extends LearnerAward {
  recipientName: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  moderationResponse?: string;
}
export interface PendingTableRow extends SentAward {
  // Same as SentAward, but senderName is required
  senderName: string;
}

export interface LeaderboardLeader {
  awards: LearnerAward[];
  userId: string;
  count: number;
  givenName?: string;
  familyName?: string;
  lastFirst?: string;
}

export interface AllAwardsTableRecord extends LeaderboardLeader {}

export interface AwardType {
  id: string;
  label: string;
  description: string;
  imageUrl: string;
}

export interface Recipient {
  userId: string;
  givenName: string;
  familyName: string;
  lastFirst: string;
}

export interface AwardStatusUpdateData {
  id: string;
  status: RequestStatus;
  instructorComment?: string;
}

export interface HistoryTableRow extends SentAward {
  instructorComment?: string;
}

export type RequestStatus = "SUBMITTED" | "ACCEPTED" | "REJECTED" | "PENDING";

// API Interfaces
export interface GetContextConfigurationResponse extends ApiResponse {
  data: AwardsConfiguration;
}
export interface GetCourseAlertsResponse extends ApiResponse {
  data: TemplateAlert[];
}
export interface GetAllAwardsResponse extends ApiResponse {
  data: AllAwardsTableRecord[];
}
export interface GetPendingAwardsResponse extends ApiResponse {
  data: PendingTableRow[];
}
export interface GetHistoryResponse extends ApiResponse {
  data: HistoryTableRow[];
}
export interface GetCourseCommentsResponse extends ApiResponse {
  data: TemplateComment[];
}
export interface GetLearnerAwardResponse extends ApiResponse {
  data: LearnerAward[];
}
export interface GetSentAwardsResponse extends ApiResponse {
  data: SentAward[];
}
export interface GetLeaderboardResponse extends ApiResponse {
  data: LeaderboardLeader[];
}
export interface GetPotentialAwardResponse extends ApiResponse {
  data: AwardType[];
}
export interface GetRecipientResponse extends ApiResponse {
  data: Recipient[];
}
