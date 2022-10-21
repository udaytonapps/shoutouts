import { WorkspacePremium } from "@mui/icons-material";
import { Box, Card, CardContent, CardHeader, Typography } from "@mui/material";
import { LearnerAward } from "../utils/types";

interface AwardPanelProps {
  award: LearnerAward;
}

/** Show basic AwardPanel info */
export default function AwardPanel(props: AwardPanelProps) {
  const { award } = props;
  return (
    <Card raised={true}>
      <CardHeader
        avatar={<WorkspacePremium fontSize="large" />}
        // action={
        //   <IconButton aria-label="settings">
        //     <MoreHoriz />
        //   </IconButton>
        // }
        title={<Typography fontWeight={"bold"}>{award.label}</Typography>}
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
            <Typography variant="body2" fontStyle={"italic"}>
              {award.comment}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
