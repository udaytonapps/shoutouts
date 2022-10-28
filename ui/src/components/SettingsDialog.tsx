import { Close } from "@mui/icons-material";
import {
  Box,
  Button,
  ButtonBase,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  InputLabel,
  TextField,
  Typography,
} from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { AppContext } from "../utils/common/context";
import { AwardsConfiguration, AwardType } from "../utils/types";
import AwardOption from "./AwardOption";

interface SettingsDialogProps {
  handleClose: (event?: object, reason?: string) => void;
  handleSave: (
    newSettings: AwardsConfiguration,
    exclusionIds: string[]
  ) => void;
  open: boolean;
  settings: AwardsConfiguration | null;
  potentialTypes: AwardType[];
  allTypes: AwardType[];
}

/** Show settings form */
function SettingsDialog(props: SettingsDialogProps) {
  const { handleClose, handleSave, open, settings, potentialTypes, allTypes } =
    props;

  const [typeDisabledMap, setTypeDisabledMap] = useState<
    Record<string, boolean>
  >({});

  const appInfo = useContext(AppContext);

  // Form management
  const {
    // control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AwardsConfiguration>();

  const modPref = watch("moderation_enabled", true);
  const anonPref = watch("anonymous_enabled", true);
  const seePref = watch("recipient_view_enabled", true);
  const emailPref = watch("notifications_enabled", true);
  const leaderPref = watch("leaderboard_enabled", true);
  const commentsReqPref = watch("comments_required", true);

  useEffect(() => {
    if (settings && open) {
      //   const formattedDate = DateTime.fromFormat(
      //     settings.use_by_date,
      //     DB_DATE_TIME_FORMAT
      //   ).toISODate();
      setValue("notifications_enabled", settings.notifications_enabled);
      setValue("configuration_id", settings.configuration_id);
      setValue("moderation_enabled", settings.moderation_enabled);
      setValue("anonymous_enabled", settings.anonymous_enabled);
      setValue("recipient_view_enabled", settings.recipient_view_enabled);
      setValue("leaderboard_enabled", settings.leaderboard_enabled);
      setValue("comments_required", settings.comments_required);
      setValue("awarded_value", settings.awarded_value);
      setValue("received_value", settings.received_value);
    } else if (open) {
      setValue("notifications_enabled", true);
      setValue("recipient_view_enabled", true);
      //   setValue("moderation_enabled", true);
      //   setValue("anonymous_enabled", true);
      setValue("leaderboard_enabled", true);
      //   setValue("comments_required", true);
    }
  }, [settings, open, setValue]);

  useEffect(() => {
    potentialTypes.forEach((type) => {
      typeDisabledMap[type.id] = false;
    });
    allTypes.forEach((type) => {
      if (typeDisabledMap[type.id] === undefined) {
        typeDisabledMap[type.id] = true;
      }
    });
    setTypeDisabledMap({ ...typeDisabledMap });
  }, [potentialTypes]);

  /** Handles submission of the form data */
  const onSubmit = (data: AwardsConfiguration) => {
    // Assemble main data
    const settingsToSubmit = data;
    settingsToSubmit.configuration_id = settings?.configuration_id;
    // Handle any special formatting, as needed
    // Also need to save any shoutout exclusions
    const exclusions: string[] = [];
    console.log(Object.keys(typeDisabledMap));
    Object.keys(typeDisabledMap).forEach((typeId) => {
      if (typeDisabledMap[typeId] === true) {
        exclusions.push(typeId);
      }
    });
    handleSave(settingsToSubmit, exclusions);
  };

  const toggleType = (id: string) => {
    typeDisabledMap[id] = !typeDisabledMap[id];
    setTypeDisabledMap({ ...typeDisabledMap });
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md">
      <Box p={2}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>Instructor Settings</DialogTitle>
          <DialogContent>
            {settings && (
              <Box mb={3}>
                <DialogContentText>
                  View or update the settings for Shoutouts!
                </DialogContentText>
              </Box>
            )}
            <Box display={"flex"} flexDirection={"row"}>
              <Box width={"50%"}>
                <Typography variant="h6">Shoutout Settings</Typography>
                {/* COLUMN 1 */}
                <Box>
                  {/* RECIPIENT VIEW */}
                  <Box mb={2}>
                    <Box
                      display={"flex"}
                      justifyContent={"start"}
                      alignItems={"center"}
                    >
                      <Checkbox
                        color="default"
                        // Make sure it is a boolean or it will change between defined/undefined (uncontrolled)
                        checked={!!seePref}
                        inputProps={{
                          "aria-label": "Learner view preference checkbox",
                          id: "recipient_view_enabled",
                        }}
                        {...register("recipient_view_enabled")}
                      />
                      <Box mr={3}>
                        <InputLabel htmlFor="recipient_view_enabled">
                          <Typography fontWeight={"bold"}>
                            Recipient View Enabled
                          </Typography>
                        </InputLabel>
                      </Box>
                    </Box>
                    <Box mb={1} pl={5.5}>
                      <Typography variant="body2">
                        Students can see the Shoutouts they've received.
                      </Typography>
                    </Box>
                  </Box>
                  {/* LEADERBOARD */}
                  <Box mb={2}>
                    <Box
                      display={"flex"}
                      justifyContent={"start"}
                      alignItems={"center"}
                    >
                      <Checkbox
                        color="default"
                        // Make sure it is a boolean or it will change between defined/undefined (uncontrolled)
                        checked={!!leaderPref}
                        inputProps={{
                          "aria-label":
                            "Leaderboard display preference checkbox",
                          id: "leaderboard_enabled",
                        }}
                        {...register("leaderboard_enabled")}
                      />
                      <Box mr={3}>
                        <InputLabel htmlFor="leaderboard_enabled">
                          <Typography fontWeight={"bold"}>
                            Display Leaderboard
                          </Typography>
                        </InputLabel>
                      </Box>
                    </Box>
                    <Box mb={1} pl={5.5}>
                      <Typography variant="body2">
                        Allow learners to see a listing of top 5 Shoutout
                        recipients (which can be anonymous).
                      </Typography>
                    </Box>
                  </Box>
                  {/* MODERATION */}
                  <Box mb={2}>
                    <Box
                      display={"flex"}
                      justifyContent={"start"}
                      alignItems={"center"}
                    >
                      <Checkbox
                        color="default"
                        // Make sure it is a boolean or it will change between defined/undefined (uncontrolled)
                        checked={!!modPref}
                        inputProps={{
                          "aria-label": "Moderation preference checkbox",
                          id: "moderation_enabled",
                        }}
                        {...register("moderation_enabled")}
                      />
                      <Box mr={3}>
                        <InputLabel htmlFor="moderation_enabled">
                          <Typography fontWeight={"bold"}>
                            Enable Moderation
                          </Typography>
                        </InputLabel>
                      </Box>
                    </Box>
                    <Box mb={1} pl={5.5}>
                      <Typography variant="body2">
                        Require that Shoutouts are approved before being sent.
                      </Typography>
                    </Box>
                  </Box>
                  {/* ANONYMOUS */}
                  <Box mb={2}>
                    <Box
                      display={"flex"}
                      justifyContent={"start"}
                      alignItems={"center"}
                    >
                      <Checkbox
                        color="default"
                        // Make sure it is a boolean or it will change between defined/undefined (uncontrolled)
                        checked={!!anonPref}
                        inputProps={{
                          "aria-label": "Anonymous preference checkbox",
                          id: "anonymous_enabled",
                        }}
                        {...register("anonymous_enabled")}
                      />
                      <Box mr={3}>
                        <InputLabel htmlFor="anonymous_enabled">
                          <Typography fontWeight={"bold"}>
                            Anonymous to Students
                          </Typography>
                        </InputLabel>
                      </Box>
                    </Box>
                    <Box mb={1} pl={5.5}>
                      <Typography variant="body2">
                        Students will not see who sent them a Shoutout.
                      </Typography>
                    </Box>
                  </Box>
                  {/* COMMENTS REQUIRED */}
                  <Box mb={2}>
                    <Box
                      display={"flex"}
                      justifyContent={"start"}
                      alignItems={"center"}
                    >
                      <Checkbox
                        color="default"
                        // Make sure it is a boolean or it will change between defined/undefined (uncontrolled)
                        checked={!!commentsReqPref}
                        inputProps={{
                          "aria-label": "Comments required preference checkbox",
                          id: "comments_required",
                        }}
                        {...register("comments_required")}
                      />
                      <Box mr={3}>
                        <InputLabel htmlFor="comments_required">
                          <Typography fontWeight={"bold"}>
                            Require Comments
                          </Typography>
                        </InputLabel>
                      </Box>
                    </Box>
                    <Box mb={1} pl={5.5}>
                      <Typography variant="body2">
                        Require that learners include a comment with Shoutouts
                        they send.
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
              {/* COLUMN 2 */}
              <Box pl={3}>
                {/* EMAIL NOTIFICATIONS */}
                <Typography variant="h6">Notifications</Typography>
                <Box mb={2}>
                  <Box
                    display={"flex"}
                    justifyContent={"start"}
                    alignItems={"center"}
                  >
                    <Checkbox
                      color="default"
                      // Make sure it is a boolean or it will change between defined/undefined (uncontrolled)
                      checked={!!emailPref}
                      inputProps={{
                        "aria-label": "Email notifications preference checkbox",
                        id: "notifications_enabled",
                      }}
                      {...register("notifications_enabled")}
                    />
                    <Box mr={3}>
                      <InputLabel htmlFor="notifications_enabled">
                        <Typography fontWeight={"bold"}>
                          Email notifications for {appInfo.username}
                        </Typography>
                      </InputLabel>
                    </Box>
                  </Box>
                  <Box mb={1} pl={5.5}>
                    <Typography variant="body2">
                      Receive emails when students send Shoutouts.
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="h6">Values</Typography>
                <Box width={"100%"}>
                  {/* SEND VALUE */}
                  <Box
                    display={"flex"}
                    mt={1}
                    mb={1}
                    justifyContent={"space-between"}
                  >
                    <Box mt={2}>
                      <InputLabel
                        htmlFor="enable-moderation"
                        sx={{ whiteSpace: "normal" }}
                      >
                        <Typography fontWeight={"bold"} pr={1}>
                          Value of sending a Shoutout:
                        </Typography>
                      </InputLabel>
                    </Box>
                    <Box minWidth={75} width={75}>
                      <TextField
                        autoFocus
                        margin="dense"
                        size="small"
                        id="awarded_value"
                        type="number"
                        error={!!errors.awarded_value}
                        InputLabelProps={{ shrink: false }}
                        InputProps={{
                          inputProps: {
                            style: { textAlign: "center" },
                          },
                        }}
                        {...register("awarded_value", {
                          //   required: true,
                          pattern: /^[0-9]+$/,
                          min: 0,
                        })}
                        helperText={
                          errors.awarded_value &&
                          "Must be a non-negative whole number"
                        }
                      />
                    </Box>
                  </Box>
                  {/* SEND VALUE */}
                  <Box
                    display={"flex"}
                    mt={1}
                    mb={1}
                    justifyContent={"space-between"}
                  >
                    <Box mt={2}>
                      <InputLabel
                        htmlFor="enable-moderation"
                        sx={{ whiteSpace: "normal" }}
                      >
                        <Typography fontWeight={"bold"} pr={1}>
                          Value of receiving a Shoutout:
                        </Typography>
                      </InputLabel>
                    </Box>
                    <Box minWidth={75} width={75}>
                      <TextField
                        autoFocus
                        margin="dense"
                        size="small"
                        id="received_value"
                        type="number"
                        error={!!errors.received_value}
                        InputLabelProps={{ shrink: false }}
                        InputProps={{
                          inputProps: {
                            style: { textAlign: "center" },
                          },
                        }}
                        {...register("received_value", {
                          //   required: true,
                          pattern: /^[0-9]+$/,
                          min: 0,
                        })}
                        helperText={
                          errors.received_value &&
                          "Must be a non-negative whole number"
                        }
                      />
                    </Box>
                  </Box>
                  {/* <Typography variant="h6">Limitations</Typography> */}
                  {/* SEND LIMIT */}
                  {/* <Box display={"flex"} mt={1} mb={2}>
                  <Box mr={2} mt={1}>
                    <InputLabel
                      htmlFor="enable-moderation"
                      sx={{ whiteSpace: "normal" }}
                    >
                      <Typography fontWeight={"bold"}>
                        A student may award up to:
                      </Typography>
                    </InputLabel>
                  </Box>
                  <Box minWidth={150} width={150}>
                    <TextField
                      autoFocus
                      margin="dense"
                      size="small"
                      id="awarded_value"
                      type="number"
                      error={!!errors.awarded_value}
                      InputLabelProps={{ shrink: false }}
                      InputProps={{
                        inputProps: {
                          style: { textAlign: "center" },
                        },
                      }}
                      {...register("awarded_value", {
                        required: true,
                        pattern: /^[0-9]+$/,
                        min: 1,
                      })}
                      helperText={
                        errors.awarded_value &&
                        "Must be a positive whole number"
                      }
                    />
                  </Box>
                </Box> */}
                  {/* RECEIPT LIMIT */}
                  {/* <Box display={"flex"} mt={1} mb={2}>
                  <Box mr={2} mt={1}>
                    <InputLabel
                      htmlFor="enable-moderation"
                      sx={{ whiteSpace: "normal" }}
                    >
                      <Typography fontWeight={"bold"}>
                        A student may receive up to:
                      </Typography>
                    </InputLabel>
                  </Box>
                  <Box minWidth={150} width={150}>
                    <TextField
                      autoFocus
                      margin="dense"
                      size="small"
                      id="awarded_value"
                      type="number"
                      error={!!errors.awarded_value}
                      InputLabelProps={{ shrink: false }}
                      InputProps={{
                        inputProps: {
                          style: { textAlign: "center" },
                        },
                      }}
                      {...register("awarded_value", {
                        required: true,
                        pattern: /^[0-9]+$/,
                        min: 1,
                      })}
                      helperText={
                        errors.awarded_value &&
                        "Must be a positive whole number"
                      }
                    />
                  </Box>
                </Box> */}

                  {/* EXPIRATION / USE BY DATE */}
                  {/* <Box display={"flex"} mb={2}>
              <Box minWidth={300} mr={2} mt={2}>
                <InputLabel htmlFor="use-by-date">
                  <Typography fontWeight={"bold"}>
                    Date that tokens must be used by:
                  </Typography>
                </InputLabel>
              </Box>
              <Box>
                <TextField
                  margin="dense"
                  size="small"
                  id="use-by-date"
                  type="date"
                  error={!!errors.use_by_date}
                  InputLabelProps={{ shrink: false }}
                  {...register("use_by_date", {
                    required: true,
                  })}
                  helperText={errors.use_by_date && "Must be a valid date"}
                />
              </Box>
            </Box> */}
                </Box>
              </Box>
            </Box>
            {/* AWARD VALUE */}
            {/* RECEIPT VALUE */}
            {/* AWARD LIMIT */}
            {/* LIMIT TIMEFRAME */}
            {/* AWARD TYPES */}
            <Typography variant="h6">Potential Shoutouts</Typography>
            <Typography variant="body2">
              Click to toggle the Shoutouts that are available. All are enabled,
              by default.
            </Typography>
            <Box
              pt={4}
              display={"flex"}
              justifyContent={"center"}
              gap={1}
              flexWrap={"wrap"}
            >
              {allTypes.map((award, i) => (
                <Box key={`recipient-${i}`} p={0.1} display={"flex"}>
                  <ButtonBase onClick={() => toggleType(award.id)}>
                    {typeDisabledMap[award.id] && (
                      <Close
                        sx={{
                          position: "absolute",
                          top: -15,
                          fontSize: "140px",
                        }}
                      />
                    )}
                    <AwardOption
                      award={award}
                      size={"small"}
                      disabled={!typeDisabledMap[award.id]}
                    />
                  </ButtonBase>
                </Box>
              ))}
            </Box>
          </DialogContent>
          <DialogActions>
            {settings?.configuration_id && (
              <Button onClick={handleClose} variant="outlined">
                Cancel
              </Button>
            )}
            <Button variant="contained" type="submit">
              Save
            </Button>
          </DialogActions>
        </form>
      </Box>
    </Dialog>
  );
}

export default SettingsDialog;
