import { Box, Button, InputLabel, TextField, Typography } from "@mui/material";
import { Dispatch, SetStateAction, useState } from "react";
import { useForm } from "react-hook-form";
import { AwardsConfiguration, AwardType, Recipient } from "../utils/types";
import AwardOption from "./AwardOption";
import ConfirmationDialog from "./common/ConfirmationDialog";

interface SelectionFormProps {
  selectedAward: AwardType;
  recipient: Recipient;
  configuration: AwardsConfiguration;
  setComment: Dispatch<SetStateAction<string>>;
  submitAward: () => void;
}

interface CommentForm {
  text: string;
}

/** Show basic header info */
export default function SelectionForm(props: SelectionFormProps) {
  const { selectedAward, recipient, configuration, setComment, submitAward } =
    props;
  const [open, setOpen] = useState(false);

  const confirmationMessage = `Are you sure you want to send the '${selectedAward.label}' badge to ${recipient.givenName} ${recipient.familyName}?`;

  // Form management
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<CommentForm>({
    defaultValues: {
      text: "",
    },
  });

  /** Handles submission of the form data */
  const onSubmit = (data: CommentForm) => {
    setComment(data.text);
    setOpen(true);
  };

  const handleCloseDialog = (event?: object, reason?: string) => {
    const reasonsToStayOpen = ["backdropClick"];
    if (reason && reasonsToStayOpen.includes(reason)) {
      return;
    }
    setOpen(false);
  };

  const handleConfirmDialog = () => {
    submitAward();
    setOpen(false);
  };

  return (
    <Box pt={4} display={"flex"} flexDirection={"column"} alignItems={"center"}>
      <Typography variant="h5">
        What {recipient.givenName} will receive:
      </Typography>
      <Box
        pt={4}
        display={"flex"}
        alignItems={"center"}
        gap={4}
        width={"100%"}
        maxWidth={"600px"}
      >
        <AwardOption award={selectedAward} />
        <Typography>{selectedAward.description}</Typography>
      </Box>
      <Box
        display={"flex"}
        width={"100%"}
        maxWidth={"600px"}
        pt={4}
        flexDirection={"column"}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <InputLabel htmlFor="note-input">
            Note {configuration.comments_required ? "(required)" : "(optional)"}
          </InputLabel>
          <TextField
            id="note-input"
            fullWidth
            multiline
            rows={4}
            error={!!errors.text}
            helperText={!!errors.text && "This field is required."}
            {...register("text", { required: configuration.comments_required })}
          />
          <Box display={"flex"} justifyContent={"flex-end"} pt={2}>
            <Button type="submit" variant="contained">
              Send
            </Button>
          </Box>
        </form>
      </Box>
      {/* DIALOG */}
      <ConfirmationDialog
        handleClose={handleCloseDialog}
        handleConfirm={handleConfirmDialog}
        open={open}
        message={confirmationMessage}
      />
    </Box>
  );
}
