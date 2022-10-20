import {
  Avatar,
  Box,
  ButtonBase,
  Card,
  CardContent,
  Typography,
} from "@mui/material";
import { Dispatch, SetStateAction } from "react";
import { Recipient } from "../utils/types";

interface SelectRecipientProps {
  recipients: Recipient[];
  setSelectedRecipient: Dispatch<SetStateAction<Recipient | undefined>>;
}

/** Show basic header info */
export default function SelectRecipient(props: SelectRecipientProps) {
  const { recipients, setSelectedRecipient } = props;

  return (
    <Box pt={4} display={"flex"} flexDirection={"column"} alignItems={"center"}>
      <Typography variant="h5">Please Select a Recipient</Typography>
      <Box pt={4} width={"fit-content"}>
        {recipients.map((recipient, i) => (
          <Box key={`recipient-${i}`} p={0.1}>
            <Card>
              <ButtonBase
                onClick={() => setSelectedRecipient(recipient)}
                sx={{ width: "100%" }}
              >
                <CardContent sx={{ width: "100%", p: 1.25 }}>
                  <Box display={"flex"} alignItems={"center"} pl={2} pr={2}>
                    <Avatar></Avatar>
                    <Typography textAlign={"left"} ml={2}>
                      {recipient.familyName}, {recipient.givenName}
                    </Typography>
                  </Box>
                </CardContent>
              </ButtonBase>
            </Card>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
