import { Avatar, Grid, IconButton, withStyles } from '@material-ui/core';
import React from 'react';
import { Link } from 'react-router-dom';

const styles = (theme) => ({
    avatarSmall: {
        width: theme.spacing(4),
        height: theme.spacing(4),
    },
    avatarText: {
        fontSize: 'inherit',
    }
});

function UserAvatar(props) {
    const { classes, user } = props;
    
    return (
        <Grid container
            alignItems="center"
            spacing={1}>
            <Grid item>
                <Link to={`/users/${user._id}`}>
                    <IconButton >
                        <Avatar src={user.pictureUrl} className={classes.avatarSmall}></Avatar>
                    </IconButton>
                </Link>
            </Grid>
            <Grid item className={classes.avatarText}>
                {user.firstname} {user.lastname}
            </Grid>
        </Grid>
    );
}

export default withStyles(styles)(UserAvatar);