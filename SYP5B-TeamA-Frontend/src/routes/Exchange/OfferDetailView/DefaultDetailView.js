import React from 'react';
import { Button, Chip, Dialog, DialogActions, DialogContent, Grid, Paper, TextField, withStyles, withWidth } from '@material-ui/core';

import Cookies from 'universal-cookie';
import webHelper from '../../../globals/webHelper';
import AttendeeList from '../../../components/AttendeeList';
import Draggable from 'react-draggable';
import LimitedTextField from '../../../components/LimitedTextField';
import StatusBarContext from '../../../globals/StatusBarContext';
import AppMessage from '../../../globals/AppMessage';
const cookies = new Cookies();


const styles = (theme) => ({
    offer: {
        margin: theme.spacing(),
        padding: theme.spacing()
    },
    attendeeList: {
        maxHeight: "100%",
        overflow: "auto",
        maxWidth: "30em"
    },
    button: {
        marginTop: theme.spacing(3),
    },
    tagsContainer: {
        marginTop: '0.5rem',
    },
    requirementsContainer: {
        marginBottom: theme.spacing(),
    },
    requirementValue: {
        fontWeight: "bold"
    }
})


const descriptionForm = React.createRef();


function DefaultDialog(props) {
    const { classes, width, offer, selectedCat, user } = props

    const { setMessage } = React.useContext(StatusBarContext);

    const [userRelation, setUserRelation] = React.useState(offer.relation);
    const [dialog, setDialog] = React.useState(false);

    const generateTags = () => {
        let JSXTags = [];

        offer.tags.forEach(tag => {
            JSXTags.push(
                <Grid item key={tag}>
                    <Chip variant="outlined" color="secondary" size="small" label={tag} />
                </Grid>
            )
        });

        return (
            <Grid
                container
                direction="row"
                justify="flex-start"
                alignItems="center"
                spacing={1}
            >{JSXTags}</Grid>
        )
    }

    // TODO: React component
    const generateRequirementFields = function () {
        let requirementsJSX = [];

        offer.requirements.forEach(requirement => {
            requirementsJSX.push(

                <Grid item>
                    <div>
                        {`${requirement.requirementName}: `}
                    </div>
                    <div className={classes.requirementValue}>
                        {`${requirement.requirementValue}`}
                    </div>
                </Grid>
            );
        });

        return requirementsJSX;
    }

    const onButtonEnroll = () => {
        setDialog(true);
    }

    const onEnroll = (event) => {
        event.preventDefault();

        webHelper.enrollInOffer(cookies.get('token'), selectedCat._id, offer._id, descriptionForm.current.value)
            .then((data) => {
                // TODO: Maybe it would be better to query this user

                setMessage(new AppMessage(AppMessage.types.INFO, 'Enrolled in offer', 200))
                offer.relation = 'enrolled';
                setUserRelation(offer.relation);
                setDialog(false);
            }).catch((err) => {
                setMessage(err)
            });
    }

    const onButtonLeave = () => {
        if (offer.relation === 'attendee') {
            webHelper.rejectAttendee(cookies.get('token'), selectedCat._id, offer._id, user.user._id)
                .then(() => onSuccess('Successfully left the offer')).catch((err) => {
                    setMessage(err)
                });
        } else {
            webHelper.removeEnrollment(cookies.get('token'), selectedCat._id, offer._id, user.user._id)
                .then(() => onSuccess('Successfully removed enrollment')).catch((err) => {
                    setMessage(err)
                });
        }
        function onSuccess(message) {
            setMessage(new AppMessage(AppMessage.types.INFO, message, 200))
            // TODO: Maybe it would be better to query this user
            offer.relation = 'none';
            setUserRelation(offer.relation);
        }
    }

    const PaperComponent = (props) => {
        return (
            <Draggable handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"]'}>
                <Paper {...props} style={{ width: '66%' }} />
            </Draggable>
        );
    }

    const generateDraggableDialog = () => {
        return (
            <Dialog
                open={dialog}
                onClose={() => { setDialog(false) }}
                aria-labelledby="draggable-dialog-title"
                PaperComponent={PaperComponent}
                maxWidth="xl" maxHeight="xl"
                className={classes.dialog}
            >
                <React.Fragment>
                    <DialogContent>
                        <LimitedTextField
                            autoFocus
                            margin="dense"
                            id="message"
                            label="Message*"
                            type="text"
                            initialValue=""
                            inputRef={descriptionForm}
                            limit={260}
                            fullWidth>
                        </LimitedTextField>
                    </DialogContent>

                    <DialogActions className={classes.dialogActions}>
                        <Button type="submit" onClick={onEnroll} color="primary">
                            Submit
                        </Button>
                    </DialogActions>
                </React.Fragment>
            </Dialog >
        )
    }

    return (
        <React.Fragment>
            <Grid
                container
                direction="row"
                justify="center"
                alignItems="stretch"
                className={classes.dialogContent}
                spacing={2}
                wrap={['md', 'lg', 'xl'].includes(width) ? "nowrap" : "wrap"}
            >
                <Grid item style={['xs', 'sm'].includes(width) ? { width: "100%" } : { width: "auto" }}>
                    <Grid
                        container
                        direction="row"
                        justify="flex-start"
                        alignItems="center"
                        spacing={2}
                        className={classes.requirementsContainer}
                        xs={8}
                    >
                        {generateRequirementFields()}
                        {offer.minAttendees > 0 &&
                            <Grid item>
                                <div>
                                    {"Minimum attendees: "}
                                </div>
                                <div style={{ fontWeight: "bold" }}>
                                    {offer.minAttendees}
                                </div>
                            </Grid>
                        }
                        {offer.maxAttendees > 0 &&
                            <Grid item>
                                <div>
                                    {"Maximum attendees: "}
                                </div>
                                <div style={{ fontWeight: "bold" }}>
                                    {offer.maxAttendees}
                                </div>
                            </Grid>
                        }
                    </Grid>
                    <Grid item>
                        <TextField
                            margin="dense"
                            id="description"
                            label="Description"
                            defaultValue={offer.description}
                            InputProps={{
                                readOnly: true,
                            }}
                            fullWidth
                            multiline
                        />
                    </Grid>
                </Grid>
                <Grid item>
                    <AttendeeList offer={offer} selectedCat={selectedCat} />
                </Grid>
            </Grid>
            <Grid className={classes.tagsContainer} >
                {generateTags()}
            </Grid>
            <Grid
                container
                direction="row"
                justify="flex-start"
                alignItems="center"
                style={{ marginTop: "1rem" }}
                spacing={2}
            >
                {offer.relation !== 'attendee' &&
                    <Grid item>
                        <Button
                            onClick={onButtonEnroll}
                            variant="outlined"
                            color="primary"
                            disabled={userRelation === 'enrolled'}
                        >
                            Ask to join
                    </Button>
                    </Grid>

                }
                <Grid item>
                    <Button
                        onClick={onButtonLeave}
                        variant="outlined"
                        color="secondary"
                        disabled={userRelation === 'none'}
                    >
                        Leave
                    </Button>
                </Grid>

            </Grid>
            {generateDraggableDialog()}
        </React.Fragment>
    )
}

export default withStyles(styles)(withWidth()(DefaultDialog));