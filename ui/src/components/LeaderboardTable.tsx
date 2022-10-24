import {
  Badge,
  Box,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  AwardsConfiguration,
  LeaderboardLeader,
  LearnerAward,
} from "../utils/types";
import AwardImage from "./AwardImage";

interface LeaderboardTableProps {
  configuration: AwardsConfiguration;
  rows: LeaderboardLeader[];
  loading: boolean;
}

/** Shows the history of requests of all available students */
function LeaderboardTable(props: LeaderboardTableProps) {
  const { rows, loading } = props;

  const assembleConsolidatedAwardData = (awards: LearnerAward[]) => {
    const consolidatedAwardData: {
      [key: string]: { count: number; label: string; imageUrl: string };
    } = {};
    awards.forEach((award) => {
      if (!consolidatedAwardData[award.label]) {
        consolidatedAwardData[award.label] = {
          count: 0,
          label: award.label,
          imageUrl: award.imageUrl,
        };
      }
      consolidatedAwardData[award.label].count++;
    });
    return Object.values(consolidatedAwardData);
  };

  return (
    <Box>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Recipient Name</TableCell>
              <TableCell>Award(s)</TableCell>
              <TableCell align="center">Total Received</TableCell>
            </TableRow>
            {loading && (
              <TableRow>
                <TableCell colSpan={5} padding={"none"}>
                  <LinearProgress />
                </TableCell>
              </TableRow>
            )}
          </TableHead>
          <TableBody>
            {!rows.length ? (
              <TableRow>
                <TableCell colSpan={5} sx={{ textAlign: "center" }}>
                  <Typography>No results</Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, index) => (
                <TableRow
                  key={`${index}-${row.userId}`}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {row.givenName} {row.familyName}
                  </TableCell>
                  <TableCell>
                    <Box display={"flex"} flexWrap={"wrap"}>
                      {assembleConsolidatedAwardData(row.awards).map(
                        (awardData, i) => (
                          <Box key={`award-${awardData.label}-${i}`}>
                            <Tooltip
                              title={
                                awardData.count > 1
                                  ? `${awardData.label} x ${awardData.count}`
                                  : awardData.label
                              }
                            >
                              <Box>
                                <Badge
                                  badgeContent={
                                    awardData.count > 1 ? awardData.count : null
                                  }
                                  color="primary"
                                >
                                  <AwardImage
                                    label={awardData.label}
                                    url={awardData.imageUrl}
                                    pixels={50}
                                  />
                                </Badge>
                              </Box>
                            </Tooltip>
                          </Box>
                        )
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="center">{row.awards.length}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default LeaderboardTable;
