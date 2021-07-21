import { Avatar, Divider, Grid, List, ListItem, ListItemAvatar, ListItemText, Typography, withStyles } from '@material-ui/core';
import { Mail, Phone } from '@material-ui/icons';
import React from 'react';
import ListItemUnknown from '../../components/ListItemUnknown';

const styles = (theme) => ({
    contactAvatar: {
        color: theme.palette.getContrastText(theme.palette.utility.contactAvatar),
        backgroundColor: theme.palette.utility.contactAvatar
    },
    header: {
        fontSize: '1.8rem',
    },
    userContactContainer: {
        padding: theme.spacing(2),
    },
    noInformation: {
        fontStyle: 'italic',
        color: theme.palette.grey[600],
    }
});

function UserContact(props) {
    const { classes, user } = props;

    if (!user.privateInfo || user.privateInfo.visibility === 'private')
        return (
            <Grid container direction="column" justify="flex-start" alignItems="stretch" spacing={1}
            className={classes.userContactContainer}>
                <Grid item> <Typography className={classes.header}>Contact</Typography> </Grid>
                <Grid item> <Divider/> </Grid>
                <Grid item>
                    <List>
                        <ListItemUnknown>
                            This user does not want to share this information.
                        </ListItemUnknown>
                    </List>
                </Grid>
            </Grid>
        );

    let email = (!user.privateInfo.username) ? 'n / a' : user.privateInfo.username;
    let phoneNumber = (!user.privateInfo.phoneNumber) ? 'No information' : user.privateInfo.phoneNumber;

    return (
        <Grid container
        direction="column"
        justify="flex-start"
        alignItems="stretch"
        spacing={1}
        className={classes.userContactContainer}
        >
            <Grid item>
                <Typography className={classes.header}>Contact</Typography>
            </Grid>
            <Grid item>
                <Divider/>
            </Grid>
            <Grid item>
                <List>
                    <ListItem>
                        <ListItemAvatar>
                            <Avatar className={classes.contactAvatar}>
                                <Mail/>
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText className={!user.privateInfo.username ? classes.noInformation : undefined}>
                            {email}
                        </ListItemText>
                    </ListItem>
                    <ListItem>
                        <ListItemAvatar>
                            <Avatar className={classes.contactAvatar}>
                                <Phone/>
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText className={!user.privateInfo.phoneNumber ? classes.noInformation : undefined}>
                            {phoneNumber}
                        </ListItemText>
                    </ListItem>
                </List>
            </Grid>
        </Grid>
    );
}

export default withStyles(styles)(UserContact);