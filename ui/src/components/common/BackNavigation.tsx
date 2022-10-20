import { ArrowBack } from "@mui/icons-material";
import { Box, IconButton } from "@mui/material";

interface BackNavigationprops {
  goBackCallback: any;
}

/** Holds navigation for linking to the LTI return url */
function BackNavigation(props: BackNavigationprops) {
  const { goBackCallback } = props;
  return (
    <Box p={1}>
      <IconButton onClick={() => goBackCallback()}>
        <ArrowBack />
      </IconButton>
    </Box>
  );
}

export default BackNavigation;
