import React from 'react';

import webHelper from '../../globals/webHelper';

import Cookies from 'universal-cookie';
import StatusBarContext from '../../globals/StatusBarContext';
import AppMessage from '../../globals/AppMessage';
import DemandNotification from './DemandNotification';
import OfferNotification from './OfferNotification'
import GenericNotification from './GenericNotification'
import ProfileNotification from './ProfileNotification';
const cookies = new Cookies();

function Notification(props) {

    const { setMessage } = React.useContext(StatusBarContext);
    const { doneSteps, generateDoneStepByType } = React.useContext(StatusBarContext);
    const { notification, onRead, customClass } = props
    const [read, setStateRead] = React.useState(notification.read)

    const setRead = () => {
        if (!read)
            webHelper.readNotification(cookies.get('token'), notification._id).then(() => {
                setStateRead(true)
                notification.read = true;
                onRead();
            }).catch((err) => {
                console.debug(`Could not set Notification to 'read'`, err);
                setMessage(new AppMessage(AppMessage.types.WARNING, `Could not set Notification to 'read'`, err.statuscode))
            })
    }

    const generateNotificationByType = () => {
        switch (notification.contentReference?.type) {
            //Offers
            case 'offeraccepted':
                return <OfferNotification customClass={customClass} notification={notification} read={read} setRead={setRead} />
            case 'offerenroll':
                return <OfferNotification customClass={customClass} notification={notification} read={read} setRead={setRead} />
            //Profile
            case 'profilereview':
                return <ProfileNotification customClass={customClass} notification={notification} read={read} setRead={setRead} />
            case 'profilereply':
                return <ProfileNotification customClass={customClass} notification={notification} read={read} setRead={setRead} />
            case 'profilelike':
                return <ProfileNotification customClass={customClass} notification={notification} read={read} setRead={setRead} />
            //Demand
            case 'demand':
                return <DemandNotification customClass={customClass} notification={notification} read={read} setRead={setRead} />
            default:
                return <GenericNotification customClass={customClass} notification={notification} read={read} setRead={setRead} />
        }
    }

    return (generateNotificationByType());
}

export default Notification;