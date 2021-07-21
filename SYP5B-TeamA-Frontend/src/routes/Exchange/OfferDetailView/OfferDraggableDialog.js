import { Grid, Typography, withStyles } from '@material-ui/core';

import React from 'react';

import DraggableDialog from '../../../components/DraggableDialog';

import Cookies from 'universal-cookie';
import OfferorDialog from './OfferorDetailView';
import DefaultDialog from './DefaultDetailView';
import { AccessTime as EnrolledIcon, AccountTree as OwnerIcon, Check as AttendeeIcon } from '@material-ui/icons';
const cookies = new Cookies();

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
    avatarSmall: {
        width: theme.spacing(4),
        height: theme.spacing(4),
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

// forceUpdate is not mendatory
function OfferDraggableDialog(props) {
    const { offer, selectedCat, dialog, setDialog, forceUpdate, classes } = props;
    const user = cookies.get('accountinfo');

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
        return statusJSX
    }


    return (
        <DraggableDialog dialogTitle={<Grid
            container
            direction="row"
            justify="space-between"
            alignItems="center"
            title={offer.title}
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
        </Grid>} title={offer.title} maxWidth="xl" open={dialog} onClose={() => { setDialog(false); if (forceUpdate) forceUpdate(offer) }}>
            {
                user.sub === offer.offeror._id ?
                    <OfferorDialog selectedCat={selectedCat} offer={offer} forceUpdate={forceUpdate ? forceUpdate : () => setDialog(false)} />
                    :
                    <DefaultDialog selectedCat={selectedCat} offer={offer} user={user} />
            }
        </DraggableDialog>
    );
}

export default withStyles(styles)((OfferDraggableDialog))
