import { Box, Button, Typography } from "@mui/material";
import { AwardsConfiguration, LearnerAward, Recipient } from "../utils/types";
import AwardPanel from "./AwardPanel";

interface SelectionConfirmProps {
  configuration: AwardsConfiguration;
  recipient: Recipient;
  sentAward: LearnerAward;
}

/** Show basic header info */
export default function SelectionConfirm(props: SelectionConfirmProps) {
  const { configuration, sentAward, recipient } = props;

  let message;
  if (configuration.moderation_enabled) {
    // Not anonymous, but moderated
    message = `Your award has been submitted, and will be available for 
    ${recipient.givenName} once approved by your Instructor.`;
  } else {
    message = "Your award has been sent!";
  }

  return (
    <Box pt={4} display={"flex"} flexDirection={"column"} alignItems={"center"}>
      <Typography variant="h5">Award sent!</Typography>
      <Box
        pt={4}
        display={"flex"}
        justifyContent={"center"}
        gap={1}
        flexWrap={"wrap"}
        sx={{ maxWidth: 600, width: "100%" }}
        flexDirection={"column"}
      >
        <AwardPanel award={sentAward} />
        <Box pt={4} display={"flex"} justifyContent={"center"}>
          <Typography sx={{ maxWidth: 300 }}>{message}</Typography>
        </Box>
      </Box>
    </Box>
  );
}
