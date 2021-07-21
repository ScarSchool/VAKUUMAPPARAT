import { CircularProgress, Grid, withStyles } from '@material-ui/core';
import React, { useEffect } from 'react';
import webHelper from '../../globals/webHelper';

import Cookies from 'universal-cookie';
import ProfileBanner from '../../components/ProfileBanner';
import UserAbout from './UserAbout';
import UserContact from './UserContact';
import UserStatistics from './UserStatistics';
import UserReviews from './Reviews/UserReviews';
import StatusBarContext from '../../globals/StatusBarContext';
const cookies = new Cookies();

const styles = (theme) => ({
    loadingContainer: {
        height: '100%',
        flexWrap: 'wrap'
    },
    loadingItem: {
        display: 'flex'
    },
});

function UserProfile(props) {
    const { classes } = props;

    const userId = props.match.params.id;
    const [user, setUser] = React.useState();
    const [loading, setLoading] = React.useState(true);

    const { setMessage } = React.useContext(StatusBarContext);

    const fetchData = () => {
        if (!user)
            setLoading(true)

        webHelper.getOneUserProfile(cookies.get('token'), userId).then((user) => {

            setUser(user);
            setLoading(false)
        }).catch((err) => {
            setMessage(err)

            setLoading(false)
        });
    }

    useEffect(() => {
        fetchData()
    }, [userId, setMessage]);

    if (loading)
        return (
            <Grid
                className={classes.loadingContainer}

                container
                direction="row"
                justify="center"
                alignItems="center">
                <Grid item className={classes.loadingItem}>
                    <CircularProgress />
                </Grid>
            </Grid>
        )

    const generateInfoComponents = () => {
        return (
            <Grid
                container
                direction="column"
            >
                <Grid item>
                    <Grid
                        container
                        direction="row"
                    >
                        <Grid item xs={12} md={7}>
                            <UserAbout user={user} />
                        </Grid>
                        <Grid item xs={12} md={5}>
                            <Grid container
                                direction="column"
                                justify="center"
                                alignItems="stretch"
                            >
                                <Grid item>
                                    <UserContact user={user} />
                                </Grid>
                                <Grid item>
                                    <UserStatistics user={user} />
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item>
                    <UserReviews fetchData={fetchData} user={user} />
                </Grid>
            </Grid>
        )
    }

    return (
        <Grid
            container
            direction="column"
            justify="flex-start"
            alignItems="stretch"
        >
            <Grid item>
                <ProfileBanner user={user} />
            </Grid>
            <Grid item>
                <Grid
                    container
                    direction="row"
                    justify="center"
                    alignItems="flex-start"
                >
                    <Grid item xs={10} sm={8}>
                        <Grid
                            container
                            direction="column"
                        >
                                    {generateInfoComponents()}
                                
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
}

export default withStyles(styles)(UserProfile);