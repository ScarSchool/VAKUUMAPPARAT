import { Badge, Button, Divider, IconButton, ListItem, ListItemText, makeStyles, Menu, Typography } from '@material-ui/core';
import { Notifications as NotificationsIcon } from '@material-ui/icons';
import React, { useEffect } from 'react';
import Notification from '../Notifications/Notification';
import webHelper from '../../globals/webHelper'

import Cookies from 'universal-cookie';
import StatusBarContext from '../../globals/StatusBarContext';
import NotificationsContext from '../../globals/NotificationsContext'
import _ from 'underscore';
import AppMessage from '../../globals/AppMessage';
import { Link } from 'react-router-dom';
const cookies = new Cookies();

const useStyles = makeStyles(theme => ({
    menuListPadding: {
        paddingBottom: "0px"
    },
    showAllText: {
        margin: "auto",
        lineHeight: "normal",
        fontSize: "smaller"
    },
    notificationBell: {
        color: theme.palette.common.white
    },
    notificationBellInactive: {
        color: theme.palette.primary.dark
    },
    notification: {
        width: 500
    },
    notificationTitle: {
        opacity: 1
    },
    showAllNotificationsLink: {
        color: 'inherit',
        textDecoration: 'inherit'
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

function NotificationMenu(props) {
    const MAX_NOTIFICATIONS = 5;

    const classes = useStyles();

    const [anchorEl, setAnchorEl] = React.useState(null);
    const [incommingNotification, setIncommingNotification] = React.useState(null)
    const bellRef = React.createRef()
    const userId = cookies.get('accountinfo').user._id;

    const { setMessage } = React.useContext(StatusBarContext);
    const [notifications, setNotifications] = React.useState([]);

    const { unread, setUnread} = React.useContext(NotificationsContext)

    //#region Getting and managing data
    function longPoll() {
        webHelper.subscribeNotification(cookies.get('token'), userId)
            .then((newNoti) => {
                setIncommingNotification(newNoti)
            }).catch((err) => {
                err.message = `Could not subscribe notfication longpoll: ${err.message}`;
                // setMessage(err);
                console.warn(err.message);
            });
    }

    useEffect(() => {
        function refreshNotifications(newNotifications) {
            setNotifications(newNotifications.slice(0).reverse());
            longPoll();
        }

        function fetchData() {
            if (useDummyData) {
                refreshNotifications(dummyNotifications.notifications);
                setUnread(dummyNotifications.unread)
                return
            }
            webHelper.getSomeNotificationsByCount(cookies.get('token'), MAX_NOTIFICATIONS).then((resNotifications) => {
                refreshNotifications(resNotifications.notifications);
                return webHelper.getUnreadNotificationCount(cookies.get('token'))
            }).then((resUnread) => {
                setUnread(resUnread)
            }).catch(err => {
                setMessage(err);
            })
        }
        fetchData();
    }, [])

    useEffect(() => {
        document.title = `${unread > 0 ? `(${unread})` : ''} VAKUUMAPPARAT`
    }, [unread])

    useEffect(() => {
        if (incommingNotification === null)
            return
        setNotifications(notifications => [..._.last(notifications, MAX_NOTIFICATIONS - 1), incommingNotification].slice(0).reverse())
        setUnread(unread => incommingNotification.read ? unread : unread + 1)
        longPoll();
    }, [incommingNotification])

    //#endregion

    //#region User operations
    const handleBellClick = () => {
        setAnchorEl(bellRef.current);
    };
    const handleNotificationsMenuClose = () => {
        setAnchorEl(null);
    };

    const onRead = () => {
        setUnread(unread - 1)
    }

    return (
        <React.Fragment>
            <IconButton disabled={!(notifications?.length > 0)} onClick={handleBellClick} ref={bellRef}>
                <Badge color="secondary" badgeContent={unread}>
                    <NotificationsIcon className={notifications?.length > 0 ? classes.notificationBell : classes.notificationBellInactive} />
                </Badge>
            </IconButton>

            <Menu
                id="long-menu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleNotificationsMenuClose}
                anchorReference={bellRef}
                anchorOrigin={
                    { vertical: "bottom", horizontal: "right" }}
                anchorPosition={
                    { vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "bottom", horizontal: "right" }}
                MenuListProps={{
                    classes: { padding: classes.menuListPadding },
                }}
            >
                <ListItem divider disabled className={classes.notificationTitle}>
                    <ListItemText>Notifications</ListItemText>
                </ListItem>

                <Divider />

                {notifications?.map((notification, index) => <Notification key={index} customClass={classes.notification} onRead={onRead} notification={notification} />)}

                <Link to={`/notifications`} className={classes.showAllNotificationsLink}>
                    <ListItem button >
                        <Typography className={classes.showAllText}>Show all Notifications</Typography>
                    </ListItem>
                </Link>

            </Menu >
        </React.Fragment >
    )
    //#endregion
}

export default NotificationMenu;