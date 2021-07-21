import { Chip, Grid, Paper, Typography, withStyles, Badge } from '@material-ui/core';

import React from 'react';


import { AccessTime as EnrolledIcon, AccountTree as OwnerIcon, Check as AttendeeIcon, Group } from '@material-ui/icons';
import OfferDraggableDialog from './OfferDraggableDialog';
import UserAvatar from '../../../components/UserAvatar';

const styles = (theme) => ({
    offer: {
        margin: theme.spacing(),
        padding: theme.spacing(),
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
    enrolled: {
        color: theme.palette.utility.status.enrolled
    },
    offeror: {
        color: theme.palette.utility.status.offeror
    },
    attendee: {
        color: theme.palette.utility.status.attendee
    }
})

function Offer(props) {

    const [dialog, setDialog] = React.useState(false);
    const [elevationLevel, setElevationLevel] = React.useState(1);
    const { offer, classes, selectedCat, forceUpdate } = props;

    const handleClickOffer = () => {
        setDialog(true);
    }


    const generateTags = function () {
        let JSXTags = [];

        offer.tags.forEach(tag => {
            JSXTags.push(
                <Grid item>
                    <Chip variant="outlined" color="secondary" size="small" label={tag} />
                </Grid>
            )
        });

        return JSXTags;
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
                    <div style={{ fontWeight: "bold" }}>
                        {`${requirement.requirementValue}`}
                    </div>
                </Grid>
            );
        });

        return requirementsJSX;
    }

    const generateOfferStatusIcon = () => {
        let statusJSX;
        switch (offer.relation) {
            case 'enrolled':
                statusJSX = <EnrolledIcon className={classes.enrolled} />
                break;
            case 'offeror':
                statusJSX = <OwnerIcon className={classes.offeror} />
                break;
            case 'attendee':
                statusJSX = <AttendeeIcon className={classes.attendee} />
                break;
            default:
                break;
        }

        return statusJSX;
    }

    return (
        <React.Fragment>
            <Paper className={classes.offer} elevation={elevationLevel} onMouseLeave={() => { setElevationLevel(1) }} onMouseEnter={() => { setElevationLevel(3) }} key={offer._id} onClick={handleClickOffer} style={{ cursor: "pointer" }} variant={dialog ? "outlined" : "elevation"}>
                <Grid container
                    direction="column"
                    spacing={1}>
                    <Grid item >
                        <Grid
                            container
                            direction="row"
                            justify="space-between"
                            alignItems="center"
                        >
                            <Grid item>
                                <Typography variant="h6">
                                    {offer.title}
                                </Typography>
                            </Grid>
                            <Grid item>
                                <Typography variant="h6">
                                    {generateOfferStatusIcon()}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item >
                        <Grid
                            container
                            direction="row"
                            justify="flex-start"
                            alignItems="center"
                            spacing={2}
                        >
                            <Grid item>
                                <Grid container
                                    direction="row"
                                    justify="flex-start"
                                    alignItems="center"
                                    spacing={1}
                                >
                                    <Grid item>
                                        <Badge invisible={!offer.enrollingAttendees?.length > 0} variant="dot" color="secondary" >
                                            <Group />
                                        </Badge>
                                    </Grid>
                                    <Grid item>
                                        {(offer.maxAttendees > 0)
                                            ? `${offer.attendeeCount} / ${offer.maxAttendees}`
                                            : offer.attendeeCount
                                        }
                                    </Grid>
                                </Grid>
                            </Grid>
                            {generateRequirementFields()}
                        </Grid>

                    </Grid>
                    <Grid item >
                        <Typography style={{ overflowWrap: 'anywhere', whiteSpace: 'break-spaces' }}>
                            {offer.description}
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Grid container
                            justify="space-between"
                            direction="row"
                            className={classes.tagsContainer}
                        >
                            <Grid item>
                                <Grid container
                                    alignItems="center"
                                    spacing={1}
                                >
                                    {generateTags()}
                                </Grid>
                            </Grid>
                            <Grid item>
                                <UserAvatar user={offer.offeror} />
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Paper>
            <OfferDraggableDialog offer={offer} selectedCat={selectedCat} dialog={dialog} setDialog={setDialog} forceUpdate={forceUpdate} />
        </React.Fragment>
    )
}

export default withStyles(styles)((Offer))
