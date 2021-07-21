import React from 'react';
import { Avatar, Badge, ListItem, ListItemAvatar, ListItemText, } from '@material-ui/core';
import { Link } from 'react-router-dom';

import { PermContactCalendar } from '@material-ui/icons';

function ProfileNotification(props) {
    const { notification, read, setRead, customClass } = props

    return (
        <Link to={`/users/${notification.contentReference.content}`} href={`/users/${notification.contentReference.content}`} style={{ color: 'inherit', textDecoration: 'inherit'}}>
            <ListItem key={notification._id} className={customClass} button onClick={() => setRead()}>
                <ListItemAvatar><Badge anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                    color="primary" variant="dot" invisible={read}><Avatar ><PermContactCalendar /></Avatar></Badge></ListItemAvatar>
                <ListItemText primary={
                    notification.title
                } secondary={
                    notification.description
                }>
                </ListItemText>
            </ListItem>
        </Link>
    )
}

export default ProfileNotification;