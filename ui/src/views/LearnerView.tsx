import { Campaign } from "@mui/icons-material";
import { Alert, Box, Button, CircularProgress } from "@mui/material";
import { DateTime } from "luxon";
import { useCallback, useContext, useEffect, useState } from "react";
import BackNavigation from "../components/common/BackNavigation";
import LearnerDashboard from "../components/LearnerDashboard";
import SelectAward from "../components/SelectAward";
import SelectionConfirm from "../components/SelectionConfirm";
import SelectionForm from "../components/SelectionForm";
import SelectRecipient from "../components/SelectRecipient";
import {
  getContextConfiguration,
  getLeaderboard,
  getLearnerAwards,
  getPotentialAwards,
  getRecipients,
  getSentAwards,
  sendAward,
} from "../utils/api-connector";
import { DB_DATE_TIME_FORMAT } from "../utils/common/constants";
import { AppContext } from "../utils/common/context";
import {
  AwardsConfiguration,
  AwardType,
  LeaderboardLeader,
  LearnerAward,
  Recipient,
  SentAward,
} from "../utils/types";

type SendStage = typeof sendStages[number];
const sendStages = [
  "SELECT_RECIPIENT",
  "SELECT_AWARD",
  "ENTER_COMMENT",
  "CONFIRM",
] as const;

function LearnerView() {
  const appConfig = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [configuration, setConfiguration] = useState<AwardsConfiguration>();
  const [learnerAwards, setLearnerAwards] = useState<LearnerAward[]>([]);
  const [sentAwards, setSentAwards] = useState<SentAward[]>([]);
  const [leaders, setLeaders] = useState<LeaderboardLeader[]>([]);
  const [potentialAwards, setPotentialAwards] = useState<AwardType[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient>();
  const [selectedAward, setSelectedAward] = useState<AwardType>();
  const [comment, setComment] = useState<string>("");
  const [stage, setStage] = useState<SendStage>();

  const getTabPromises = useCallback((config: AwardsConfiguration) => {
    const promises = [fetchLearnerAwards(), fetchSentAwards()];
    if (config.leaderboard_enabled) {
      promises.push(fetchLeaderboard());
    }
    return promises;
  }, []);

  useEffect(() => {
    // Retrieve the list of alerts to display
    getContextConfiguration().then((config) => {
      if (config) {
        setConfiguration(config);
        // Assemble the promises to run them all in parallel
        const promises = [
          ...getTabPromises(config),
          fetchRecipients(),
          fetchPotentialAwards(),
        ];
        // Turn off loading once all promises are settled
        return Promise.allSettled(promises).then(() => {
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });
    // The empty dependency array '[]' means this will run once, when the component renders
  }, [getTabPromises]);

  useEffect(() => {
    if (selectedRecipient) {
      // Someone was chosen, move to next step
      setStage("SELECT_AWARD");
    }
  }, [selectedRecipient]);

  useEffect(() => {
    if (selectedAward) {
      // Someone was chosen, move to next step
      setStage("ENTER_COMMENT");
    }
  }, [selectedAward]);

  const fetchLearnerAwards = async () => {
    const awards = await getLearnerAwards();
    setLearnerAwards(awards);
  };

  const fetchSentAwards = async () => {
    const awards = await getSentAwards();
    setSentAwards(awards);
  };

  const fetchLeaderboard = async () => {
    const leaders = await getLeaderboard();
    leaders.forEach((leader) => {
      leader.awards.sort((a, b) => {
        return a.label.localeCompare(b.label);
      });
    });
    setLeaders(leaders);
  };

  const fetchPotentialAwards = async () => {
    const awards = await getPotentialAwards();
    setPotentialAwards(awards);
  };

  const fetchRecipients = async () => {
    const recipients = await getRecipients();
    setRecipients(recipients);
  };

  const handleClickSend = () => {
    setStage("SELECT_RECIPIENT");
  };

  const submitAward = async () => {
    if (selectedRecipient && selectedAward) {
      setLoading(true);
      await sendAward(selectedRecipient.recipientId, selectedAward.id, comment);
      setLoading(false);
      setStage("CONFIRM");
    }
  };

  const refreshTabs = () => {
    setLoading(true);
    if (configuration) {
      Promise.allSettled([getTabPromises(configuration)]).then(() => {
        setLoading(false);
      });
    }
  };

  const renderStage = () => {
    if (configuration) {
      switch (stage) {
        // Default View
        case undefined:
          return (
            <Box>
              <Box display={"flex"} justifyContent={"center"}>
                <Button
                  endIcon={<Campaign />}
                  size="large"
                  variant="contained"
                  onClick={handleClickSend}
                >
                  Send Shoutout!
                </Button>
              </Box>
              <LearnerDashboard
                refreshTabs={refreshTabs}
                configuration={configuration}
                learnerAwards={learnerAwards}
                sentAwards={sentAwards}
                leaders={leaders}
                loading={loading}
              />
            </Box>
          );
        case "SELECT_RECIPIENT":
          return (
            <Box>
              <BackNavigation
                goBackCallback={() => {
                  setStage(undefined);
                  setSelectedRecipient(undefined);
                }}
              />
              <SelectRecipient
                recipients={recipients}
                setSelectedRecipient={setSelectedRecipient}
              />
            </Box>
          );
        case "SELECT_AWARD":
          if (selectedRecipient) {
            return (
              <Box>
                <BackNavigation
                  goBackCallback={() => {
                    setStage("SELECT_RECIPIENT");
                    setSelectedRecipient(undefined);
                    setSelectedAward(undefined);
                  }}
                />
                <SelectAward
                  awards={potentialAwards}
                  recipient={selectedRecipient}
                  setSelectedAward={setSelectedAward}
                />
              </Box>
            );
          } else {
            setStage("SELECT_RECIPIENT");
            return <></>;
          }
        case "ENTER_COMMENT":
          if (selectedRecipient && selectedAward) {
            return (
              <Box>
                <BackNavigation
                  goBackCallback={() => {
                    setStage("SELECT_AWARD");
                    setComment("");
                    setSelectedAward(undefined);
                  }}
                />
                <SelectionForm
                  loading={loading}
                  selectedAward={selectedAward}
                  recipient={selectedRecipient}
                  setComment={setComment}
                  submitAward={submitAward}
                  configuration={configuration}
                />
              </Box>
            );
          } else {
            setStage("SELECT_AWARD");
            return <></>;
          }
        case "CONFIRM":
          if (selectedAward && selectedRecipient) {
            const sentAward: LearnerAward = {
              id: "",
              createdAt: DateTime.now().toFormat(DB_DATE_TIME_FORMAT),
              senderName: appConfig.username,
              comment,
              label: selectedAward.label,
              description: selectedAward.description,
              imageUrl: selectedAward.imageUrl,
            };
            return (
              <Box>
                <SelectionConfirm
                  configuration={configuration}
                  recipient={selectedRecipient}
                  sentAward={sentAward}
                />
                <Box display={"flex"} justifyContent={"center"} pt={3}>
                  <Button
                    variant={"contained"}
                    onClick={() => {
                      // Clear out all state
                      setStage(undefined);
                      setSelectedAward(undefined);
                      setSelectedRecipient(undefined);
                      setComment("");
                      setLoading(true);
                      refreshTabs();
                    }}
                  >
                    Dismiss
                  </Button>
                </Box>
              </Box>
            );
          } else {
            setStage("ENTER_COMMENT");
            return <></>;
          }
      }
    } else {
      if (loading) {
        return (
          <Box mt={2} display={"flex"} justifyContent={"center"}>
            <CircularProgress size={"large"} />
          </Box>
        );
      } else {
        return (
          <Box mt={2}>
            <Alert severity="info">
              Your instructor has not yet configured this learning app.
            </Alert>
          </Box>
        );
      }
    }
  };

  return renderStage();
}

export default LearnerView;
