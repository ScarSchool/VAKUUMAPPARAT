import { Button, Grid, TextField, withStyles, withWidth } from '@material-ui/core';

import React from 'react';

import DraggableDialog from '../../../components/DraggableDialog';

import Cookies from 'universal-cookie';
import { Cancel, Delete as DeleteIcon, Save as SaveIcon } from '@material-ui/icons';
import webHelper from '../../../globals/webHelper';
import validateFullRequired from '../../../globals/formValidator';
import { isEqual } from 'underscore';
import configuration from '../../../configs/config';
import TagPicker from '../../../components/TagPicker';
import AttendeeList from '../../../components/AttendeeList';
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
        maxWidth: "40em",
        height: "12.5em",
    },
    button: {
        marginTop: theme.spacing(3),
    },
    dialogActions: {
        justifyContent: "center"
    },
    subheader: {
        backgroundColor: theme.palette.background.paper
    }
});

const offerForm = {
    title: React.createRef(),
    description: React.createRef(),
    maxAttendees: React.createRef(),
    minAttendees: React.createRef()
}

const defaultRequirements = configuration.defaultRequirements;

function OfferorDialog(props) {
    const { setMessage } = React.useContext(StatusBarContext);
    const { selectedCat, offer, classes, forceUpdate, width } = props;

    const [delDialog, setDelDialog] = React.useState(false);
    const [errors, setErrors] = React.useState({});
    const [uncommittedOfferTags, setUncommittedOfferTags] = React.useState(Object.assign([], offer.tags));


    let uncommittedRequirements = [];

    // TODO: Cant edit those that are not provided by backend
    defaultRequirements.forEach((reqName) => {
        let foundReq = offer.requirements.find(reqObj => {
            return reqObj.requirementName === reqName;
        });

        if (!foundReq)
            uncommittedRequirements.push({ "requirementName": reqName });
        else
            uncommittedRequirements.push({ "requirementName": foundReq.requirementName, "requirementValue": foundReq.requirementValue });
    });

    uncommittedRequirements.forEach(requirement => {
        offerForm[requirement.requirementName] = React.createRef();
    });

    const validateForm = (offer) => {
        let errors = validateFullRequired(offer);

        if ((isNaN(offerForm.minAttendees.current.value)))
            errors.minAttendees = 'MinAttendees has to be an integer!'
        if ((isNaN(offerForm.maxAttendees.current.value)))
            errors.maxAttendees = 'MaxAttendees has to be an integer!'

        setErrors(errors);
        return Object.keys(errors).length === 0;
    }

    const onTagsChanged = (event, value) => {
        setUncommittedOfferTags(value);
    }

    const onSubmitChange = (event) => {
        event.preventDefault();

        let requirements = [];

        uncommittedRequirements.forEach(reqObj => {
            let reqName = reqObj.requirementName;
            let reqValue = offerForm[reqName].current.value;
            if (reqValue !== '')
                requirements.push({
                    'requirementName': reqName,
                    'requirementValue': reqValue
                });
        });

        let newOffer = {
            'title': offerForm.title.current.value,
            'requirements': requirements,
        };

        if (!validateForm(newOffer))
            return;

        newOffer.description = offerForm.description.current.value;
        newOffer.minAttendees = offerForm.minAttendees.current.value === '' ? -1 : offerForm.minAttendees.current.value;
        newOffer.maxAttendees = offerForm.maxAttendees.current.value === '' ? -1 : offerForm.maxAttendees.current.value;

        if (!isEqual(uncommittedOfferTags, offer.tags)) {
            newOffer.tags = uncommittedOfferTags;
        }

        webHelper.patchOneOfferOfCategory(
            cookies.get('token'),
            selectedCat._id, offer._id,
            newOffer
        ).then((offer) => {
            setMessage(new AppMessage(AppMessage.types.INFO, 'Change successful', 200))
        }).catch((err) => {
            console.error(`Got an error while trying to patch a category: ${err}`);
            setMessage(err)
        });
    }

    const onDelete = event => {
        event.preventDefault();

        webHelper.deleteOneOfferOfCategory(
            cookies.get('token'),
            selectedCat._id,
            offer._id
        ).then(() => {
            setMessage(new AppMessage(AppMessage.types.SUCCESS, 'Deletion successful', 204))
            forceUpdate(null);
        }).catch((err) => {
            console.error(`Got an error while trying to patch a category: ${err}`);
            setMessage(err)
        });
    }

    const generateForm = () => {
        return (
            <React.Fragment>
                <TextField
                    autoFocus
                    margin="dense"
                    id="title"
                    label="Title"
                    type="text"
                    inputRef={offerForm.title}
                    defaultValue={offer.title}
                    error={Boolean(errors.title)}
                    helperText={errors.title}
                    fullWidth
                />
                <TextField
                    margin="dense"
                    id="description"
                    label="Description"
                    type="text"
                    inputRef={offerForm.description}
                    defaultValue={offer.description}
                    error={Boolean(errors.description)}
                    helperText={errors.description}
                    fullWidth
                    multiline
                />
                <Grid
                    container
                    direction="row"
                    justify="space-between"
                    alignItems="flex-start"
                    spacing={2}
                >
                    <Grid item xs={6}>
                        <TextField

                            margin="dense"
                            id="maxAttendees"
                            label="Minimum Attendees"
                            type="tele"
                            InputLabelProps={{ shrink: true }}
                            inputRef={offerForm.minAttendees}
                            defaultValue={offer.minAttendees === -1 ? '' : offer.minAttendees}
                            error={Boolean(errors.minAttendees)}
                            helperText={errors.minAttendees}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField

                            margin="dense"
                            id="maxAttendees"
                            label="Maximum Attendees"
                            type="tele"
                            InputLabelProps={{ shrink: true }}
                            inputRef={offerForm.maxAttendees}
                            defaultValue={offer.maxAttendees === -1 ? '' : offer.maxAttendees}
                            error={Boolean(errors.maxAttendees)}
                            helperText={errors.maxAttendees}
                            fullWidth
                        />
                    </Grid>

                    {generateRequirementFields() /* TODO: React component */}
                    <Grid item xs={12}>
                        <TagPicker defaultTags={uncommittedOfferTags} createMode onChange={onTagsChanged} />
                    </Grid>
                </Grid>

                <Grid
                    container
                    direction="row"
                    justify="space-between"
                    alignItems="center"
                >
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        size="medium"
                        className={classes.button}
                        startIcon={<SaveIcon />}
                    >
                        Save
                        </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        className={classes.button}
                        startIcon={<DeleteIcon />}
                        onClick={() => setDelDialog(true)}
                    >
                        Delete
                        </Button>
                    <DraggableDialog outsourceclasses={classes} title="Are you sure?" open={delDialog} submittext={"Delete"} onClose={() =>
                        setDelDialog(false)} dialogactions={
                            <React.Fragment>
                                <Button
                                    style={{ justifySelf: "center" }}
                                    variant="contained"
                                    color="secondary"
                                    className={classes.button}
                                    startIcon={<DeleteIcon />}
                                    onClick={onDelete}
                                >
                                    Delete
                            </Button>
                                <Button
                                    style={{ justifySelf: "center" }}
                                    variant="contained"
                                    color="default"
                                    className={classes.button}
                                    startIcon={<Cancel />}
                                    onClick={() => setDelDialog(false)}>
                                    Cancel
                            </Button>
                            </React.Fragment>
                        } />
                </Grid>
            </React.Fragment>
        )
    }

    // TODO: React component
    const generateRequirementFields = function () {
        let requirementsJSX = [];

        uncommittedRequirements.forEach(requirement => {
            requirementsJSX.push(

                <Grid item xs={6} key={requirement.requirementName}>
                    <TextField
                        margin="dense"
                        id={requirement.requirementName}
                        label={requirement.requirementName}
                        type="text"
                        InputLabelProps={{ shrink: true }}
                        inputRef={offerForm[requirement.requirementName]}
                        defaultValue={requirement.requirementValue}
                        fullWidth
                    />
                </Grid>
            );
        });

        return requirementsJSX;
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
                wrap={['lg', 'xl'].includes(width) ? "nowrap" : "wrap"}
            >
                <Grid item style={['xs', 'sm', 'md'].includes(width) ? { width: "100%" } : { width: "inherit" }}>
                    <form noValidate onSubmit={onSubmitChange}>
                        {generateForm(offer, classes)}
                    </form>
                </Grid>

                {/* TODO: find out how to align items on the left whne minimized */}
                <Grid item style={['xs', 'sm', 'md'].includes(width) ? { display: "contents" } : { display: "block", width: "min-content" }}>
                    <AttendeeList offer={offer} selectedCat={selectedCat} offerorDetailView />
                </Grid>
            </Grid>
        </React.Fragment>
    )
}


export default withStyles(styles)(withWidth()(OfferorDialog));