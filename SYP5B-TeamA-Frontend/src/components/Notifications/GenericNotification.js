import { Avatar, Badge, ListItem, ListItemAvatar, ListItemText, } from '@material-ui/core';
import { Info as InfoIcon, Warning as WarningIcon, Error as ErrorIcon } from '@material-ui/icons';
import React from 'react';

import AppMessage from '../../globals/AppMessage';

import StatusBarContext from '../../globals/StatusBarContext';


function GenericNotification(props) {
    const { setMessage } = React.useContext(StatusBarContext);
    const { notification, setRead, read, customClass } = props

    const generateAvatar = () => {
        switch (notification.type.toLowerCase()) {
            case AppMessage.types.INFO:
                return (
                    <Avatar>
                        <InfoIcon />
                    </Avatar>)
            case AppMessage.types.ERROR:
                return (
                    <Avatar>
                        <ErrorIcon />
                    </Avatar>
                )
            case AppMessage.types.WARNING:
                return (
                    <Avatar >
                        <WarningIcon />
                    </Avatar>
                )
            default:
                return (
                    <Avatar >
                        <InfoIcon />
                    </Avatar>
                )
        }
    }

    return (
        <ListItem button className={customClass} onClick={() => { setRead(); setMessage(new AppMessage(AppMessage.types.INFO, 'There is no detailed view for this notification', 404)) }}>
            <ListItemAvatar><Badge anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
            }}
                color="primary" variant="dot" invisible={read}>{generateAvatar()}</Badge></ListItemAvatar>
            <ListItemText primary={
                notification.title
            } secondary={
                notification.description
            }>
            </ListItemText>
        </ListItem>)

}

export default GenericNotification;