import { Badge, Box, Tab, Tabs, Tooltip, Typography } from "@mui/material";
import { useState } from "react";
import AwardPanel from "../components/AwardPanel";
import TabPanel from "../components/common/TabPanel";
import {
  a11yProps,
  assembleConsolidatedAwardData,
  compareLastNames,
} from "../utils/common/helpers";
import {
  AwardsConfiguration,
  LeaderboardLeader,
  LearnerAward,
  RequestStatus,
  SentAward,
} from "../utils/types";
import AwardImage from "./AwardImage";
import HistoryTable from "./HistoryTable";
import LeaderboardTable from "./LeaderboardTable";
import ReviewDialog from "./ReviewDialog";

interface LearnerDashboardProps {
  configuration: AwardsConfiguration;
  learnerAwards: LearnerAward[];
  sentAwards: SentAward[];
  leaders: LeaderboardLeader[];
  loading: boolean;
  refreshTabs: () => void;
}

export default function LearnerDashboard(props: LearnerDashboardProps) {
  const {
    configuration,
    learnerAwards,
    sentAwards,
    loading,
    leaders,
    refreshTabs,
  } = props;
  const [tabPosition, setTabPosition] = useState(0);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [awardToReview, setAwardToReview] = useState<SentAward>();

  const tabs = ["SENT"];
  if (configuration.recipient_view_enabled) {
    tabs.unshift("RECEIVED");
  }
  if (configuration.leaderboard_enabled) {
    tabs.push("LEADERBOARD");
  }

  // Tab management
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    refreshTabs();
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
              <>
                <Box
                  display={"flex"}
                  flexWrap={"wrap"}
                  justifyContent={"center"}
                  p={3}
                  gap={3}
                >
                  {!learnerAwards.length && (
                    <Typography>No Shout-Outs received yet!</Typography>
                  )}
                  {assembleConsolidatedAwardData(learnerAwards).map(
                    (awardData, i) => (
                      <Box key={`award-${awardData.label}-${i}`}>
                        <Tooltip
                          title={
                            awardData.count > 1
                              ? `${awardData.label} x ${awardData.count}`
                              : awardData.label
                          }
                        >
                          <Box>
                            <Badge
                              badgeContent={
                                awardData.count > 1 ? awardData.count : null
                              }
                              color="primary"
                            >
                              <AwardImage
                                label={awardData.label}
                                url={awardData.imageUrl}
                                pixels={50}
                              />
                            </Badge>
                          </Box>
                        </Tooltip>
                      </Box>
                    )
                  )}
                </Box>
                <Box
                  display={"flex"}
                  flexWrap={"wrap"}
                  justifyContent={"center"}
                >
                  {learnerAwards.map((award, i) => (
                    <Box
                      key={`award-box-${i}`}
                      p={1}
                      sx={{ maxWidth: 600, width: "100%" }}
                    >
                      <AwardPanel award={award} configuration={configuration} />
                    </Box>
                  ))}
                </Box>
              </>
            )}
            {tab === "SENT" && (
              <>
                <HistoryTable
                  hideSender={true}
                  configuration={configuration}
                  rows={sentAwards}
                  loading={loading}
                  filters={tableFilters}
                  openReviewDialog={handleOpenReviewDialogFromHistory}
                />
              </>
            )}
            {tab === "LEADERBOARD" && (
              <>
                <LeaderboardTable
                  configuration={configuration}
                  rows={leaders}
                  loading={loading}
                />
              </>
            )}
          </TabPanel>
        );
      })}
      <ReviewDialog
        configuration={configuration}
        handleClose={handleCloseReviewDialog}
        handleSave={() => {}}
        open={reviewDialogOpen}
        requestRow={awardToReview || null}
      />
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
    label: "Shoutout Type",
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
