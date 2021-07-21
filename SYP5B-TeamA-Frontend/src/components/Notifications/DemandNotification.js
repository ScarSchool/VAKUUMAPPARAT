import React from 'react';
import { Avatar, Badge, ListItem, ListItemAvatar, ListItemText, } from '@material-ui/core';
import { Link } from 'react-router-dom';

import LocalOfferIcon from '@material-ui/icons/LocalOffer';

function DemandNotification(props) {
    const { notification, read, setRead, customClass } = props

    return (
        <Link to={`/exchange/category/${notification.contentReference.content}`} style={{ color: 'inherit', textDecoration: 'inherit'}}>
            <ListItem key={notification._id} className={customClass} button onClick={() => setRead()}>
                <ListItemAvatar><Badge anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                    color="primary" variant="dot" invisible={read}><Avatar ><LocalOfferIcon /></Avatar></Badge></ListItemAvatar>
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

export default DemandNotification;