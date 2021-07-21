import React, { useEffect } from 'react';
import { Grid, Typography, Button, CircularProgress, List, Divider, withWidth } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import AppMessage from '../../globals/AppMessage';
import webHelper from '../../globals/webHelper';

import Cookies from 'universal-cookie';
import StatusBarContext from '../../globals/StatusBarContext';
import Notification from '../../components/Notifications/Notification';
import UserAvatar from '../../components/UserAvatar';
import TypedOfferList from './TypedOfferList';
import RelevantPeopleList from './RelevantPeopleList';
import { Link } from 'react-router-dom';
import NotificationsContext from '../../globals/NotificationsContext';
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
    topLevelContainer: {

        marginTop: theme.spacing(3)
    },
    nothingToShowText: {
        textAlign: 'center', fontStyle: 'italic', color: theme.palette.utility.noContent
    },
    divider: {
        marginTop: theme.spacing(),
        height: '100%',
        position: 'fixed',
    },
    rightContentContainer: {
        marginLeft: theme.spacing(1)
    },
    leftContentContainer: {
        marginRight: theme.spacing(1)
    },
    loadingIcon: {
        margin: theme.spacing()
    }
});

function Dashboard(props) {

    const { classes, width } = props;

    const [notifications, setNotifications] = React.useState([]);
    const [notificationLoading, setNotificationLoading] = React.useState(false);
    const [dashboardInfoLoading, setDashboardInfoLoading] = React.useState(false);
    const [resetted, setResetted] = React.useState(true);
    const [dashBoardInfo, setDashBoardInfo] = React.useState(null)
    const [buttonText, setButtonText] = React.useState('Press me >.<')

    const { setMessage } = React.useContext(StatusBarContext);
    const { setUnread } = React.useContext(NotificationsContext)

    const loadDashboardInfo = () => {
        setDashboardInfoLoading(true)
        webHelper.getDashboardInfo(cookies.get('token'))
            .then((resDashboardInfo) => {
                setDashBoardInfo(resDashboardInfo)
                setDashboardInfoLoading(false)
            }).catch(err => {
                setMessage(err);
            })
    }

    //#region Getting and managing data
    const loadDashboard = () => {
        setNotificationLoading(true)
        setDashboardInfoLoading(true)
        webHelper.getUnreadNotifications(cookies.get('token')).then((resNotifications) => {
            setNotifications(resNotifications.notifications);
            setNotificationLoading(false)
            return webHelper.getDashboardInfo(cookies.get('token'))
        }).then((resDashboardInfo) => {
            setDashBoardInfo(resDashboardInfo)
            setDashboardInfoLoading(false)
        }).catch(err => {
            setMessage(err);
        })
    }

    useEffect(() => {
        loadDashboard()
    }, [])

    function importantFunction() {
        setButtonText("OUAHH (ꈍoꈍ🌸)");

        setMessage(new AppMessage(AppMessage.types.SUCCESS, 'OUAHH (ꈍoꈍ🌸)', 123))
        if (resetted === true) {
            window.setTimeout(() => {
                setButtonText("Press me >.<");
                setResetted(true)
            }, 350);
            setResetted(false);
        }
    }

    function setNotificationsRead() {
        setNotificationLoading(true)
        webHelper.setNotificationsRead(cookies.get('token')).then(() => {
            return webHelper.getAllNotifications(cookies.get('token'))
        }).then((resNotifications) => {
            setNotifications(resNotifications.notifications);
            setNotificationLoading(false)
            setUnread(0)
        }).catch(err => {
            setMessage(err);
        })
    }

    function generateNotificationList() {
        return <React.Fragment>
            <Grid
                container
                direction="row"
                justify="space-between"
                alignItems="center"
            >
                <Grid item>
                    <Typography className={classes.notificationsText}>All unread notifications</Typography>
                </Grid>
                {notifications.length > 0 &&

                    <Grid item>
                        <Link onClick={setNotificationsRead} className={classes.setAllRead} >
                            Set all to read
                        </Link>
                    </Grid>
                }
            </Grid>
            <Divider />
            {notificationLoading ?
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
                        {notifications.length > 0 ?
                            <React.Fragment>
                                {notifications?.slice(0).reverse().map(notification => <Notification onRead={() => { loadDashboard() }} notification={notification} />)}
                            </React.Fragment>
                            :
                            <Typography className={classes.nothingToShowText}>
                                You dont have any unread notifications
                        </Typography>
                        }

                    </List>
                </React.Fragment>
            }

        </React.Fragment>
    }

    return (
        <Grid container spacing={3} >
            <Grid item xs={9} className={classes.dashboardContainer}>
                <Grid container direction={['md', 'lg', 'xl'].includes(width) ? 'row' : 'column'}
                    justify="center"
                    className={classes.innerDashboardContainer}>
                    <Grid item xs={12} md={6}>
                        <Grid container spacing={3} direction='column' alignItems="stretch">
                            <Grid item className={`${classes.leftContentContainer} ${classes.topLevelContainer}`}>
                                <RelevantPeopleList heading='Your Teachers' people={dashBoardInfo?.teachers} loading={dashboardInfoLoading} />
                            </Grid>
                            <Grid item className={classes.leftContentContainer}>
                                <RelevantPeopleList heading='Your Students' people={dashBoardInfo?.students} loading={dashboardInfoLoading} />
                            </Grid>
                            <Grid item className={classes.leftContentContainer}>
                                <TypedOfferList heading='Your offers' noContent="You do not provide any offers yet" offers={dashBoardInfo?.myOffers} loading={dashboardInfoLoading} reload={loadDashboardInfo}/>
                            </Grid>
                            <Grid item className={classes.leftContentContainer}>
                                <TypedOfferList heading='Offers you are attending' noContent="You are not attending any offers yet" offers={dashBoardInfo?.offersAttendeeIn} loading={dashboardInfoLoading} reload={loadDashboardInfo}/>
                            </Grid>
                        </Grid>

                    </Grid>
                    {
                        ['md', 'lg', 'xl'].includes(width) &&
                        <Divider className={classes.divider} orientation="vertical" flexItem />
                    }
                    <Grid item xs={12} md={6} >
                        <Grid container spacing={3} direction='column' alignItems="stretch">
                            <Grid item className={classes.buttonContainer}>
                                <Button id="drecksbutton" onClick={importantFunction} className={classes.coolButton} >
                                    {buttonText}
                                </Button>

                            </Grid>

                            <Grid item className={classes.rightContentContainer}>
                                <TypedOfferList heading='Offers you are enrolled in' noContent="You are not enrolled in any offers" offers={dashBoardInfo?.offersEnrolledIn} loading={dashboardInfoLoading} reload={loadDashboardInfo} />
                            </Grid>
                            <Grid item className={classes.rightContentContainer}>
                                {generateNotificationList()}
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>

            </Grid>
        </Grid>

    );
}



export default withStyles(styles)(withWidth()(Dashboard));