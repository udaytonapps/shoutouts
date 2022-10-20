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
  id: string;
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
  label: string;
  description: string;
  imageUrl: string;
}

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
}

// API Interfaces
export interface GetCourseAlertsResponse extends ApiResponse {
  data: TemplateAlert[];
}
export interface GetCourseCommentsResponse extends ApiResponse {
  data: TemplateComment[];
}
export interface GetLearnerAwardResponse extends ApiResponse {
  data: LearnerAward[];
}
export interface GetPotentialAwardResponse extends ApiResponse {
  data: AwardType[];
}
export interface GetRecipientResponse extends ApiResponse {
  data: Recipient[];
}
