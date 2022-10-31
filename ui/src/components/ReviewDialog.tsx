import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import { ChangeEvent, useContext, useEffect, useState } from "react";
import { AppContext } from "../utils/common/context";
import { formatDbDate } from "../utils/common/helpers";
import {
  AwardsConfiguration,
  AwardStatusUpdateData,
  HistoryTableRow,
  RequestStatus,
} from "../utils/types";
import AwardPanel from "./AwardPanel";
import StatusName from "./common/StatusName";

interface ReviewDialogProps {
  configuration: AwardsConfiguration;
  handleClose: (event?: object, reason?: string) => void;
  handleSave: (submission: AwardStatusUpdateData) => void;
  open: boolean;
  requestRow: HistoryTableRow | null;
}

/** Show settings form */
function ReviewDialog(props: ReviewDialogProps) {
  const { configuration, handleClose, handleSave, open, requestRow } = props;
  const appInfo = useContext(AppContext);

  const [actionStatus, setActionStatus] = useState<RequestStatus>();
  const [comment, setComment] = useState<string>();
  const [readonly, setReadonly] = useState<boolean>(true);

  useEffect(() => {
    setActionStatus(undefined);
    setComment(undefined);
  }, [open]);

  useEffect(() => {
    if (requestRow?.status) {
      setReadonly(
        !appInfo.isInstructor ||
          !["PENDING", "SUBMITTED"].includes(requestRow?.status)
      );
    }
  }, [appInfo, requestRow]);

  /** Handles submission of the form data */
  const onSubmit = (e: any) => {
    e.preventDefault();
    if (requestRow && actionStatus) {
      const submission: AwardStatusUpdateData = {
        id: requestRow.id,
        status: actionStatus,
      };
      if ((comment?.length || 0) > 0) {
        submission.instructorComment = comment;
      }
      handleSave(submission);
    }
  };

  const handleActionChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newStatus = e.target.value as RequestStatus;
    setActionStatus(newStatus);
  };

  const handleCommentChange = (e: ChangeEvent<HTMLInputElement>) => {
    const commentVal = e.target.value;
    setComment(commentVal);
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      {requestRow && (
        <Box p={2}>
          <form onSubmit={onSubmit}>
            <DialogTitle>Review Award Submission</DialogTitle>
            <DialogContent>
              <Box mb={3}>
                <DialogContentText>
                  Review or take action on an award submission.
                </DialogContentText>
              </Box>
              {/* RECIPIENT NAME */}
              <Box display={"flex"} mt={1} mb={2} alignItems={"center"}>
                <Box mr={2}>
                  <FormLabel>
                    <Typography fontWeight={"bold"}>Recipient:</Typography>
                  </FormLabel>
                </Box>
                <Typography>{requestRow.recipientName}</Typography>
              </Box>
              {/* REQUEST DATE */}
              <Box display={"flex"} mt={1} mb={2} alignItems={"center"}>
                <Box mr={2}>
                  <FormLabel>
                    <Typography fontWeight={"bold"}>Created:</Typography>
                  </FormLabel>
                </Box>
                <Typography>{formatDbDate(requestRow.createdAt)}</Typography>
              </Box>
              {/* REQUEST TYPE */}
              <Box p={1} mb={2} sx={{ maxWidth: 600, width: "100%" }}>
                <AwardPanel award={requestRow} configuration={configuration} />
              </Box>
              {/* INSTRUCTOR ACTION CHOICE */}
              {readonly ? (
                <Box>
                  {/* DISPLAY ACTION TAKEN */}
                  <Box display={"flex"} mt={1} mb={2} alignItems={"center"}>
                    <Box mr={2}>
                      <FormLabel>
                        <Typography fontWeight={"bold"}>
                          Instructor Action:
                        </Typography>
                      </FormLabel>
                    </Box>
                    <StatusName status={requestRow.status} />
                  </Box>
                  {/* DISPLAY ACTION TAKEN */}
                  {requestRow.status !== "SUBMITTED" && (
                    <Box display={"flex"} mt={1} mb={2} alignItems={"center"}>
                      <Box mr={2}>
                        <FormLabel>
                          <Typography fontWeight={"bold"}>
                            Action Date:
                          </Typography>
                        </FormLabel>
                      </Box>
                      <Typography>
                        {formatDbDate(requestRow.updatedAt)}
                      </Typography>
                    </Box>
                  )}
                  {requestRow.instructorComment && (
                    <Box
                      display={"flex"}
                      flexDirection={"column"}
                      mt={1}
                      mb={2}
                    >
                      {/* INSTRUCTOR COMMENT */}
                      <Box mb={2}>
                        <FormLabel>
                          <Typography fontWeight={"bold"}>
                            Instructor Comment:
                          </Typography>
                        </FormLabel>
                      </Box>
                      <Box pl={2}>
                        <TextField
                          fullWidth
                          aria-label="A comment on the request made by the instructor"
                          value={requestRow.instructorComment || ""}
                          multiline
                          minRows={1}
                          maxRows={6}
                          InputProps={{
                            readOnly: true,
                          }}
                        />
                      </Box>
                    </Box>
                  )}
                </Box>
              ) : (
                <Box>
                  <FormControl>
                    <FormLabel>
                      <Typography fontWeight={"bold"}>
                        Instructor Action:
                      </Typography>
                    </FormLabel>
                    <Box pl={2}>
                      <RadioGroup
                        id="instructor-action"
                        name="instructor-action"
                        aria-labelledby="instructor-action"
                        onChange={handleActionChange}
                      >
                        <FormControlLabel
                          value="ACCEPTED"
                          control={<Radio required />}
                          label="Accept"
                        />
                        <FormControlLabel
                          value="REJECTED"
                          control={<Radio required />}
                          label="Reject"
                        />
                      </RadioGroup>
                    </Box>
                  </FormControl>
                  <Box display={"flex"} flexDirection={"column"} mt={1} mb={2}>
                    <Box mb={2}>
                      <FormLabel>
                        <Typography fontWeight={"bold"}>
                          Instructor Comment
                          {actionStatus === "REJECTED" ? " (Required)" : ""}:
                        </Typography>
                      </FormLabel>
                    </Box>
                    <Box pl={2}>
                      <TextField
                        fullWidth
                        required={actionStatus === "REJECTED"}
                        aria-label="An input for the instructor to comment on the request"
                        multiline
                        rows={6}
                        value={comment}
                        onChange={handleCommentChange}
                      />
                    </Box>
                  </Box>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose} variant="outlined">
                {readonly ? "Close" : "Cancel"}
              </Button>
              {!readonly && (
                <Button variant="contained" type="submit">
                  Save
                </Button>
              )}
            </DialogActions>
          </form>
        </Box>
      )}
    </Dialog>
  );
}

export default ReviewDialog;
