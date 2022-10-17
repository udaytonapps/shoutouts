import { WorkspacePremium } from "@mui/icons-material";
import { Box, Button } from "@mui/material";
import { useEffect, useState } from "react";
import LearnerDashboard from "../components/LearnerDashboard";
import { getLearnerAwards } from "../utils/api-connector";
import { LearnerAward } from "../utils/types";

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

  const [stage, setStage] = useState<SendStage>();

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
    setStage("SELECT_RECIPIENT");
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
      <LearnerDashboard learnerAwards={learnerAwards} />
    </>
  );
}

export default LearnerView;
