import { NotificationImportant, Settings } from "@mui/icons-material";
import {
  Alert,
  Badge,
  Box,
  Button,
  IconButton,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import TabPanel from "../components/common/TabPanel";
import HistoryTable from "../components/HistoryTable";
import LeaderboardTable from "../components/LeaderboardTable";
import PendingTable from "../components/PendingTable";
import ReviewDialog from "../components/ReviewDialog";
import SettingsDialog from "../components/SettingsDialog";
import {
  addSettings,
  getAllAwards,
  getAllAwardsHistory,
  getAllAwardTypes,
  getAllPendingAwards,
  getInstructorConfiguration,
  getPotentialAwards,
  updateAward,
  updateSettings,
} from "../utils/api-connector";
import { a11yProps, compareLastNames } from "../utils/common/helpers";
import {
  AllAwardsTableRecord,
  AwardsConfiguration,
  AwardStatusUpdateData,
  AwardType,
  HistoryTableRow,
  PendingTableRow,
  RequestStatus,
} from "../utils/types";

function InstructorView() {
  const [loading, setLoading] = useState(true);
  const [configuration, setConfiguration] =
    useState<AwardsConfiguration | null>();
  const [tabPosition, setTabPosition] = useState(0);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [activeAwardTypes, setActiveAwardTypes] = useState<AwardType[]>([]);
  const [allAwardTypes, setAllAwardTypes] = useState<AwardType[]>([]);
  const [allAwards, setAllAwards] = useState<AllAwardsTableRecord[]>([]);
  const [pendingAwards, setPendingAwards] = useState<PendingTableRow[]>([]);
  const [historyAwards, setHistoryAwards] = useState<HistoryTableRow[]>([]);
  const [awardToReview, setAwardToReview] = useState<
    HistoryTableRow | PendingTableRow
  >();

  const tabs = ["AWARDED", "HISTORY"];
  // Even if moderation is turned off, will show if un-approved items will remain
  if (configuration?.moderation_enabled || pendingAwards.length > 0) {
    tabs.unshift("PENDING");
  }

  useEffect(() => {
    // Retrieve the list of alerts to display
    getInstructorConfiguration().then((config) => {
      setConfiguration(config);
      // Must retrieve limited list after
      fetchAllAwardTypes().then(() => {
        fetchPotentialAwards();
      });
      if (config) {
        // Assemble the promises to run them all in parallel
        const promises = [fetchAwarded(), fetchPending(), fetchHistory()];
        // Turn off loading once all promises are settled
        Promise.allSettled(promises).then(() => {
          setLoading(false);
        });
        // getRoster().then((roster) => console.log("Roster: ", roster));
        // getTsugiUsers().then((users) => console.log("Tsugi Users: ", users));
      }
    });
    // The empty dependency array '[]' means this will run once, when the component renders
  }, []);

  useEffect(() => {
    // If undefined, setting data may still be loading, but if null, response was received and config doesn't exist, so open the dialog
    if (configuration === null) {
      setSettingsDialogOpen(true);
    }
  }, [configuration]);

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

  const fetchPotentialAwards = async () => {
    const types = await getPotentialAwards();
    setActiveAwardTypes(types);
  };

  const fetchAllAwardTypes = async () => {
    const types = await getAllAwardTypes();
    setAllAwardTypes(types);
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

  // Dialog management
  const handleOpenSettingsDialog = () => {
    setSettingsDialogOpen(true);
  };

  const handleCloseSettingsDialog = (event?: object, reason?: string) => {
    const reasonsToStayOpen = ["backdropClick", "escapeKeyDown"];
    if (reason && reasonsToStayOpen.includes(reason)) {
      return;
    }
    setSettingsDialogOpen(false);
  };

  const handleSaveSettingsDialog = async (
    newSettings: AwardsConfiguration,
    exclusionIds: string[]
  ) => {
    // Need to take the new data, send the update, and fetch the new settings
    console.log(newSettings);
    console.log(exclusionIds); // Delete all and add each time, not updating
    if (newSettings.configuration_id) {
      await updateSettings(newSettings, exclusionIds);
    } else {
      await addSettings(newSettings, exclusionIds);
    }
    // Close the dialog
    setSettingsDialogOpen(false);
    // Fetch the new/updated settings to refresh the UI
    const retrievedConfig = await getInstructorConfiguration();
    if (retrievedConfig) {
      setConfiguration(retrievedConfig);
      const promises = [
        fetchAwarded(),
        fetchPending(),
        fetchHistory(),
        fetchPotentialAwards(),
      ];
      // Turn off loading once all promises are settled
      Promise.allSettled(promises).then(() => {
        setLoading(false);
      });
    }
  };

  return (
    <>
      {configuration && (
        <Box>
          {!configuration.moderation_enabled && pendingAwards.length > 0 && (
            <Box mt={2} mb={2}>
              <Alert severity="warning">
                It appears you toggled moderation off but have pending requests
                that were submitted while moderation was active. The 'Pending'
                tab will remain until moderation action is taken on any
                remaining items.
              </Alert>
            </Box>
          )}
          <Box display={"flex"} justifyContent={"end"} mr={1}>
            <Box>
              <Tooltip
                title={
                  pendingAwards.length
                    ? "There are pending requests requiring review"
                    : ""
                }
              >
                <IconButton onClick={() => setTabPosition(0)}>
                  <Badge badgeContent={pendingAwards.length} color="warning">
                    <NotificationImportant />
                  </Badge>
                </IconButton>
              </Tooltip>
              <Tooltip title="Review or update 'Shoutouts!' settings">
                <IconButton onClick={handleOpenSettingsDialog}>
                  <Settings />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
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
      {/* DIALOGS */}
      <SettingsDialog
        handleClose={handleCloseSettingsDialog}
        handleSave={handleSaveSettingsDialog}
        open={settingsDialogOpen}
        settings={configuration || null}
        potentialTypes={activeAwardTypes}
        allTypes={allAwardTypes}
      />
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
