import { WorkspacePremium } from "@mui/icons-material";
import { Box, Button, Slide } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import BackNavigation from "../components/common/BackNavigation";
import LearnerDashboard from "../components/LearnerDashboard";
import SelectAward from "../components/SelectAward";
import SelectionConfirm from "../components/SelectionConfirm";
import SelectionForm from "../components/SelectionForm";
import SelectRecipient from "../components/SelectRecipient";
import {
  getLearnerAwards,
  getPotentialAwards,
  getRecipients,
  sendAward,
} from "../utils/api-connector";
import { SnackbarContext } from "../utils/common/context";
import {
  AwardsConfiguration,
  AwardType,
  LearnerAward,
  Recipient,
} from "../utils/types";

type SendStage = typeof sendStages[number];
const sendStages = [
  "SELECT_RECIPIENT",
  "SELECT_AWARD",
  "ENTER_COMMENT",
  "CONFIRM",
] as const;

function LearnerView() {
  const [loading, setLoading] = useState(false);
  const [learnerAwards, setLearnerAwards] = useState<LearnerAward[]>([]);
  const [potentialAwards, setPotentialAwards] = useState<AwardType[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient>();
  const [selectedAward, setSelectedAward] = useState<AwardType>();
  const [comment, setComment] = useState<string>("");
  const snackbar = useContext(SnackbarContext);

  const [stage, setStage] = useState<SendStage>();

  useEffect(() => {
    // Retrieve the list of alerts to display
    fetchLearnerAwards();
    fetchRecipients();
    fetchPotentialAwards();
    // The empty dependency array '[]' means this will run once, when the component renders
  }, []);

  useEffect(() => {
    console.log(selectedRecipient);
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
    setLoading(true);
    const awards = await getLearnerAwards();
    setLearnerAwards(awards);
    setLoading(false);
  };

  const fetchPotentialAwards = async () => {
    setLoading(true);
    const awards = await getPotentialAwards();
    setPotentialAwards(awards);
    setLoading(false);
  };

  const fetchRecipients = async () => {
    setLoading(true);
    const recipients = await getRecipients();
    setRecipients(recipients);
    setLoading(false);
  };

  const handleClickSend = () => {
    setStage("SELECT_RECIPIENT");
  };

  const submitAward = () => {
    if (selectedRecipient && selectedAward) {
      sendAward(selectedRecipient.userId, selectedAward.id, comment).then(
        () => {
          snackbar.set({ message: "Award sent!", type: "success" });
          // Clear out values
          setStage(undefined);
          setSelectedAward(undefined);
          setSelectedRecipient(undefined);
          setComment("");
        }
      );
    }
  };

  const renderStage = () => {
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
            <LearnerDashboard learnerAwards={learnerAwards} />
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
        return (
          <Box>
            <SelectionConfirm />
          </Box>
        );
    }
  };

  return <>{renderStage()}</>;
}

export default LearnerView;
