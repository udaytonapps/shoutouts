import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

interface ConfirmationDialogProps {
  handleClose: () => void;
  handleConfirm: () => void;
  open: boolean;
  message?: string;
  loading: boolean;
}

export default function ConfirmationDialog(props: ConfirmationDialogProps) {
  const { handleClose, handleConfirm, open, message, loading } = props;
  return (
    <div>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="confirmation-dialog-title"
        aria-describedby="confirmation-dialog-description"
      >
        <DialogTitle id="confirmation-dialog-title">Confirmation</DialogTitle>
        <DialogContent>
          <DialogContentText id="confirmation-dialog-description">
            {message || "Are you sure?"}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button disabled={loading} onClick={handleClose} variant="outlined">
            Cancel
          </Button>
          <Button
            disabled={loading}
            onClick={handleConfirm}
            autoFocus
            variant={"contained"}
          >
            {loading ? <CircularProgress /> : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
