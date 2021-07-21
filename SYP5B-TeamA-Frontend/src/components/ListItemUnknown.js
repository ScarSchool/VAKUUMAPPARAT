import { Avatar, ListItem, ListItemAvatar, ListItemText, makeStyles, withStyles } from '@material-ui/core';
import { HelpOutline } from '@material-ui/icons';
import React from 'react';

const styles = makeStyles(theme => ({
    noInfoAvatar: {
        backgroundColor: theme.palette.common.white,
        width: '2rem',
        height: '2rem',
    },
    noInfoIcon: {
        color: theme.palette.text,
        fontSize: '2rem',
    }
}));

function ListItemUnknown(props) {
    const { classes } = props;

    return (
        <ListItem>
            <ListItemAvatar>
                <Avatar className={classes.noInfoAvatar}>
                    <HelpOutline  className={classes.noInfoIcon}/>
                </Avatar>
            </ListItemAvatar>
            <ListItemText>
                {props.children}
            </ListItemText>
        </ListItem>
    );
}

export default withStyles(styles)(ListItemUnknown);