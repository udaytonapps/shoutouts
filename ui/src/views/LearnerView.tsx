import { WorkspacePremium } from "@mui/icons-material";
import { Alert, Box, Button, CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    // Retrieve the list of alerts to display
    fetchConfiguration().then(() => {
      Promise.allSettled([
        fetchLearnerAwards(),
        fetchSentAwards(),
        // fetchLeaderboard(),
        fetchRecipients(),
        fetchPotentialAwards(),
      ]).then(() => {
        setLoading(false);
      });
    });

    // The empty dependency array '[]' means this will run once, when the component renders
  }, []);

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

  const fetchConfiguration = async () => {
    const config = await getContextConfiguration();
    if (config) {
      setConfiguration(config);
    }
  };

  const fetchLearnerAwards = async () => {
    const awards = await getLearnerAwards();
    setLearnerAwards(awards);
  };

  const fetchSentAwards = async () => {
    const awards = await getSentAwards();
    setSentAwards(awards);
  };

  const fetchLeaderboard = async () => {
    if (configuration?.leaderboard_enabled) {
      const leaders = await getLeaderboard();
      leaders.forEach((leader) => {
        leader.awards.sort((a, b) => {
          return a.label.localeCompare(b.label);
        });
      });
      setLeaders(leaders);
    }
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

  const submitAward = () => {
    if (selectedRecipient && selectedAward) {
      sendAward(selectedRecipient.userId, selectedAward.id, comment).then(
        () => {
          setStage("CONFIRM");
        }
      );
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
                  endIcon={<WorkspacePremium />}
                  size="large"
                  variant="contained"
                  onClick={handleClickSend}
                >
                  Send Kudos
                </Button>
              </Box>
              <LearnerDashboard
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
                  selectedAward={selectedAward}
                  recipient={selectedRecipient}
                  setComment={setComment}
                  submitAward={submitAward}
                  configuration={
                    { comments_required: true } as AwardsConfiguration
                  }
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
              createdAt: "",
              comment,
              label: selectedAward.label,
              description: selectedAward.description,
              imageUrl: selectedAward.imageUrl,
            };
            return (
              <Box>
                <SelectionConfirm
                  configuration={
                    {
                      moderation_enabled: true,
                      anonymous_enabled: false,
                      recipient_view_enabled: true,
                    } as AwardsConfiguration
                  }
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
                      Promise.allSettled([
                        fetchLearnerAwards(),
                        fetchSentAwards(),
                        // fetchLeaderboard(),
                      ]).then(() => {
                        setLoading(false);
                      });
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
