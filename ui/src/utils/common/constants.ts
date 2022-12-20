import { AppInfo } from "../types";
import { CraEnvironment, DecoratedWindow, LtiSessionConfig } from "./types";

/** For use during local development for two reasons.
 * 1. Since you cannot retrieve the sessionId from the react server
 * 2. So you don't have to rely on updating the server to check different scenarios tied to the appInfo
 */
export const APP_INFO_OVERRIDES: Partial<AppInfo> = {
  // apiUrl: "",
  // contextId: "",
  // isInstructor: true,
  // linkId: "",
  sessionId: "ed03c99420b986f103021e4f179ec8fc", // Learner session
  // sessionId: "0d09da738262ffd460e6e0830f9b3664", // Instructor session
  // username: "",
  // darkMode: true,
  // baseColor: "#6B5B95", // DRK PRPL
  baseColor: "#0E4466", // DRK TEAL
  // baseColor: "#FFADAD", // LIGHT SALMON
  // baseColor: "#B3ADFF", // LIGHT BLUE
};

const appConfig = (window as DecoratedWindow).appConfig || null;
const sessionId = appConfig?.sessionId || "";

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
