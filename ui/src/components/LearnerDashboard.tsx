import { Box, Tab, Tabs, Typography } from "@mui/material";
import { useState } from "react";
import AwardPanel from "../components/AwardPanel";
import TabPanel from "../components/common/TabPanel";
import { a11yProps } from "../utils/common/helpers";
import { LearnerAward } from "../utils/types";

interface LearnerDashboardProps {
  learnerAwards: LearnerAward[];
}

const tabs = ["RECEIVED", "SENT", "LEADERBOARD"] as const;

export default function LearnerDashboard(props: LearnerDashboardProps) {
  const { learnerAwards } = props;
  const [tabPosition, setTabPosition] = useState(0);

  // Tab management
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabPosition(newValue);
  };

  return (
    <>
      <Box pt={6} sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={tabPosition}
          variant="scrollable"
          onChange={handleTabChange}
          aria-label="basic tabs example"
        >
          {tabs.map((tab, i) => {
            return (
              <Tab
                key={`tab-${tab}`}
                label={
                  <Typography pb={0.5} variant="body2">
                    {tab}
                  </Typography>
                }
                {...a11yProps(i)}
              />
            );
          })}
        </Tabs>
      </Box>
      {tabs.map((tab, i) => {
        return (
          <TabPanel key={`tab-panel-${tab}`} value={tabPosition} index={i}>
            {tab === "RECEIVED" && (
              <Box
                display={"flex"}
                flexDirection={"column"}
                alignItems={"center"}
              >
                {learnerAwards.map((award, i) => (
                  <Box
                    key={`award-box-${i}`}
                    p={1}
                    sx={{ maxWidth: 600, width: "100%" }}
                  >
                    <AwardPanel award={award} />
                  </Box>
                ))}
              </Box>
            )}
            {tab === "SENT" && <>{tab} TAB CONTENT HERE</>}
            {tab === "LEADERBOARD" && <>{tab} TAB CONTENT HERE</>}
          </TabPanel>
        );
      })}
    </>
  );
}
