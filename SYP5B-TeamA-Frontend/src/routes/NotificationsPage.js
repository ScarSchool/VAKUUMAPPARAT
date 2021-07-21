import { CircularProgress, Divider, Grid, Link, List, makeStyles, Typography } from '@material-ui/core';
import { Notifications as NotificationsIcon } from '@material-ui/icons';
import React, { useEffect } from 'react';
import Notification from '../components/Notifications/Notification';
import webHelper from '../globals/webHelper'

import Cookies from 'universal-cookie';
import StatusBarContext from '../globals/StatusBarContext';
import NotificationsContext from '../globals/NotificationsContext';
const cookies = new Cookies();

const useStyles = makeStyles(theme => ({
    notificationContent: {
        width: '100%',
        margin: 'auto'
    },
    notificationHeader: {
        fontSize: '2rem',
        margin: theme.spacing()
    },
    sideNavigation: {
        position: 'absolute',
        margin: theme.spacing(2),
        fontSize: '1.125rem'
    },
    headingContainer: {
        marginLeft: theme.spacing(),
        marginTop: theme.spacing(),
    },
    loadingIcon: {
        height: '100%',
        flexWrap: 'wrap',
        margin: theme.spacing(2)
    },
    selectedOption: {
        color: theme.palette.primary, cursor: 'pointer'
    },
    navBarOption: {
        color: 'inherit', cursor: 'pointer'
    },
    setAllRead: {
        color: 'inherit', cursor: 'pointer', marginRight: theme.spacing(2)
    },
    notificationsIcon: {
        fontSize: "2rem"
    },
    loadingIconItem: {
        display: 'flex'
    },
    nothingToShowText: {
        textAlign: 'center', fontStyle: 'italic', color: theme.palette.utility.noContent
    }
}));

//If you want to use dummydata just set this value to true and vice versa
const useDummyData = false;

const dummyNotifications = {
    unread: 1,
    notifications:
        [{
            "_id": "6068617f7264594e8c6d17a5",
            "title": "Someone created an offer in your demanded category 'Mathematik'",
            "type": "info",
            "read": false,
            "timestamp": "2021-04-03T12:37:19.393Z",
            "description": "Okcool",
            "contentReference": {
                "type": "demand",
                "content": '60687d4647d14357a0d0e8ae'
            }
        }]
}

function NotificationsPage(props) {
    const classes = useStyles();

    const [notifications, setNotifications] = React.useState([]);
    const [currentSelected, setCurrentSelected] = React.useState(0);
    const [loading, setLoading] = React.useState(false);

    const { setMessage } = React.useContext(StatusBarContext);
    const { setUnread } = React.useContext(NotificationsContext)

    //#region Getting and managing data


    const getAllNotifications = () => {
        setLoading(true)
        setCurrentSelected(0)
        webHelper.getAllNotifications(cookies.get('token')).then((resNotifications) => {
            setNotifications(resNotifications.notifications);
            setLoading(false)
        }).catch(err => {
            setMessage(err);
        })
    }

    const getUnreadNotifications = () => {
        setLoading(true)
        setCurrentSelected(1)
        webHelper.getUnreadNotifications(cookies.get('token')).then((resNotifications) => {

            setNotifications(resNotifications.notifications);
            setLoading(false)
        }).catch(err => {
            setMessage(err);
        })
    }

    const setNotificationsRead = () => {
        webHelper.setNotificationsRead(cookies.get('token')).then(() => {
            getAllNotifications();
            setUnread(0)
        })
    }


    useEffect(() => {
        if (useDummyData) {
            setNotifications(dummyNotifications.notifications);
            return
        }

        getAllNotifications()
    }, [])

    //#endregion

    //#region User operations
    return (
        <React.Fragment>
            <Grid
                container
                direction="row"
                justify="space-between"
                alignItems="center"
            >
                <Grid item>
                    <Grid
                        container
                        direction="row"
                        justify="flex-start"
                        alignItems="center"
                        className={classes.headingContainer}
                    >
                        <Grid item>
                            <NotificationsIcon className={classes.notificationsIcon} />
                        </Grid>
                        <Grid item>
                            <Typography variant="h3" className={classes.notificationHeader}>Notifications</Typography>
                        </Grid>
                    </Grid>
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
            <Grid
                container
                direction="row"
                justify="flex-start"
            >
                <Grid item xs={2} className={classes.sideNavigation}>
                    <Grid
                        container
                        direction="column"
                        justify="center"
                        alignItems="flex-start"
                        spacing={1}
                    >
                        <Grid item>
                            <Link onClick={getAllNotifications} className={currentSelected === 0 ? classes.selectedOption : classes.navBarOption} >
                                Show all Notifications
                            </Link>
                        </Grid>

                        <Grid item>
                            <Link onClick={getUnreadNotifications} className={currentSelected === 1 ? classes.selectedOption : classes.navBarOption}>
                                Show unread Notifications
                            </Link>
                        </Grid>

                    </Grid>
                </Grid>
                <Grid item xs={7} className={classes.notificationContent}>
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
                        <List>
                            {!(notifications?.length > 0) ?
                                <Typography className={classes.nothingToShowText} >Nothing to show here</Typography>
                                :
                                <React.Fragment>
                                    {notifications?.slice(0).reverse().map(notification => <Notification onRead={() => { currentSelected === 0 ? getAllNotifications() : getUnreadNotifications() }} notification={notification} />)}
                                </React.Fragment>
                            }
                        </List>
                    }

                </Grid>
            </Grid>
        </React.Fragment>
    )
    //#endregion
}

export default NotificationsPage;