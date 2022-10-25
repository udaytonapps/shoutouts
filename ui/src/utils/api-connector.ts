import axios from "axios";
import { ApiResponse, GetInfoResponse, LtiAppInfo } from "./common/types";
import { EnvConfig } from "./common/constants";
import { getEnvironment } from "./common/helpers";
import {
  TemplateAlert,
  GetCourseAlertsResponse,
  TemplateComment,
  GetCourseCommentsResponse,
  LearnerAward,
  GetLearnerAwardResponse,
  Recipient,
  GetRecipientResponse,
  AwardType,
  GetPotentialAwardResponse,
  AwardsConfiguration,
  GetContextConfigurationResponse,
  SentAward,
  GetSentAwardsResponse,
  LeaderboardLeader,
  GetLeaderboardResponse,
  GetAllAwardsResponse,
  PendingTableRow,
  HistoryTableRow,
  GetHistoryResponse,
  GetPendingAwardsResponse,
  AwardStatusUpdateData,
} from "./types";

const config = EnvConfig[getEnvironment()];

export const getInfo = async (): Promise<LtiAppInfo | string | null> => {
  try {
    const res = await axios.get<GetInfoResponse>(
      `${config.apiUrl}/info?PHPSESSID=${config.sessionId}`
    );
    if (typeof res.data === "string") {
      // A warning may have come back. Try to parse the info, if that part succeeded.
      const jsonString = (res.data as any).match(/{(.*)}/g)[0];
      const jsonResponse = JSON.parse(jsonString);
      return jsonResponse.data;
    } else {
      return res.data.data;
    }
  } catch (e) {
    console.error(e);
    if (typeof e === "string") {
      return e;
    } else {
      return null;
    }
  }
};

/** INSTRUCTOR */

export const addAlert = async (alert: TemplateAlert): Promise<void> => {
  try {
    const body = alert;
    await axios.post<ApiResponse>(
      `${config.apiUrl}/instructor/alerts?PHPSESSID=${config.sessionId}`,
      body
    );
    return;
  } catch (e) {
    console.error(e);
    return;
  }
};

export const deleteAlert = async (alertId: string): Promise<void> => {
  try {
    await axios.delete<ApiResponse>(
      `${config.apiUrl}/instructor/alerts/${alertId}?PHPSESSID=${config.sessionId}`
    );
    return;
  } catch (e) {
    console.error(e);
    return;
  }
};

export const getAllPendingAwards = async (): Promise<PendingTableRow[]> => {
  try {
    const res = await axios.get<GetPendingAwardsResponse>(
      `${config.apiUrl}/instructor/pending?PHPSESSID=${config.sessionId}`
    );
    return res.data.data || [];
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const getAllAwards = async (): Promise<LeaderboardLeader[]> => {
  try {
    const res = await axios.get<GetAllAwardsResponse>(
      `${config.apiUrl}/instructor/awards?PHPSESSID=${config.sessionId}`
    );
    return res.data.data || [];
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const getAllAwardsHistory = async (): Promise<HistoryTableRow[]> => {
  try {
    const res = await axios.get<GetHistoryResponse>(
      `${config.apiUrl}/instructor/history?PHPSESSID=${config.sessionId}`
    );
    return res.data.data || [];
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const updateAward = async (updateData: AwardStatusUpdateData) => {
  try {
    const body = updateData;
    await axios.put<ApiResponse>(
      `${config.apiUrl}/instructor/awards?PHPSESSID=${config.sessionId}`,
      body
    );
    return;
  } catch (e) {
    console.error(e);
    return;
  }
};

/** LEARNER */

export const getContextConfiguration =
  async (): Promise<AwardsConfiguration | null> => {
    try {
      const res = await axios.get<GetContextConfigurationResponse>(
        `${config.apiUrl}/learner/configuration?PHPSESSID=${config.sessionId}`
      );
      return res.data.data || null;
    } catch (e) {
      console.error(e);
      return null;
    }
  };

export const getCourseAlerts = async (): Promise<TemplateAlert[]> => {
  try {
    const res = await axios.get<GetCourseAlertsResponse>(
      `${config.apiUrl}/learner/alerts?PHPSESSID=${config.sessionId}`
    );
    return res.data.data || [];
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const addComment = async (comment: TemplateComment): Promise<void> => {
  try {
    const body = comment;
    await axios.post<ApiResponse>(
      `${config.apiUrl}/learner/comments?PHPSESSID=${config.sessionId}`,
      body
    );
    return;
  } catch (e) {
    console.error(e);
    return;
  }
};

export const getCourseComments = async (): Promise<TemplateComment[]> => {
  try {
    const res = await axios.get<GetCourseCommentsResponse>(
      `${config.apiUrl}/learner/comments?PHPSESSID=${config.sessionId}`
    );
    return res.data.data || [];
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const getRecipients = async (): Promise<Recipient[]> => {
  try {
    const res = await axios.get<GetRecipientResponse>(
      `${config.apiUrl}/learner/recipients?PHPSESSID=${config.sessionId}`
    );
    return res.data.data || [];
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const getLearnerAwards = async (): Promise<LearnerAward[]> => {
  try {
    const res = await axios.get<GetLearnerAwardResponse>(
      `${config.apiUrl}/learner/received?PHPSESSID=${config.sessionId}`
    );
    return res.data.data || [];
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const getSentAwards = async (): Promise<SentAward[]> => {
  try {
    const res = await axios.get<GetSentAwardsResponse>(
      `${config.apiUrl}/learner/sent?PHPSESSID=${config.sessionId}`
    );
    return res.data.data || [];
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const getLeaderboard = async (): Promise<LeaderboardLeader[]> => {
  try {
    const res = await axios.get<GetLeaderboardResponse>(
      `${config.apiUrl}/learner/leaderboard?PHPSESSID=${config.sessionId}`
    );
    return res.data.data || [];
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const getPotentialAwards = async (): Promise<AwardType[]> => {
  try {
    const res = await axios.get<GetPotentialAwardResponse>(
      `${config.apiUrl}/learner/award-types?PHPSESSID=${config.sessionId}`
    );
    return res.data.data || [];
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const sendAward = async (
  recipientId: string,
  awardTypeId: string,
  comment?: string
): Promise<void> => {
  try {
    const body = { recipientId, awardTypeId, comment };
    await axios.post<ApiResponse>(
      `${config.apiUrl}/learner/awards?PHPSESSID=${config.sessionId}`,
      body
    );
    return;
  } catch (e) {
    console.error(e);
    return;
  }
};
