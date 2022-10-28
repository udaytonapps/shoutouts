import { Box, Card, CardContent, styled, Typography } from "@mui/material";
import { AwardType } from "../utils/types";
import AwardImage from "./AwardImage";

interface AwardOptionProps {
  award: AwardType;
  size?: "small" | "large";
  disabled?: boolean;
}

const CardContentLessPadding = styled(CardContent)(`
  &:last-child {
    padding-bottom: 8px;
  }
`);

/** Show basic header info */
export default function AwardOption(props: AwardOptionProps) {
  const { award, size } = props;

  const sizeMap = {
    small: {
      cardWidth: 125,
      boxHeight: 125,
      imageWidth: 75,
    },
    large: {
      cardWidth: 200,
      boxHeight: 176,
      imageWidth: 125,
    },
  };
  const sizes = sizeMap[size || "large"];

  return (
    <Card
      sx={{
        width: sizes.cardWidth,
      }}
    >
      <CardContentLessPadding>
        <Box
          display={"flex"}
          flexDirection={"column"}
          alignItems={"center"}
          height={sizes.boxHeight}
        >
          <AwardImage
            label={award.label}
            url={award.imageUrl}
            pixels={sizes.imageWidth}
          />
          <Box display={"flex"} height={"100%"} alignItems={"center"}>
            <Typography
              variant={size === "small" ? "subtitle2" : "body1"}
              pt={1}
              textAlign={"center"}
            >
              {award.label}
            </Typography>
          </Box>
        </Box>
      </CardContentLessPadding>
    </Card>
  );
}
