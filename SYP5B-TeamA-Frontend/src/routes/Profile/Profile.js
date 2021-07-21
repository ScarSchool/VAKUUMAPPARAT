import { Divider, Grid, Typography, withStyles } from '@material-ui/core';
import React, { useEffect } from 'react';

import AppMessage from '../../globals/AppMessage';
import ChangePasswordForm from './ChangePasswordForm';
import PrivateDataForm from './PrivateDataForm';

import ProfileBanner from '../../components/ProfileBanner';
import GeneralDataForm from './GeneralDataForm';
import webHelper from '../../globals/webHelper';
import SettingsForm from './SettingsForm';

import Cookies from 'universal-cookie';
import StatusBarContext from '../../globals/StatusBarContext';
const cookies = new Cookies();

const styles = (theme) => ({
    subHeading1: {
        fontSize: '1.8rem',
    },
    subHeading3: {
        fontSize: '1.4rem',
    },
    profileContainer: {
        margin: theme.spacing(1.5)
    },
    personalChangePasswordContainer: {
        width: '100%',
    },
    personalInfoContainer: {
        width: '100%',
        paddingTop: theme.spacing(0.5),
    },
    privacyContainer: {
        width: '100%'
    },
    settingsContainer: {
        width: '100%',
        paddingTop: theme.spacing(0.5),
    },
    generalInfoContainer: {
        width: '100%',
        paddingTop: theme.spacing(0.5),
    },
});

function Profile(props) {
    const { classes } = props;
    const userId = cookies.get('accountinfo').user._id;

    const [user, setUser] = React.useState({});
    const [loading, setLoading] = React.useState(true);
    
    const { setMessage } = React.useContext(StatusBarContext);

    useEffect(() => {
        webHelper.getOneUser(cookies.get('token'), userId).then((user) => {
            setUser(user);
            setLoading(false);
        }).catch((err) => {
            console.debug('DEBUG: Got an error in useEffect', err);
            setLoading(false);
            setMessage(err)
        });
    }, [userId, setMessage]);

    function userDataChanged(newUser) {
        let accInfo = cookies.get('accountinfo');
        accInfo.user = newUser;
        cookies.set('accountinfo', accInfo);
        setUser(newUser);

        setMessage(new AppMessage(AppMessage.types.SUCCESS, 'User data changed successfully.'));
    }

    if (loading)
        return (
            <p>Still loading...</p>
        )


    return (
        <Grid
            container
            direction="column"
            justify="center"
            alignItems="center"

        >
            <Grid item style={{ width: "100%" }}>
                <ProfileBanner user={user} />
            </Grid>
            <Grid item className={classes.profileContainer}>
                <Grid
                    container
                    direction="column"
                    justify="flex-start"
                    alignItems="center"
                >
                    <Grid item xs={8}>
                        <Typography className={classes.subHeading1}>General</Typography>
                        <Divider />

                        <Grid container
                            direction="column"
                            justify="center"
                            alignItems="center"
                            spacing={2}
                            className={classes.settingsContainer}
                        >
                            <Grid item className={classes.privacyContainer}>
                                <GeneralDataForm onSaveSuccess={userDataChanged} user={user} />
                            </Grid>

                        </Grid>

                        <Typography className={classes.subHeading1}>Personal data</Typography>
                        <Divider />
                        <Grid container
                            direction="column"
                            justify="center"
                            alignItems="center"
                            spacing={2}
                            className={classes.personalInfoContainer}
                        >
                            <Grid item>
                                <Typography className={classes.subHeading3}>Change private information</Typography>
                                <PrivateDataForm onSaveSuccess={userDataChanged} user={user} />
                            </Grid>
                            <Grid item className={classes.personalChangePasswordContainer}>
                                <Typography className={classes.subHeading3}>Change password</Typography>
                                <ChangePasswordForm user={user} />
                            </Grid>
                        </Grid>


                        <Typography className={classes.subHeading1}>Settings</Typography>
                        <Divider />
                        <Grid container
                            direction="column"
                            justify="center"
                            alignItems="center"
                            spacing={2}
                            className={classes.settingsContainer}
                        >
                            <Grid item className={classes.privacyContainer}>
                                <SettingsForm user={user} />
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
}

export default withStyles(styles)(Profile);