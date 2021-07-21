import React, { useEffect } from 'react';
import { Grid, Typography, Button, CircularProgress, List, Divider } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import AppMessage from '../../globals/AppMessage';
import webHelper from '../../globals/webHelper';

import Cookies from 'universal-cookie';
import StatusBarContext from '../../globals/StatusBarContext';
import Notification from '../../components/Notifications/Notification';
import Offer from '../Exchange/OfferDetailView/Offer';
import TypedOffer from './TypedOffer';
const cookies = new Cookies();
// import { Redirect } from 'react-router-dom';

const styles = (theme) => ({
    root: {
        width: '100%',
        '& > * + *': {
            marginTop: theme.spacing(2),
        },
    },
    notificationsText: {
        margin: theme.spacing()
    },
    dashboardContainer: {
        margin: 'auto',
    },
    innerDashboardContainer: {
        flexWrap: 'inherit'
    },
    coolButton: {
        background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
        borderRadius: 3,
        border: 0,
        color: 'white',
        height: 48,
        padding: '0 30px',
        boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
        width: '70%'
    },
    buttonContainer: {
        marginTop: theme.spacing(3),

        marginLeft: theme.spacing(1),
        textAlignLast: 'center'
    },
    nothingToShowText: {
        textAlign: 'center', fontStyle: 'italic', color: theme.palette.utility.noContent
    },
    divider: {
        marginTop: theme.spacing(),
        height: '100%',
        position: 'fixed',
    },
    notificationsContainer: {

        marginLeft: theme.spacing(1)
    },
    loadingIcon: {
        margin: theme.spacing()
    }
});

function TypedOfferList(props) {

    const { classes, offers, heading, loading, noContent, reload } = props;

    return <React.Fragment>
        <Typography className={classes.notificationsText}>{heading}</Typography>
        <Divider />
        {loading ?
            <Grid
                className={classes.loadingIcon}
                container
                direction="row"
                justify="center"
                alignItems="center">
                <Grid item className={classes.loadingIconItem}>
                    <CircularProgress />
                </Grid>
            </Grid>
            :
            <React.Fragment>
                <List>
                    {offers?.length > 0 ?
                        <React.Fragment>
                            {offers?.map(offer => <TypedOffer reload={reload} offerId={offer._id} selectedCatId={offer.categoryId} />)}
                        </React.Fragment>
                        :
                        <Typography className={classes.nothingToShowText}>
                            {noContent}
                        </Typography>
                    }

                </List>
            </React.Fragment>
        }

    </React.Fragment>
}



export default withStyles(styles)(TypedOfferList);