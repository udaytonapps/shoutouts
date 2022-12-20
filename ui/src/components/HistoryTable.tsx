import {
  Box,
  Button,
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
  useTheme,
} from "@mui/material";
import { useEffect, useState } from "react";
import {
  formatDbDate,
  getComparator,
  getStatusColors,
  stableSort,
} from "../utils/common/helpers";
import { SortOrder } from "../utils/common/types";
import { AwardsConfiguration, HistoryTableRow } from "../utils/types";
import AwardImage from "./AwardImage";
import Filter from "./common/Filter";
import StatusName from "./common/StatusName";
import TableHeaderSort from "./common/TableHeaderSort";

interface HistoryTableProps {
  configuration: AwardsConfiguration;
  rows: HistoryTableRow[];
  loading: boolean;
  filters: any[];
  openReviewDialog: (requestId: string) => void;
  hideSender?: boolean;
}

/** Shows the history of requests of all available students */
function HistoryTable(props: HistoryTableProps) {
  const {
    configuration,
    rows,
    loading,
    filters,
    openReviewDialog,
    hideSender,
  } = props;
  const [filteredRows, setFilteredRows] = useState(rows);
  const statusColors = getStatusColors(useTheme());
  const [orderBy, setOrderBy] = useState<keyof HistoryTableRow>("updatedAt");
  const [order, setOrder] = useState<SortOrder>(
    orderBy === "updatedAt" ? "desc" : "asc"
  );

  useEffect(() => {
    setFilteredRows(rows);
  }, [rows]);

  /** The filteredRows are automatically sorted each render */
  const sortedFilteredRows = stableSort(
    filteredRows,
    getComparator(order, orderBy)
  );

  return (
    <Box>
      <Box mb={1}>
        <Filter
          buttonLabel="Filters"
          rows={rows}
          filters={filters}
          filterRows={setFilteredRows}
        />
      </Box>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>
                <TableHeaderSort
                  column={"updatedAt"}
                  columnLabel={"Last Action"}
                  {...{ order, orderBy, setOrder, setOrderBy }}
                ></TableHeaderSort>
              </TableCell>
              {!hideSender && (
                <TableCell>
                  <TableHeaderSort
                    column={"senderName"}
                    columnLabel={"Sender Name"}
                    {...{ order, orderBy, setOrder, setOrderBy }}
                  ></TableHeaderSort>
                </TableCell>
              )}
              <TableCell>
                <TableHeaderSort
                  column={"recipientName"}
                  columnLabel={"Recipient Name"}
                  {...{ order, orderBy, setOrder, setOrderBy }}
                ></TableHeaderSort>
              </TableCell>
              <TableCell>
                <TableHeaderSort
                  column={"label"}
                  columnLabel={"Shoutout"}
                  {...{ order, orderBy, setOrder, setOrderBy }}
                ></TableHeaderSort>
              </TableCell>
              {configuration.moderation_enabled && (
                <TableCell>
                  <TableHeaderSort
                    column={"status"}
                    columnLabel={"Status"}
                    {...{ order, orderBy, setOrder, setOrderBy }}
                  ></TableHeaderSort>
                </TableCell>
              )}
              <TableCell align="center">Action</TableCell>
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
                  key={`${index}-${row.id}`}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell
                    sx={{
                      borderLeft: `5px solid ${
                        statusColors[row.status]
                      } !important`,
                    }}
                  >
                    {formatDbDate(row.updatedAt)}
                  </TableCell>
                  {!hideSender && (
                    <TableCell component="th" scope="row">
                      {row.senderName}
                    </TableCell>
                  )}
                  <TableCell component="th" scope="row">
                    {row.recipientName}
                  </TableCell>
                  <TableCell>
                    <Tooltip title={row.label}>
                      <Box display={"flex"} alignItems={"center"}>
                        <AwardImage
                          label={row.label}
                          url={row.imageUrl}
                          pixels={50}
                        />
                      </Box>
                    </Tooltip>
                  </TableCell>
                  {configuration.moderation_enabled && (
                    <TableCell>
                      <StatusName status={row.status} />
                    </TableCell>
                  )}
                  <TableCell align="center">
                    <Button
                      variant="contained"
                      onClick={() => openReviewDialog(row.id)}
                    >
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default HistoryTable;
