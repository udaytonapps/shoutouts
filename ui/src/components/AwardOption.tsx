import { Box, Card, CardContent, styled, Typography } from "@mui/material";
import { AwardType } from "../utils/types";
import AwardImage from "./AwardImage";

interface AwardOptionProps {
  award: AwardType;
}

const CardContentLessPadding = styled(CardContent)(`
  &:last-child {
    padding-bottom: 8px;
  }
`);

/** Show basic header info */
export default function AwardOption(props: AwardOptionProps) {
  const { award } = props;
  return (
    <Card>
      <CardContentLessPadding>
        <Box display={"flex"} flexDirection={"column"} alignItems={"center"}>
          <AwardImage label={award.label} url={award.imageUrl} pixels={125} />
          <Typography pt={1} textAlign={"center"}>
            {award.label}
          </Typography>
        </Box>
      </CardContentLessPadding>
    </Card>
  );
}
