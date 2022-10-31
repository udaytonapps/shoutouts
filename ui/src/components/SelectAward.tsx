import { Box, ButtonBase, Typography } from "@mui/material";
import { Dispatch, SetStateAction } from "react";
import { AwardType, Recipient } from "../utils/types";
import AwardOption from "./AwardOption";

interface SelectAwardProps {
  awards: AwardType[];
  recipient: Recipient;
  setSelectedAward: Dispatch<SetStateAction<AwardType | undefined>>;
}

/** Show basic header info */
export default function SelectAward(props: SelectAwardProps) {
  const { awards, recipient, setSelectedAward } = props;
  return (
    <Box pt={4} display={"flex"} flexDirection={"column"} alignItems={"center"}>
      <Typography variant="h5">
        Please Select a Badge for {recipient.givenName}
      </Typography>
      <Box
        pt={4}
        display={"flex"}
        justifyContent={"center"}
        gap={1}
        flexWrap={"wrap"}
      >
        {awards.map((award, i) => (
          <Box key={`recipient-${i}`} p={0.1} display={"flex"}>
            <ButtonBase onClick={() => setSelectedAward(award)}>
              <AwardOption award={award} />
            </ButtonBase>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
