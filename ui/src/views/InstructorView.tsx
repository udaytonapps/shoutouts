import { Box, Tab, Tabs, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import TabPanel from "../components/common/TabPanel";
import HistoryTable from "../components/HistoryTable";
import LeaderboardTable from "../components/LeaderboardTable";
import PendingTable from "../components/PendingTable";
import ReviewDialog from "../components/ReviewDialog";
import {
  getAllAwards,
  getAllAwardsHistory,
  getAllPendingAwards,
  getContextConfiguration,
  getRoster,
  getTsugiUsers,
  updateAward,
} from "../utils/api-connector";
import { a11yProps, compareLastNames } from "../utils/common/helpers";
import {
  AllAwardsTableRecord,
  AwardsConfiguration,
  AwardStatusUpdateData,
  HistoryTableRow,
  PendingTableRow,
  RequestStatus,
} from "../utils/types";

function InstructorView() {
  const [loading, setLoading] = useState(true);
  const [configuration, setConfiguration] = useState<AwardsConfiguration>();
  const [tabPosition, setTabPosition] = useState(0);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [allAwards, setAllAwards] = useState<AllAwardsTableRecord[]>([]);
  const [pendingAwards, setPendingAwards] = useState<PendingTableRow[]>([]);
  const [historyAwards, setHistoryAwards] = useState<HistoryTableRow[]>([]);
  const [awardToReview, setAwardToReview] = useState<
    HistoryTableRow | PendingTableRow
  >();

  const tabs = ["AWARDED", "HISTORY"];
  if (configuration?.moderation_enabled) {
    tabs.unshift("PENDING");
  }

  useEffect(() => {
    // Retrieve the list of alerts to display
    getContextConfiguration().then((config) => {
      if (config) {
        setConfiguration(config);
        // Assemble the promises to run them all in parallel
        const promises = [fetchAwarded(), fetchPending(), fetchHistory()];
        // Turn off loading once all promises are settled
        Promise.allSettled(promises).then(() => {
          setLoading(false);
        });
        getRoster().then((roster) => console.log("Roster: ", roster));
        getTsugiUsers().then((users) => console.log("Tsugi Users: ", users));
      }
    });
    // The empty dependency array '[]' means this will run once, when the component renders
  }, []);

  const fetchPending = async () => {
    const awards = await getAllPendingAwards();
    setPendingAwards(awards);
  };

  const fetchAwarded = async () => {
    const awards = await getAllAwards();
    setAllAwards(awards);
  };

  const fetchHistory = async () => {
    const awards = await getAllAwardsHistory();
    setHistoryAwards(awards);
  };

  // Tab management
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    refreshTabs();
    setTabPosition(newValue);
  };

  const refreshTabs = () => {
    setLoading(true);
    if (configuration) {
      Promise.allSettled([fetchAwarded(), fetchPending(), fetchHistory()]).then(
        () => {
          setLoading(false);
        }
      );
    }
  };

  // Dialog management
  const handleOpenReviewDialogFromHistory = (reviewId: string) => {
    setAwardToReview(historyAwards.find((award) => award.id === reviewId));
    setReviewDialogOpen(true);
  };

  const handleOpenReviewDialogFromPending = (reviewId: string) => {
    setAwardToReview(pendingAwards.find((award) => award.id === reviewId));
    setReviewDialogOpen(true);
  };

  const handleCloseReviewDialog = (event?: object, reason?: string) => {
    const reasonsToStayOpen = ["backdropClick", "escapeKeyDown"];
    if (reason && reasonsToStayOpen.includes(reason)) {
      return;
    }
    setReviewDialogOpen(false);
  };

  const handleSaveReviewDialog = async (reviewData: AwardStatusUpdateData) => {
    // Close the dialog
    setReviewDialogOpen(false);
    // Send the update
    await updateAward(reviewData);
    // Refresh the data in the UI
    refreshTabs();
  };

  return (
    <>
      {configuration && (
        <Box>
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
                {tab === "PENDING" && (
                  <>
                    <PendingTable
                      rows={pendingAwards}
                      loading={loading}
                      filters={pendingTableFilters}
                      openReviewDialog={handleOpenReviewDialogFromPending}
                    />
                  </>
                )}
                {tab === "AWARDED" && (
                  <>
                    <LeaderboardTable
                      configuration={configuration}
                      rows={allAwards}
                      loading={loading}
                      filters={awardsTableFilters}
                      sorting={true}
                    />
                  </>
                )}
                {tab === "HISTORY" && (
                  <>
                    <HistoryTable
                      configuration={configuration}
                      rows={historyAwards}
                      loading={loading}
                      filters={historyTableFilters}
                      openReviewDialog={handleOpenReviewDialogFromHistory}
                    />
                  </>
                )}
              </TabPanel>
            );
          })}
          <ReviewDialog
            configuration={configuration}
            handleClose={handleCloseReviewDialog}
            handleSave={handleSaveReviewDialog}
            open={reviewDialogOpen}
            requestRow={awardToReview || null}
          />
        </Box>
      )}
    </>
  );
}

const awardsTableFilters = [
  {
    column: "lastFirst",
    label: "Recipient Name",
    type: "enum",
    sort: compareLastNames,
  },
];

const pendingTableFilters = [
  {
    column: "senderName",
    label: "Sender Name",
    type: "enum",
    sort: compareLastNames,
  },
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
];

const historyTableFilters = [
  {
    column: "senderName",
    label: "Sender Name",
    type: "enum",
    sort: compareLastNames,
  },
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

export default InstructorView;
