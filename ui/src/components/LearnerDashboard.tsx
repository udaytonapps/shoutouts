import { Box, Tab, Tabs, Typography } from "@mui/material";
import { useState } from "react";
import AwardPanel from "../components/AwardPanel";
import TabPanel from "../components/common/TabPanel";
import { a11yProps, compareLastNames } from "../utils/common/helpers";
import {
  AwardsConfiguration,
  LearnerAward,
  RequestStatus,
  SentAward,
} from "../utils/types";
import HistoryTable from "./HistoryTable";
import ReviewDialog from "./ReviewDialog";

interface LearnerDashboardProps {
  configuration: AwardsConfiguration;
  learnerAwards: LearnerAward[];
  sentAwards: SentAward[];
  loading: boolean;
}

export default function LearnerDashboard(props: LearnerDashboardProps) {
  const { configuration, learnerAwards, sentAwards, loading } = props;
  const [tabPosition, setTabPosition] = useState(0);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [awardToReview, setAwardToReview] = useState<SentAward>();

  const tabs = ["RECEIVED", "SENT"];
  if (configuration.leaderboard_enabled) {
    tabs.push("LEADERBOARD");
  }

  // Tab management
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabPosition(newValue);
  };

  // Dialog management
  const handleOpenReviewDialogFromHistory = (reviewId: string) => {
    setAwardToReview(sentAwards.find((award) => award.id === reviewId));
    setReviewDialogOpen(true);
  };

  const handleCloseReviewDialog = (event?: object, reason?: string) => {
    const reasonsToStayOpen = ["backdropClick", "escapeKeyDown"];
    if (reason && reasonsToStayOpen.includes(reason)) {
      return;
    }
    setReviewDialogOpen(false);
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
            {tab === "SENT" && (
              // <>
              //   <HistoryTable
              //     configuration={configuration}
              //     rows={sentAwards}
              //     loading={loading}
              //     filters={tableFilters}
              //     openReviewDialog={handleOpenReviewDialogFromHistory}
              //   />
              // </>
            )}
            {tab === "LEADERBOARD" && <>{tab} TAB CONTENT HERE</>}
          </TabPanel>
        );
      })}
      {/* <ReviewDialog
        handleClose={handleCloseReviewDialog}
        handleSave={() => {}}
        open={reviewDialogOpen}
        requestRow={awardToReview || null}
      /> */}
    </>
  );
}

const tableFilters = [
  {
    column: "recipientName",
    label: "Recipient Name",
    type: "enum",
    sort: compareLastNames,
  },
  {
    column: "label",
    label: "Award Type",
    type: "enum",
  },
  {
    column: "status",
    label: "Status",
    type: "enum",
    valueMapping: (val: RequestStatus) => {
      if (val === "SUBMITTED") {
        return "Pending";
      } else {
        return val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
      }
    },
  },
];
