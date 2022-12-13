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
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../utils/common/context";
import {
  assembleConsolidatedAwardData,
  getComparator,
  stableSort,
} from "../utils/common/helpers";
import { SortOrder } from "../utils/common/types";
import { AwardsConfiguration, LeaderboardLeader } from "../utils/types";
import AwardImage from "./AwardImage";
import Filter from "./common/Filter";
import TableHeaderSort from "./common/TableHeaderSort";

interface LeaderboardTableProps {
  configuration: AwardsConfiguration;
  rows: LeaderboardLeader[];
  loading: boolean;
  filters?: any[];
  sorting?: boolean;
  isAwardedView?: boolean;
}

/** Shows the history of requests of all available students */
function LeaderboardTable(props: LeaderboardTableProps) {
  const appInfo = useContext(AppContext);
  const { configuration, rows, loading, filters, sorting, isAwardedView } =
    props;

  useEffect(() => {
    rows.forEach((row) => {
      row.sentValue = row.sentCount * configuration.awarded_value;
      row.receivedValue = row.receivedCount * configuration.received_value;
    });
  }, [configuration, rows]);

  const [filteredRows, setFilteredRows] = useState(rows);
  // const [orderBy, setOrderBy] = useState<keyof LeaderboardLeader>("count");
  const [orderBy, setOrderBy] = useState<keyof LeaderboardLeader>(
    sorting ? "lastFirst" : "receivedCount"
  );

  // const [order, setOrder] = useState<SortOrder>("desc");
  const [order, setOrder] = useState<SortOrder>(
    orderBy === "receivedCount" ? "desc" : "asc"
  );

  /** The filteredRows are automatically sorted each render */
  const sortedFilteredRows = stableSort(
    filteredRows,
    getComparator(order, orderBy)
  );

  // https://stackoverflow.com/questions/13627308/add-st-nd-rd-and-th-ordinal-suffix-to-a-number
  function nth(n: number) {
    return ["st", "nd", "rd"][((((n + 90) % 100) - 10) % 10) - 1] || "th";
  }

  return (
    <Box>
      {filters && (
        <Box mb={1}>
          <Filter
            buttonLabel="Filters"
            rows={rows}
            filters={filters}
            filterRows={setFilteredRows}
          />
        </Box>
      )}
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>
                {sorting ? (
                  <TableHeaderSort
                    column={"lastFirst"}
                    columnLabel={"Recipient Name"}
                    {...{ order, orderBy, setOrder, setOrderBy }}
                  ></TableHeaderSort>
                ) : (
                  <>
                    {configuration.anonymous_enabled
                      ? "Anonymous Ranking"
                      : "Recipient Name"}
                  </>
                )}
              </TableCell>
              <TableCell>Shoutout(s)</TableCell>
              <TableCell align="center">
                {sorting ? (
                  <TableHeaderSort
                    column={"receivedCount"}
                    columnLabel={"Total Received"}
                    {...{ order, orderBy, setOrder, setOrderBy }}
                  ></TableHeaderSort>
                ) : (
                  <>Total Received</>
                )}
              </TableCell>

              {isAwardedView && configuration.received_value > 0 && (
                <TableCell align="center">
                  {sorting ? (
                    <TableHeaderSort
                      column={"receivedValue"}
                      columnLabel={"Received Value"}
                      {...{ order, orderBy, setOrder, setOrderBy }}
                    ></TableHeaderSort>
                  ) : (
                    <>Received Value</>
                  )}
                </TableCell>
              )}
              {isAwardedView && (
                <TableCell align="center">
                  {sorting ? (
                    <TableHeaderSort
                      column={"sentCount"}
                      columnLabel={"Total Sent"}
                      {...{ order, orderBy, setOrder, setOrderBy }}
                    ></TableHeaderSort>
                  ) : (
                    <>Total Sent</>
                  )}
                </TableCell>
              )}
              {isAwardedView && configuration.awarded_value > 0 && (
                <TableCell align="center">
                  {sorting ? (
                    <TableHeaderSort
                      column={"sentValue"}
                      columnLabel={"Sent Value"}
                      {...{ order, orderBy, setOrder, setOrderBy }}
                    ></TableHeaderSort>
                  ) : (
                    <>Sent Value</>
                  )}
                </TableCell>
              )}
            </TableRow>
            {loading && (
              <TableRow>
                <TableCell colSpan={6} padding={"none"}>
                  <LinearProgress />
                </TableCell>
              </TableRow>
            )}
          </TableHead>
          <TableBody>
            {!sortedFilteredRows.length ? (
              <TableRow>
                <TableCell colSpan={6} sx={{ textAlign: "center" }}>
                  <Typography>No results</Typography>
                </TableCell>
              </TableRow>
            ) : (
              sortedFilteredRows.map((row, index) => (
                <TableRow
                  key={`${index}-${row.userId}`}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {!isAwardedView && configuration.anonymous_enabled
                      ? `${index + 1}${nth(index + 1)} Place`
                      : `${row.familyName}, ${row.givenName}`}
                  </TableCell>
                  <TableCell>
                    <Box display={"flex"} flexWrap={"wrap"}>
                      {row.awards.length
                        ? assembleConsolidatedAwardData(row.awards).map(
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
                                        awardData.count > 1
                                          ? awardData.count
                                          : null
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
                          )
                        : ""}
                    </Box>
                  </TableCell>
                  <TableCell align="center">{row.receivedCount}</TableCell>
                  {isAwardedView && configuration.received_value > 0 && (
                    <TableCell align="center">{row.receivedValue}</TableCell>
                  )}
                  {isAwardedView && (
                    <TableCell align="center">{row.sentCount}</TableCell>
                  )}
                  {isAwardedView && configuration.awarded_value > 0 && (
                    <TableCell align="center">{row.sentValue}</TableCell>
                  )}
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
