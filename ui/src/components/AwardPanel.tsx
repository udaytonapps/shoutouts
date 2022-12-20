import { Campaign } from "@mui/icons-material";
import { Box, Card, CardContent, CardHeader, Typography } from "@mui/material";
import { formatDbDate } from "../utils/common/helpers";
import { AwardsConfiguration, LearnerAward } from "../utils/types";

interface AwardPanelProps {
  award: LearnerAward;
}

/** Show basic AwardPanel info */
export default function AwardPanel(props: AwardPanelProps) {
  const { award } = props;

  return (
    <Card raised={true}>
      <CardHeader
        avatar={<Campaign fontSize="large" />}
        title={
          <Box display={"flex"} justifyContent={"space-between"}>
            <Typography fontWeight={"bold"}>{award.label}</Typography>
            <Typography variant="caption">
              {formatDbDate(award.createdAt)}
            </Typography>
          </Box>
        }
      />
      <CardContent>
        <Box display={"flex"}>
          <Box display={"flex"}>
            <img
              width={125}
              height={125}
              style={{ objectFit: "cover" }}
              src={process.env.PUBLIC_URL + award.imageUrl}
              alt={award.label}
            />
          </Box>
          <Box
            pl={5}
            display={"flex"}
            flexDirection={"column"}
            justifyContent={"space-around"}
          >
            <Typography>{award.description}</Typography>
            <Box>
              {/* If set as anonymous, these fields won't come to the UI */}
              {award.comment && (
                <Typography variant="body2" fontStyle={"italic"}>
                  {award.comment}
                </Typography>
              )}
              {award.senderName && (
                <Typography variant="caption">- {award.senderName}</Typography>
              )}
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
