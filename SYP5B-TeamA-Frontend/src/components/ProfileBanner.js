import { Avatar, Grid, Typography, withStyles } from '@material-ui/core';
import React from 'react';

const styles = (theme) => ({
    avatar: {
        backgroundColor: theme.palette.utility.avatar,
        height: '6rem',
        width: '6rem',
    },
    avatarText: {
        paddingLeft: '0.3rem',
        paddingTop: '0.9rem',
        fontSize: '4rem',
    },
    nameText: {
        fontSize: '2.2rem',
        color: theme.palette.common.white,
    },
    profileBannerContainer: {
        paddingTop: theme.spacing(5),
        paddingBottom: theme.spacing(3.5),
        backgroundColor: theme.palette.primary.main,
    },
    bannerItem: {
        padding: theme.spacing(1.5)
    }
});

function ProfileBanner(props) {
    const { user, classes } = props;


    return (
        <Grid container
        direction="column"
        justify="center"
        alignItems="center"
        className={classes.profileBannerContainer}
        >
            <Grid item className={classes.bannerItem}>
                <Avatar className={classes.avatar}>
                    <Typography className={classes.avatarText}>
                        {user.firstname.substring(0, 1).toUpperCase()}
                    </Typography>
                </Avatar>
            </Grid>
            <Grid item className={classes.bannerItem}>
                <Typography className={classes.nameText}>
                    {`${user.firstname} ${user.lastname}`}
                </Typography>
            </Grid>
        </Grid>
    );
}

export default withStyles(styles)(ProfileBanner);