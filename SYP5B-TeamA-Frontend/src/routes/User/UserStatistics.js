import { Avatar, Divider, Grid, List, ListItem, ListItemAvatar, ListItemText, Typography, withStyles } from '@material-ui/core';
import { Note, People, RateReview, Star } from '@material-ui/icons';
import React from 'react';

const styles = (theme) => ({
    statisticsAvatar: {
        color: theme.palette.utility.statistics,
        backgroundColor: 'inherit',
    },
    avatar: {
        fontSize: '1.8rem',
    },
    starAvatar: {
        fontSize: '2rem',
    },
    header: {
        fontSize: '1.8rem',
    },
    userStatisticsContainer: {
        padding: theme.spacing(2),
    },
});

function UserStatistics(props) {
    const { classes, user } = props;

    let avgRating = `User rating: ${user.statistics.averageRating}`;
    let reviewCount = `Reviews: ${user.statistics.reviewCount}`;
    let studentCount = `Enrolled students: ${user.statistics.studentCount}`;
    let offerCount = `Offers: ${user.statistics.offerCount}`;

    return (
        <Grid container
        direction="column"
        justify="flex-start"
        alignItems="stretch"
        spacing={1}
        className={classes.userStatisticsContainer}
        >
            <Grid item>
                <Typography className={classes.header}>Statistics</Typography>
            </Grid>
            <Grid item>
                <Divider/>
            </Grid>
            <Grid item>
                <List>
                    <ListItem>
                        <ListItemAvatar>
                            <Avatar className={classes.statisticsAvatar}>
                                <Star className={classes.starAvatar}/>
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText>
                            {avgRating}
                        </ListItemText>
                    </ListItem>
                    <ListItem>
                        <ListItemAvatar>
                            <Avatar className={classes.statisticsAvatar}>
                                <RateReview className={classes.avatar}/>
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText>
                            {reviewCount}
                        </ListItemText>
                    </ListItem>
                    <ListItem>
                        <ListItemAvatar>
                            <Avatar className={classes.statisticsAvatar}>
                                <People className={classes.avatar}/>
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText>
                            {studentCount}
                        </ListItemText>
                    </ListItem>
                    <ListItem>
                        <ListItemAvatar>
                            <Avatar className={classes.statisticsAvatar}>
                                <Note className={classes.avatar}/>
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText>
                            {offerCount}
                        </ListItemText>
                    </ListItem>
                </List>
            </Grid>
        </Grid>
    );
}

export default withStyles(styles)(UserStatistics);