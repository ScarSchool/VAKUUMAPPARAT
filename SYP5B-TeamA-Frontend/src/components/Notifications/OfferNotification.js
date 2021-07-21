import { Avatar, Badge,  ListItem, ListItemAvatar, ListItemText, } from '@material-ui/core';
import React from 'react';

import AppMessage from '../../globals/AppMessage';
import webHelper from '../../globals/webHelper';

import Cookies from 'universal-cookie';
import OfferDraggableDialog from '../../routes/Exchange/OfferDetailView/OfferDraggableDialog';
import StatusBarContext from '../../globals/StatusBarContext';
const cookies = new Cookies();

function OfferNotification(props) {
    const { setMessage } = React.useContext(StatusBarContext);
    const { notification, read, setRead, customClass } = props
    const [dialog, setDialog] = React.useState(false);
    const [offer, setOffer] = React.useState(null);

    const handleClick = () => {
        setRead();

        //TODO: this has not been tested
        webHelper.getOneOfferOfCategory(cookies.get('token'), notification.contentReference.content.categoryId, notification.contentReference.content._id).then((offer) => {
            setOffer(offer);
            setDialog(true)
        }).catch((err) => {
            console.error(`Got an error while trying to patch a category: ${err}`);
            setMessage(new AppMessage(AppMessage.types.WARNING, 'There is no detailed view for this notification', err.status))
        });
    };

    const generateOfferDraggableDialog = () => {
        //This is a necessary workaround as it would otherwise kinda not render it or just crash the page
        if (dialog && offer) {
            return <OfferDraggableDialog offer={offer} dialog={dialog} selectedCat={{_id: notification.contentReference.content.categoryId}} setDialog={setDialog} />
        }
    }

    return (
        <React.Fragment>
            <ListItem key={notification._id} className={customClass} button onClick={handleClick}>
                <ListItemAvatar>
                    <Badge anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                        color="primary" variant="dot" invisible={read}>
                        <Avatar src={notification.contentReference.content.offeror.pictureUrl} />
                    </Badge>
                </ListItemAvatar>
                <ListItemText primary={
                    notification.title
                } secondary={
                    notification.description
                }>
                </ListItemText>
            </ListItem>
            {generateOfferDraggableDialog()}
        </React.Fragment>
    )
}

export default OfferNotification;