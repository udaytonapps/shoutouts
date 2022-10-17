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

export interface LearnerAward {
  id: string;
  comment: string;
  label: string;
  description: string;
  imageUrl: string;
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
