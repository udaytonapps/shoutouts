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
    <Card sx={{ width: 200 }}>
      <CardContentLessPadding>
        <Box
          display={"flex"}
          flexDirection={"column"}
          alignItems={"center"}
          height={176}
        >
          <AwardImage label={award.label} url={award.imageUrl} pixels={125} />
          <Box display={"flex"} height={"100%"} alignItems={"center"}>
            <Typography pt={1} textAlign={"center"}>
              {award.label}
            </Typography>
          </Box>
        </Box>
      </CardContentLessPadding>
    </Card>
  );
}
