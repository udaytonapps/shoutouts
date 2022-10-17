import { WorkspacePremium } from "@mui/icons-material";
import { Box, Button, Tab, Tabs, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import AwardPanel from "../components/AwardPanel";
import TabPanel from "../components/common/TabPanel";
import { getLearnerAwards } from "../utils/api-connector";
import { a11yProps } from "../utils/common/helpers";
import { LearnerAward } from "../utils/types";

type LearnerTab = "RECEIVED" | "SENT" | "LEADERBOARD";
const tabs: LearnerTab[] = ["RECEIVED", "SENT", "LEADERBOARD"];

function LearnerView() {
  const [tabPosition, setTabPosition] = useState(0);
  const [loading, setLoading] = useState(false);
  const [learnerAwards, setLearnerAwards] = useState<LearnerAward[]>([]);

  useEffect(() => {
    // Retrieve the list of alerts to display
    fetchLearnerAwards();
    // The empty dependency array '[]' means this will run once, when the component renders
  }, []);

  const fetchLearnerAwards = async () => {
    setLoading(true);
    const awards = await getLearnerAwards();
    setLearnerAwards(awards);
    setLoading(false);
  };

  const handleClickSend = () => {
    // setDialogOpen(true);
  };

  // Tab management
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabPosition(newValue);
  };

  return (
    <>
      <Box display={"flex"} justifyContent={"center"}>
        <Button
          endIcon={<WorkspacePremium />}
          size="large"
          variant="contained"
          onClick={handleClickSend}
        >
          Send Kudos
        </Button>
      </Box>
      {/* <Box pt={1}>
        <CommentsTable loading={loading} rows={comments} />
      </Box> */}
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

export default LearnerView;
