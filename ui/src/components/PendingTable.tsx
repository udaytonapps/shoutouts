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
} from "@mui/material";
import { useEffect, useState } from "react";
import {
  formatDbDate,
  getComparator,
  stableSort,
} from "../utils/common/helpers";
import { SortOrder } from "../utils/common/types";
import { PendingTableRow } from "../utils/types";
import AwardImage from "./AwardImage";
import Filter from "./common/Filter";
import TableHeaderSort from "./common/TableHeaderSort";

interface PendingTableProps {
  rows: PendingTableRow[];
  loading: boolean;
  filters: any;
  openReviewDialog: (requestId: string) => void;
}

/** Shows the requests of all available students */
function PendingTable(props: PendingTableProps) {
  const { rows, loading, filters, openReviewDialog } = props;
  const [filteredRows, setFilteredRows] = useState(rows);
  const [orderBy, setOrderBy] = useState<keyof PendingTableRow>("createdAt");
  const [order, setOrder] = useState<SortOrder>(
    // orderBy === "created_at" ? "desc" : "asc"
    "asc"
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
                  column={"createdAt"}
                  columnLabel={"Request Date"}
                  {...{ order, orderBy, setOrder, setOrderBy }}
                ></TableHeaderSort>
              </TableCell>
              <TableCell>
                <TableHeaderSort
                  column={"senderName"}
                  columnLabel={"Sender Name"}
                  {...{ order, orderBy, setOrder, setOrderBy }}
                ></TableHeaderSort>
              </TableCell>
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
                  columnLabel={"Award Type"}
                  {...{ order, orderBy, setOrder, setOrderBy }}
                ></TableHeaderSort>
              </TableCell>
              <TableCell>Sender Comment</TableCell>
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
                <TableCell colSpan={5} sx={{ textAlign: "center" }}>
                  <Typography>No results</Typography>
                </TableCell>
              </TableRow>
            ) : (
              sortedFilteredRows.map((row, index) => (
                <TableRow
                  key={`${index}-${row.id}`}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell>{formatDbDate(row.createdAt)}</TableCell>
                  <TableCell>{row.senderName}</TableCell>
                  <TableCell>{row.recipientName}</TableCell>
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
                  <TableCell
                    sx={{
                      maxWidth: 200,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {row.comment}
                  </TableCell>
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

export default PendingTable;
