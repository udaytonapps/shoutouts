import { AppInfo } from "../types";
import { getSessionId } from "./helpers";
import { CraEnvironment, LtiSessionConfig } from "./types";

/** For use during local development for two reasons.
 * 1. Since you cannot retrieve the sessionId from the react server
 * 2. So you don't have to rely on updating the server to check different scenarios tied to the appInfo
 */
export const APP_INFO_OVERRIDES: Partial<AppInfo> = {
  // apiUrl: "",
  // contextId: "",
  // isInstructor: true,
  // linkId: "",
  // sessionId: "56964e0052de1db3b61ebf796ffed648", // Learner session
  sessionId: "974808f85da6f94494aa93b89c9d1f82", // Instructor session
  // username: "",
  // darkMode: true,
  // baseColor: "#6B5B95", // DRK PRPL
  baseColor: "#0E4466", // DRK TEAL
  // baseColor: "#FFADAD", // LIGHT SALMON
  // baseColor: "#B3ADFF", // LIGHT BLUE
};

const sessionId = getSessionId();

export const EnvConfig: Record<CraEnvironment, LtiSessionConfig> = {
  pre_build: {
    apiUrl: "/learning-apps/mod/mod-shoutouts/api/index.php",
    sessionId: APP_INFO_OVERRIDES.sessionId || "",
  },
  local_build: {
    apiUrl: "/learning-apps/mod/mod-shoutouts/api/index.php",
    sessionId,
  },
  deployed_build: {
    apiUrl: "/mod/shoutouts/api/index.php",
    sessionId,
  },
};

export const DB_DATE_TIME_FORMAT = "yyyy-MM-dd HH:mm:ss";
