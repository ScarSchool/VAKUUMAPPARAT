import { Avatar, Badge, IconButton, List, ListItem, ListItemAvatar, ListItemText, ListSubheader, Tab, Tabs, Typography, withStyles, withWidth } from '@material-ui/core';

import React from 'react';


import Cookies from 'universal-cookie';
import { Check as CheckIcon, Close, Delete as DeleteIcon } from '@material-ui/icons';
import webHelper from '../globals/webHelper';
import { Link } from 'react-router-dom';
import StatusBarContext from '../globals/StatusBarContext';
import AppMessage from '../globals/AppMessage';
const cookies = new Cookies();

const styles = (theme) => ({
    offer: {
        margin: theme.spacing(),
        padding: theme.spacing()
    },
    attendeeList: {
        maxHeight: theme.spacing(50),
        overflow: "auto"
    },
    button: {
        marginTop: theme.spacing(3),
    },
    dialogActions: {
        justifyContent: "center"
    },
    subheader: {
        backgroundColor: theme.palette.background.paper
    },
    attendeeCount:{
        height: 'auto'
    },
    descriptionText: {
        wordWrap: "anywhere"
    },
    tabPanel: {
        width: "100%"
    }
});


const compactMode = ['xs', 'sm', 'md'];

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`tabpanel-${index}`}
            aria-labelledby={`tab-${index}`}
            {...other}
        >
            {value === index && (
                <React.Fragment>
                    { children}
                </React.Fragment>
            )}
        </div>
    );
}

function AttendeeList(props) {

    const { setMessage } = React.useContext(StatusBarContext);
    const { offerorDetailView, offer: offerProp, selectedCat, classes, width } = props;
    const [tabValue, setTabValue] = React.useState("1");

    const [offer, setOffer] = React.useState(Object.assign({}, offerProp));

    const handleTabSwitch = (event, newValue) => {
        setTabValue(newValue);
    };

    const onAcceptAttendee = (enroll) => {
        webHelper.acceptAttendee(
            cookies.get('token'),
            selectedCat._id, offer._id,
            enroll.user._id
        ).then((res) => {
            offer.enrollingAttendees.splice(offer.enrollingAttendees.findIndex(filter => filter.user._id === enroll.user._id), 1);
            offer.attendees.push(enroll.user)

            setOffer(Object.assign({}, offer));
            setMessage(new AppMessage(AppMessage.types.INFO, 'Accepted attendee'))
        }).catch(err => {
            setMessage(err)
        })
    }

    const onRemoveEnroll = (enroll) => {
        webHelper.removeEnrollment(
            cookies.get('token'),
            selectedCat._id, offer._id,
            enroll.user._id
        ).then((res) => {
            offer.enrollingAttendees.splice(offer.enrollingAttendees.findIndex(filter => filter.user._id === enroll.user._id), 1);

            setOffer(Object.assign({}, offer));
            setMessage(new AppMessage(AppMessage.types.SUCCESS, 'Rejected attendee'))
        }).catch(err => {
            setMessage(err)
        })
    }

    const onRejectAttendee = (attendee) => {
        webHelper.rejectAttendee(
            cookies.get('token'),
            selectedCat._id, offer._id,
            attendee._id
        ).then((res) => {

            offer.attendees.splice(offer.attendees.findIndex(filter => filter._id === attendee._id), 1);

            setOffer(Object.assign({}, offer));
            setMessage(new AppMessage(AppMessage.types.SUCCESS, 'Removed attendee'))
        }).catch(err => {
            setMessage(err)
        })
    }


    const generatePendingAttendeeList = () => {
        let JSXAttendees = [];

        offer.enrollingAttendees.forEach((enrolling) => {
            JSXAttendees.push(
                <ListItem key={enrolling.user._id /* TODO: here id */} dense>
                    <ListItemAvatar >
                        <Link to={`/users/${enrolling.user._id}`}>
                            <IconButton >
                                <Avatar src={enrolling.user.pictureUrl} />
                            </IconButton>
                        </Link>
                    </ListItemAvatar>
                    <ListItemText primary={`${enrolling.user?.firstname} ${enrolling.user?.lastname}`} secondary={<Typography className={classes.descriptionText}>{enrolling.description}</Typography>} />
                    <IconButton onClick={() => onAcceptAttendee(enrolling)}>
                        <CheckIcon />
                    </IconButton>
                    <IconButton onClick={() => onRemoveEnroll(enrolling)}>
                        <Close />
                    </IconButton>
                </ListItem>

            )
        });
        return (
            <React.Fragment>
                { JSXAttendees.length > 0 ?
                    JSXAttendees
                    :
                    <ListItem>
                        <ListItemText primary="This Offer does not have any attendees yet" />
                    </ListItem>
                }
            </React.Fragment>
        );
    }



    //Maybe safe this for later i dunno
    const generateAcceptedAttendeeList = (deleteMode) => {
        let JSXPendingAttendees = [];


        offer.attendees.forEach(attendee => {
            JSXPendingAttendees.push(
                <ListItem key={attendee._id} dense>
                    <ListItemAvatar >
                        <Link to={`/users/${attendee._id}`}>
                            <IconButton >
                                <Avatar src={attendee.pictureUrl} />
                            </IconButton>
                        </Link>
                    </ListItemAvatar>
                    <ListItemText primary={`${attendee.firstname} ${attendee.lastname}`} />
                    {
                        deleteMode &&
                        <IconButton onClick={() => onRejectAttendee(attendee)}>
                            <DeleteIcon />
                        </IconButton>
                    }
                </ListItem>)
        });

        return (
            <React.Fragment>
                {
                    JSXPendingAttendees.length > 0 ?
                        JSXPendingAttendees
                        :
                        <ListItem>
                            <ListItemText primary="This Offer does not have any attendees yet" />
                        </ListItem>
                }
            </React.Fragment>
        )
    }

    const generateOfferorAttendeeList = () => {
        return (
            <React.Fragment>
                <Tabs
                    value={tabValue}
                    onChange={handleTabSwitch}
                    indicatorColor="primary"
                    textColor="primary"
                    scrollButtons="off"
                    centered
                    style={compactMode.includes(width) ? { width: "100%" } : { width: "max-content" }}
                >
                    <Tab label="attendees" value="1"></Tab>
                    <Tab label={
                        <Badge badgeContent={offer.enrollingAttendees.length} variant="dot" color="secondary" >pending
                    </Badge>} value="2" />
                </Tabs>

                <TabPanel value={tabValue} index="1" className={classes.tabPanel}>
                    <List className={classes.attendeeList}>
                        {generateAcceptedAttendeeList(true)}
                    </List>
                </TabPanel>
                <TabPanel value={tabValue} index="2" className={classes.tabPanel}>
                    <List className={classes.attendeeList} >
                        {generatePendingAttendeeList()}
                    </List>
                </TabPanel>
            </React.Fragment>
        )
    }

    const generateAttendeeCount = () => {
        return (
            <ListItem className={classes.attendeeCount} key="AttendeeCount">
                <ListItemText primary={`${offer.attendeeCount} ${offer.maxAttendees > 0 ? `/ ${offer.maxAttendees}` : ''}`} />
            </ListItem>
        )
    }

    const generateDefaultAttendeeList = () => {
        return (
            <React.Fragment>
                {
                    offer.relation === "attendee" && offer.attendees ?
                        <List subheader={<ListSubheader>Attendees</ListSubheader>} style={compactMode.includes(width) ? { width: "100%" } : { width: "auto" }} className={classes.attendeeList}>
                            {generateAcceptedAttendeeList()}
                        </List>
                        :
                        <List subheader={<ListSubheader>Attendees</ListSubheader>} style={compactMode.includes(width) ? { width: "100%", height: "auto" } : { width: "auto", height: "auto" }} className={classes.attendeeList}>
                            {generateAttendeeCount()}
                        </List>
                }
            </React.Fragment>
        )
    }


    return (
        offerorDetailView ?
            generateOfferorAttendeeList() :
            generateDefaultAttendeeList()
    )
}


export default withStyles(styles)(withWidth()(AttendeeList));